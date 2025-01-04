const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: false
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Socket.IO setup
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["*"],
        credentials: false
    },
    allowEIO3: true,
    transports: ['polling', 'websocket'],
    path: '/socket.io/',
    connectTimeout: 45000,
    pingTimeout: 30000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    maxHttpBufferSize: 1e8,
    allowUpgrades: true,
    cookie: false,
    perMessageDeflate: false,
    httpCompression: false
});

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Enable detailed logging
io.engine.on("connection_error", (err) => {
    console.log('Connection error:', err);
});

io.engine.on("headers", (headers, req) => {
    console.log('Headers:', headers);
});

// API Routes
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Math Game Backend API',
        status: 'running',
        endpoints: {
            auth: '/api/users/login and /api/users/register',
            websocket: '/socket.io/'
        }
    });
});

// Game state management
const games = new Map();

function generateQuestion(operation) {
  const num1 = Math.floor(Math.random() * 100);
  const num2 = Math.floor(Math.random() * 100);
    let question, answer;

    switch (operation) {
    case '+':
            question = `${num1} + ${num2}`;
            answer = num1 + num2;
      break;
    case '-':
            question = `${num1} - ${num2}`;
            answer = num1 - num2;
      break;
    case '*':
            question = `${num1} × ${num2}`;
            answer = num1 * num2;
      break;
    case '/':
            const divisor = Math.floor(Math.random() * 10) + 1;
            const dividend = divisor * (Math.floor(Math.random() * 10) + 1);
            question = `${dividend} ÷ ${divisor}`;
            answer = dividend / divisor;
            break;
    }
    return { question, answer };
}

// Socket.IO event handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinGame', ({ username, operation }) => {
        console.log(`${username} trying to join game with operation: ${operation}`);
        let gameRoom = null;

        // Find an available game or create a new one
        for (const [room, game] of games.entries()) {
            if (game.players.length === 1 && game.operation === operation && !game.started) {
                gameRoom = room;
                break;
            }
        }

        if (!gameRoom) {
            gameRoom = `game_${Date.now()}`;
            games.set(gameRoom, {
                players: [],
                operation,
                scores: {},
                currentQuestion: null,
                started: false
            });
            console.log(`Created new game room: ${gameRoom}`);
        }

        const game = games.get(gameRoom);

        // Prevent same user from joining twice
        if (game.players.find(p => p.username === username)) {
            console.log(`${username} already in game`);
            socket.join(gameRoom);
            socket.gameRoom = gameRoom;
            
            // Send current game state
            io.to(gameRoom).emit('playerCount', {
                count: game.players.length,
                players: game.players
            });

            if (game.started && game.currentQuestion) {
                socket.emit('gameStart', { players: game.players });
                socket.emit('newQuestion', game.currentQuestion);
            }
            return;
        }

        // Add player to game
        game.players.push({ id: socket.id, username });
        game.scores[username] = 0;
        
        socket.join(gameRoom);
        socket.gameRoom = gameRoom;

        console.log(`Players in room ${gameRoom}:`, game.players);

        // Notify ALL players about current state
        io.to(gameRoom).emit('playerCount', {
            count: game.players.length,
            players: game.players
        });

        // Start game if we have 2 players
        if (game.players.length === 2) {
            game.started = true;
            const question = generateQuestion(game.operation);
            game.currentQuestion = question;
            
            console.log(`Starting game in room ${gameRoom} with players:`, game.players);
            
            // Send game start event to all players
            io.to(gameRoom).emit('gameStart', { players: game.players });

            // Send initial question to all players
            setTimeout(() => {
                console.log('Sending initial question:', question);
                io.to(gameRoom).emit('newQuestion', question);
            }, 1000);
        }
    });

    socket.on('submitAnswer', ({ answer, username }) => {
        const gameRoom = socket.gameRoom;
        const game = games.get(gameRoom);
        
        if (game && game.currentQuestion) {
            const isCorrect = Math.abs(answer - game.currentQuestion.answer) < 0.001;
            
            if (isCorrect) {
                game.scores[username]++;
                
                // Broadcast score update to all players
                io.to(gameRoom).emit('updateScores', { 
                    scores: game.scores,
                    correct: true,
                    answeredBy: username
                });

                // Generate and send new question to all players
                const question = generateQuestion(game.operation);
                game.currentQuestion = question;
                
                setTimeout(() => {
                    console.log('Sending new question to all players:', question);
                    io.to(gameRoom).emit('newQuestion', question);
                }, 1000);
            } else {
                // Send wrong answer feedback only to the player who answered
                socket.emit('updateScores', {
                    scores: game.scores,
                    correct: false,
                    answeredBy: username
                });
            }
        }
    });

    socket.on('timeUp', () => {
        const gameRoom = socket.gameRoom;
        const game = games.get(gameRoom);
        
        if (game) {
            const scores = game.scores;
            const players = Object.keys(scores);
            let winner;
            
            if (scores[players[0]] === scores[players[1]]) {
                winner = 'tie';
            } else {
                winner = scores[players[0]] > scores[players[1]] ? players[0] : players[1];
            }
            
            io.to(gameRoom).emit('gameOver', { winner, scores });
            games.delete(gameRoom);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        const gameRoom = socket.gameRoom;
        if (gameRoom) {
            const game = games.get(gameRoom);
            if (game) {
                // Oyuncuyu oyundan çıkar
                game.players = game.players.filter(p => p.id !== socket.id);
                
                if (game.players.length === 1) {
                    // Kalan oyuncuya bildir
                    const remainingPlayer = game.players[0].username;
                    io.to(gameRoom).emit('gameOver', {
                        winner: remainingPlayer,
                        scores: game.scores,
                        reason: 'opponent_disconnected'
                    });
                }
                
                // Oyun odasını temizle
                if (game.players.length === 0) {
                    games.delete(gameRoom);
                }
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

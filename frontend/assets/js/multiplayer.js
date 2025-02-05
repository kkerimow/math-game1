document.addEventListener('DOMContentLoaded', () => {
    console.log('Backend URL:', window.BACKEND_URL); // Debug için URL'yi yazdır

    // Socket.IO bağlantısı
    const socket = io(window.BACKEND_URL, {
        transports: ['polling', 'websocket'],
        path: '/socket.io/',
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
        autoConnect: true,
        forceNew: true,
        upgrade: true,
        rememberUpgrade: true,
        secure: true,
        rejectUnauthorized: false
    });

    // Debug için bağlantı durumunu izle
    socket.on('connect_error', (error) => {
        console.log('Connection error details:', error.message);
        console.log('Full error object:', error);
        // Kullanıcıya hata mesajı göster
        alert('Bağlantı hatası oluştu. Lütfen sayfayı yenileyin.');
    });

    socket.on('error', (error) => {
        console.log('Socket error:', error);
    });

    socket.on('connect', () => {
        console.log('Successfully connected to server');
        console.log('Socket ID:', socket.id);
        
        const username = localStorage.getItem('username');
        const operation = new URLSearchParams(window.location.search).get('operation');
        
        if (username && operation) {
            console.log('Joining game with:', { username, operation });
            socket.emit('joinGame', { username, operation });
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        if (reason === 'transport error' || reason === 'transport close') {
            console.log('Attempting to reconnect...');
            socket.connect();
        }
    });

    // Get DOM elements
    const waitingRoom = document.getElementById('waiting-room');
    const waitingMessage = document.querySelector('#waiting-room h1');
    const gameContainer = document.getElementById('game-container');
    const gameOver = document.getElementById('game-over');
    const player1Name = document.getElementById('player1-name');
    const player2Name = document.getElementById('player2-name');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const timerElement = document.getElementById('timer');
    const resultElement = document.getElementById('result');

    // Check if all required elements exist
    if (!waitingRoom || !gameContainer || !gameOver || !player1Name || 
        !player2Name || !questionElement || !answerInput || !timerElement) {
        console.error('Required DOM elements not found');
        return;
    }

    // Game state variables
    let gameStarted = false;
    let timeLeft = 120; // 2 minutes
    let timerInterval = null;
    let currentAnswer = null;
    let currentUsername = localStorage.getItem('username');
    let players = []; // Oyuncu listesini sakla
    const operation = new URLSearchParams(window.location.search).get('operation');

    function startTimer() {
        // Clear existing timer if any
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timeLeft = 120; // Reset timer
        updateTimerDisplay();

        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft <= 0) {
                console.log('Time up!');
                clearInterval(timerInterval);
                socket.emit('timeUp');
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Otomatik focus fonksiyonu
    function focusInput() {
        answerInput.focus();
    }

    // Input validation fonksiyonu
    function validateAnswer(input) {
        const userAnswer = parseFloat(input);
        if (isNaN(userAnswer)) return false;
        return Math.abs(userAnswer - currentAnswer) < 0.001;
    }

    // Input stil güncelleme fonksiyonu
    function updateInputStyle(isCorrect) {
        answerInput.classList.remove('correct', 'wrong');
        if (isCorrect) {
            answerInput.classList.add('correct');
        } else {
            answerInput.classList.add('wrong');
        }
    }

    console.log('Connecting with username:', currentUsername);

    // Socket event listeners
    socket.on('connect', () => {
        console.log('Connected to server');
        
        if (currentUsername && operation) {
            console.log('Joining game with:', { username: currentUsername, operation });
            socket.emit('joinGame', { username: currentUsername, operation });
        } else {
            console.error('Missing username or operation');
            alert('Please start from the main page and make sure you are logged in.');
            window.location.href = 'index2.html';
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });

    // Listen for game start
    socket.on('gameStart', ({ players }) => {
        console.log('Game starting with players:', players);
        if (!players || players.length !== 2) {
            console.error('Invalid players data:', players);
            return;
        }

        gameStarted = true;
        waitingRoom.style.display = 'none';
        gameContainer.style.display = 'block';

        // Update player names
        player1Name.textContent = players[0].username;
        player2Name.textContent = players[1].username;

        startTimer();
        focusInput();
    });

    // Listen for new questions
    socket.on('newQuestion', (questionData) => {
        console.log('New question received:', questionData);
        if (!questionData || !questionData.question) {
            console.error('Invalid question data:', questionData);
            return;
        }

        // Update question and answer
        questionElement.textContent = questionData.question;
        currentAnswer = questionData.answer;
        
        // Reset input and styles
        answerInput.value = '';
        answerInput.classList.remove('correct', 'wrong');
        resultElement.textContent = '';
        
        // Focus on input
        focusInput();
    });

    // Listen for score updates
    socket.on('updateScores', ({ scores, correct, answeredBy }) => {
        console.log('Score update:', { scores, correct, answeredBy });
        
        // Get current player names from the display
        const player1 = player1Name.textContent;
        const player2 = player2Name.textContent;
        
        // Update scores
        document.getElementById('player1-score').textContent = scores[player1] || '0';
        document.getElementById('player2-score').textContent = scores[player2] || '0';

        // Show result message
        if (correct) {
            resultElement.textContent = `${answeredBy} answered correctly!`;
            if (answeredBy !== currentUsername) {
                answerInput.value = '';
                answerInput.classList.remove('correct', 'wrong');
            }
        }
    });

    // Handle answer submission
    answerInput.addEventListener('input', (e) => {
        if (gameStarted) {
            const isCorrect = validateAnswer(e.target.value);
            updateInputStyle(isCorrect);

            if (isCorrect) {
                socket.emit('submitAnswer', { answer: parseFloat(e.target.value), username: currentUsername });
            }
        }
    });

    // Listen for game over
    socket.on('gameOver', ({ winner, scores }) => {
        console.log('Game over - Winner:', winner, 'Scores:', scores);
        clearInterval(timerInterval);
        gameContainer.style.display = 'none';
        gameOver.style.display = 'block';
        
        const finalResult = document.getElementById('final-result');
        if (finalResult) {
            if (winner === 'tie') {
                finalResult.textContent = "It's a tie!";
            } else {
                finalResult.textContent = `${winner} wins with ${scores[winner]} points!`;
            }
        }
    });

    // Socket event listeners
    socket.on('playerCount', ({ count, players }) => {
        console.log('Player count update:', count, players);
        
        if (!players || !Array.isArray(players)) {
            console.error('Invalid players data:', players);
            return;
        }

        if (count === 1) {
            waitingMessage.textContent = 'Waiting for another player...';
            player1Name.textContent = players[0].username;
            player2Name.textContent = 'Waiting...';
        } else if (count === 2) {
            waitingMessage.textContent = 'Game starting...';
            player1Name.textContent = players[0].username;
            player2Name.textContent = players[1].username;
        }
    });

    socket.on('waitingForPlayer', ({ message }) => {
        console.log('Waiting message:', message);
        waitingMessage.textContent = message;
        player2Name.textContent = 'Waiting...';
    });
});
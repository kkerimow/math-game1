// frontend/assets/js/game.js
const params = new URLSearchParams(window.location.search);
const gameId = params.get('gameId');

async function fetchGameDetails() {
    try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`);
        const game = await response.json();

        const players = game.players.map(p => p.username).join(' vs ');
        document.querySelector('.scoreboard').textContent = players;
    } catch (error) {
        console.error('Error fetching game details:', error);
    }
}

fetchGameDetails();

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const timerElement = document.getElementById('timer');
    const scoreElement = document.getElementById('score');
    const questionElement = document.getElementById('question');
    const answerInput = document.getElementById('answer');
    const resultElement = document.getElementById('result');
    const gameOverElement = document.getElementById('game-over');
    const finalScoreElement = document.getElementById('final-score');

    // Game state
    let timeLeft = 120; // 2 minutes
    let score = 0;
    let currentAnswer = null;
    let timerInterval = null;
    const operation = new URLSearchParams(window.location.search).get('operation');

    // Generate a new question based on the operation
    function generateQuestion() {
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
            default:
                question = `${num1} + ${num2}`;
                answer = num1 + num2;
        }

        questionElement.textContent = question;
        currentAnswer = answer;
    }

    // Update timer display
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Start the game timer
    function startTimer() {
        updateTimer();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    // End the game
    function endGame() {
        clearInterval(timerInterval);
        answerInput.disabled = true;
        gameOverElement.style.display = 'block';
        finalScoreElement.textContent = score;
    }

    // Check answer
    function checkAnswer(userAnswer) {
        const parsedAnswer = parseFloat(userAnswer);
        if (isNaN(parsedAnswer)) return false;
        return Math.abs(parsedAnswer - currentAnswer) < 0.001;
    }

    // Handle answer input
    answerInput.addEventListener('input', (e) => {
        const userAnswer = e.target.value;
        if (checkAnswer(userAnswer)) {
            score++;
            scoreElement.textContent = score;
            resultElement.textContent = 'Correct!';
            resultElement.style.color = '#4CAF50';
            answerInput.value = '';
            generateQuestion();
        }
    });

    // Initialize game
    function initGame() {
        score = 0;
        timeLeft = 120;
        scoreElement.textContent = '0';
        answerInput.value = '';
        answerInput.disabled = false;
        gameOverElement.style.display = 'none';
        generateQuestion();
        startTimer();
        answerInput.focus();
    }

    // Start the game
    initGame();
});

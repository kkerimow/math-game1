document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const selectedOperation = decodeURIComponent(params.get('operation'));

    console.log('Selected Operation:', selectedOperation);

    let questionElement = document.getElementById('question');
    let answerElement = document.getElementById('answer');
    let timerElement = document.getElementById('timer');
    let questionsAnsweredElement = document.getElementById('player1-score');

    if (!selectedOperation || !questionElement || !answerElement || !timerElement || !questionsAnsweredElement) {
        console.error('One or more required elements not found or no operation selected!');
        return;
    }

    let currentQuestion = 0;
    let correctAnswers = 0;
    const totalQuestions = 10;
    let timeLeft = 120;

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateQuestion() {
        let num1 = getRandomNumber(10, 999);
        let num2 = getRandomNumber(10, 999);
        let questionText = '';
        let correctAnswer = 0;

        switch (selectedOperation) {
            case '+':
                questionText = `${num1} + ${num2} = ?`;
                correctAnswer = num1 + num2;
                break;
            case '-':
                if (num1 < num2) [num1, num2] = [num2, num1];
                questionText = `${num1} - ${num2} = ?`;
                correctAnswer = num1 - num2;
                break;
            case '*':
                questionText = `${num1} * ${num2} = ?`;
                correctAnswer = num1 * num2;
                break;
            case '/':
                num2 = getRandomNumber(1, 99);
                num1 = num2 * getRandomNumber(1, 20);
                questionText = `${num1} / ${num2} = ?`;
                correctAnswer = num1 / num2;
                break;
            default:
                console.error('Invalid operation selected or operation is null!');
                return;
        }

        questionElement.textContent = questionText;
        questionElement.dataset.answer = correctAnswer.toString();
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (timeLeft <= 0 || currentQuestion >= totalQuestions) {
                clearInterval(timerInterval);
                endGame();
            }
        }, 1000);
    }

    // function endGame() {
    //     questionElement.textContent = `Game Over! You got ${correctAnswers} out of ${totalQuestions} correct.`;
    //     answerElement.style.display = 'none';
    // }

    function endGame(io, room) {
        const roomData = rooms[room];
        if (!roomData) return;
    
        const winner = Object.entries(roomData.scores).reduce((highest, [username, score]) => {
            if (score > highest.score) return { username, score };
            return highest;
        }, { username: null, score: 0 });
    
        io.to(room).emit('gameOver', { winner: winner.username, score: winner.score });
        delete rooms[room];
    }
    

    answerElement.addEventListener('input', () => {
        const userAnswer = parseFloat(answerElement.value);
        const correctAnswer = parseFloat(questionElement.dataset.answer);

        if (userAnswer === correctAnswer) {
            correctAnswers++;
            currentQuestion++;
            questionsAnsweredElement.textContent = currentQuestion;

            if (currentQuestion < totalQuestions) {
                generateQuestion();
                answerElement.value = '';
            } else {
                endGame();
            }
        }
    });

    generateQuestion();
    startTimer();
});

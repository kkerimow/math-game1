let selectedOperation = null;

function selectOperation(operation) {
    // Tüm butonların seçimini sıfırla
    document.querySelectorAll('.buttons-container button').forEach(button => {
        button.classList.remove('selected');
    });

    // Seçili butonu vurgula
    selectedOperation = operation;
    
    document.getElementById(getButtonId(operation)).classList.add('selected');
}

function getButtonId(operation) {
    switch (operation) {
        case '+': return 'add';
        case '-': return 'subtract';
        case '/': return 'divide';
        case '*': return 'multiply';
    }
}

function playSingleplayer() {
    if (!selectedOperation) {
        alert('Please select an operation first.');
        return;
    }
    startCountdown(selectedOperation, 'single');
}

function playMultiplayer() {
    if (!selectedOperation) {
        alert('Please select an operation first.');
        return;
    }
    startCountdown(selectedOperation, 'multi');
}

function startCountdown(operation, mode) {
    if (!operation) {
        alert('Please select an operation first.');
        return;
    }

    const countdownElement = document.getElementById('countdown');
    countdownElement.style.display = 'block';
    let countdown = 3;

    countdownElement.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown === 0) {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            // Mode'a göre yönlendirme yap
            if (mode === 'single') {
                window.location.href = `game.html?operation=${encodeURIComponent(operation)}`;
            } else {
                window.location.href = `multiplayer.html?operation=${encodeURIComponent(operation)}`;
            }
        }
    }, 1000);
}
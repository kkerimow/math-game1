let isLoginMode = false;

function openModal(loginMode) {
    isLoginMode = loginMode;
    const modal = document.getElementById('modal');
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    modal.style.display = 'block';
    overlay.style.display = 'block';

    if (isLoginMode) {
        modalTitle.textContent = 'Login';
        modalContent.innerHTML = `
                    <form id="login-form">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password">
                        <button class="loginBtn button">Login</button>
                    </form>
                    <a href="#" onclick="toggleModalMode()">Don't have an account? Sign Up</a>
                `;
    } else {
        modalTitle.textContent = 'Sign Up';
        modalContent.innerHTML = `
                    <form id="register-form">
                        <label for="name">Username</label>
                        <input type="text" id="name" placeholder="Enter your name">
                        <label for="email">Email</label>
                        <input type="email" id="email" placeholder="Enter your email">
                        <label for="password">Password</label>
                        <input type="password" id="password" placeholder="Enter your password">
                        <label for="confirm-password">Confirm Password</label>
                        <input type="password" id="confirm-password" placeholder="Confirm your password">
                        <button class="signupBtn button">Sign Up</button>
                    </form>
                    <a href="#" onclick="toggleModalMode()">Already have an account? Login</a>
                `;
    }
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
}

function toggleModalMode() {
    openModal(!isLoginMode);
}
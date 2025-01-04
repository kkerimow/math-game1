async function handleSignUp(event) {
    // Form submit işlemini engelle
    event.preventDefault();

    // Dinamik olarak oluşturulan elemanlardan veri al
    const name = document.getElementById('name').value; // Username'i alın
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Şifrelerin eşleştiğini kontrol et
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    // Kullanıcı verilerini bir nesne olarak oluştur
    const userData = { username: name, email, password }; // Username'i de ekleyin

    try {
        // Backend'e istek gönder
        const response = await fetch(`${window.BACKEND_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (response.ok) {
            alert('Sign Up successful!');
            // Login modalını aç
            openModal(true); // Login moduna geç
        } else {
            const error = await response.json();
            alert(`Sign Up failed: ${error.error}`);
        }
    } catch (error) {
        console.error('Error during sign up:', error);
        alert('An error occurred. Please try again.');
    }
}

// Dinamik olarak oluşturulan Sign Up formuna submit event listener ekle
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('signupBtn')) {
        const form = document.getElementById('register-form');
        form.addEventListener('submit', handleSignUp);
    }
});


// --------------------------

async function handleLogin(event) {
    event.preventDefault(); // Formun sayfa yenilemesini engelle

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;


    try {
        console.log('Sending login request...');
        const response = await fetch(`${window.BACKEND_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        console.log('Response received:', response);

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            if (data.token) {
                localStorage.setItem('token', data.token); // Token'ı sakla
                // localStorage.setItem('username', data.username); // Username
                localStorage.setItem('username', data.username); // Username'i sakla

                // Oyun sayfasına yönlendir
                // window.location.href = `game.html?username=${encodeURIComponent(data.username)}`;
                window.location.href = `index2.html?username=${data.username}`;
                console.log(data.username);

            } else {
                alert('No token received. Please try again.');
                console.log('Response not OK. Parsing error message...');
                const errorData = await response.json();
                console.log('Error details from server:', errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
        } else {
            alert(data.error || 'Login failed');
        }
        console.log('Parsed response data:', data);
    } catch (error) {
        console.error('An error occurred during login:', error.message || error);
        alert(`Something went wrong: ${error.message || 'Unknown error'}`);
    }
}

document.addEventListener('click', (event) => {
    // Eğer Login butonuna tıklanırsa
    if (event.target.classList.contains('loginBtn')) {
        const form = document.getElementById('login-form'); // Login formunu seç
        if (form) {
            form.addEventListener('submit', handleLogin); // Submit olayını dinle
        }
    }
});

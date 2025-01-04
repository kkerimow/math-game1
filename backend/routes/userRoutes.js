const express = require('express'); // Express modülü.
const router = express.Router(); // Router oluşturuyoruz.
const { validateToken, registerUser, loginUser } = require('../controllers/userController'); // Controller işlevlerini çağırıyoruz.


// Token doğrulama
router.post('/validate', validateToken);

// Kullanıcı kaydı için POST isteği
router.post('/register', registerUser);

// Kullanıcı girişi için POST isteği
router.post('/login', loginUser);

module.exports = router; // Router'ı dışa aktarıyoruz.

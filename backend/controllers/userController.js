const User = require('../models/User'); // Kullanıcı modeli.
const bcrypt = require('bcryptjs'); // Şifreleme için bcryptjs modülü.
const jwt = require('jsonwebtoken'); // JWT ile kullanıcı kimlik doğrulaması.


// Token doğrulama
const validateToken = (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.status(200).json({ valid: true }); // Token geçerli
  } catch (error) {
    res.status(400).json({ valid: false, error: 'Invalid token' }); // Token geçersiz
  }
};

// Kullanıcı kaydı
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body; // Username'i alın

    // Kullanıcının daha önce kayıtlı olup olmadığını kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı kaydet
    const newUser = await User.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Kullanıcı girişi
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Gelen email:', email);
    console.log('Gelen password:', password);

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Kullanıcı bulunamadı.');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Şifreyi doğrula
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Şifre eşleşmiyor.');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // JWT token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Kullanıcı adıyla birlikte yanıt döndür
    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
};

module.exports = { validateToken, registerUser, loginUser }; // İşlevleri dışa aktarıyoruz.

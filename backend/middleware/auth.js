const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authenticateToken = (req, res, next) => {
  // Token'ı başlık kısmından alıyoruz
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided' });
  }

  try {
    // Token'ı doğruluyoruz
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Kullanıcı bilgilerini request'e ekliyoruz
    next(); // Bir sonraki middleware'e geçiyoruz
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;

const mongoose = require('mongoose'); // MongoDB bağlantısı için Mongoose'u dahil ediyoruz.

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // Zorunlu alan
    trim: true, // Başındaki ve sonundaki boşlukları temizler
  },
  email: {
    type: String,
    required: true,
    unique: true, // Email benzersiz olmalı
    trim: true, // Başında ve sonunda boşlukları temizler
  },
  password: {
    type: String,
    required: true, // Şifre zorunludur
    minlength: 6, // Minimum uzunluk kontrolü
  },
}, {
  timestamps: true, // Otomatik olarak createdAt ve updatedAt alanlarını ekler
});

const User = mongoose.model('User', userSchema); // Modeli oluşturuyoruz ve 'User' koleksiyonuna bağlıyoruz.
module.exports = User; // Modeli dışa aktarıyoruz.

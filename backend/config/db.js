const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connection.once('open', () => {
  console.log('MongoDB connection ready');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // .env dosyasındaki URI ile bağlantı
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Full Error Details:', error); // Daha fazla detay döner
    process.exit(1); // Bağlantı başarısızsa uygulamayı sonlandır
  }
};

module.exports = connectDB; // Bağlantıyı dışa aktarıyoruz.

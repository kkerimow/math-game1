# Math Game

Multiplayer matematik oyunu. Arkadaşlarınızla yarışarak matematik becerilerinizi test edin!

## Özellikler

- Tek oyunculu ve çok oyunculu modlar
- Dört işlem desteği (+, -, ×, ÷)
- Gerçek zamanlı skor takibi
- Kullanıcı hesapları ve kimlik doğrulama

## Teknolojiler

### Frontend
- HTML5
- CSS3
- JavaScript
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

## Kurulum

1. Repoyu klonlayın:
```bash
git clone https://github.com/KULLANICI_ADINIZ/math-game.git
cd math-game
```

2. Backend kurulumu:
```bash
cd backend
npm install
```

3. Frontend kurulumu:
```bash
cd frontend
# Static dosyalar olduğu için kurulum gerekmez
```

4. Environment değişkenlerini ayarlayın:
Backend klasöründe `.env` dosyası oluşturun:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

5. Uygulamayı başlatın:
```bash
cd backend
npm start
```

## Deployment

- Frontend: Vercel
- Backend: Render.com

## Lisans

MIT 
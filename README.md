# RA Chats 💬

**RA Chats** is a comprehensive messaging application inspired by Telegram, featuring real-time messaging, voice/video calling, and a powerful admin panel for superuser management.

## 🎯 Features

### For Regular Users
- ✅ User Registration & Authentication
- ✅ One-to-One Messaging
- ✅ Group Chats
- ✅ Audio & Video Calling (WebRTC)
- ✅ Media Sharing (Images, Videos, Documents)
- ✅ User Profile Management
- ✅ Online/Offline Status
- ✅ Message Read Receipts
- ✅ User Blocking

### For SuperUser (Admin)
- ✅ View All Users
- ✅ Access User Chat History
- ✅ Block/Unblock Users
- ✅ Delete Users
- ✅ Reset User Passwords
- ✅ Delete Messages
- ✅ Send System Notifications
- ✅ View User Activity Logs
- ✅ Manage User Roles

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Socket.io** - Real-time Communication
- **JWT** - Authentication
- **WebRTC** - Audio/Video Calling
- **Firebase Cloud Messaging** - Push Notifications

### Frontend (Android)
- **Kotlin** - Programming Language
- **Jetpack Compose** - UI Framework
- **Room Database** - Local Storage
- **Retrofit** - HTTP Client
- **Socket.io Client** - Real-time Communication
- **WebRTC Android** - Audio/Video Calling

## 📁 Project Structure

```
RA-Chats/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── index.js
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/raselahd13/rachats/
│   │   │   ├── res/
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
│
└── docs/
    ├── API.md
    ├── DATABASE.md
    └── ARCHITECTURE.md
```

## 🚀 Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Android Setup
```bash
cd android
# Open in Android Studio
# Configure API endpoints
# Run on emulator or device
```

## 📚 Documentation
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)

## 👤 Author
Raselahd13

## 📄 License
MIT License

---

**Happy Coding!** 🎉
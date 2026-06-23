# RA Chats Backend

Backend server for RA Chats application built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables in .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js       # MongoDB connection
│   └── constants.js      # Application constants
├── models/
│   ├── User.js          # User schema
│   ├── Message.js       # Message schema
│   ├── Group.js         # Group chat schema
│   ├── Call.js          # Call logs schema
│   └── ActivityLog.js   # Admin activity logs
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── users.js         # User management routes
│   ├── messages.js      # Messaging routes
│   ├── calls.js         # Calling routes
│   └── admin.js         # Admin panel routes
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── messageController.js
│   ├── callController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js          # JWT verification
│   ├── validation.js    # Input validation
│   └── errorHandler.js  # Error handling
├── utils/
│   ├── logger.js        # Logging utility
│   ├── validators.js    # Validation helpers
│   └── helpers.js       # Helper functions
└── index.js             # Server entry point
```

## 🔌 API Endpoints (Coming Soon)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Messages
- `GET /api/messages/chat/:userId` - Get chat history
- `POST /api/messages/send` - Send message
- `DELETE /api/messages/:messageId` - Delete message

### Calls
- `POST /api/calls/initiate` - Initiate call
- `POST /api/calls/answer` - Answer call
- `POST /api/calls/end` - End call

### Admin
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:userId` - Delete user
- `POST /api/admin/users/:userId/block` - Block user

## 🔐 Authentication

Uses JWT (JSON Web Tokens) for authentication.

## 🚀 Deployment

More details coming soon!

## 📄 License

MIT License
# RA Chats - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123",
  "confirmPassword": "Password123",
  "displayName": "User Name"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": { ... },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "tokens": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Refresh Token
```
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "..."
}

Response (200):
{
  "success": true,
  "accessToken": "..."
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 👤 User Endpoints

### Get Profile
```
GET /users/profile
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": { ... user object ... }
}
```

### Update Profile
```
PUT /users/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "displayName": "New Name",
  "bio": "User bio",
  "avatar": "https://...",
  "phone": "+880..."
}

Response (200):
{
  "success": true,
  "data": { ... updated user ... }
}
```

### Search Users
```
GET /users/search?query=john&page=1&limit=20
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

### Block User
```
POST /users/:userId/block
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "User blocked successfully"
}
```

### Unblock User
```
POST /users/:userId/unblock
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "User unblocked successfully"
}
```

### Get Blocked Users
```
GET /users/blocked
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": [ ... blocked users ... ]
}
```

---

## 💬 Message Endpoints

### Send Message
```
POST /messages/send
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "content": "Hello!",
  "type": "text",
  "mediaUrl": null
}

Response (201):
{
  "success": true,
  "data": { ... message object ... }
}
```

### Get Chat History
```
GET /messages/chat/:userId?page=1&limit=50
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "pagination": { ... },
    "otherUser": { ... }
  }
}
```

### Get Group Messages
```
GET /messages/groups/:groupId?page=1&limit=50
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "messages": [ ... ],
    "pagination": { ... }
  }
}
```

### Search Messages
```
GET /messages/search?query=hello&userId=...&page=1&limit=20
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": { ... }
}
```

### Edit Message
```
PUT /messages/:messageId
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Edited message"
}

Response (200):
{
  "success": true,
  "data": { ... updated message ... }
}
```

### Delete Message
```
DELETE /messages/:messageId
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### Add Reaction
```
POST /messages/:messageId/reaction
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "emoji": "❤️"
}

Response (200):
{
  "success": true,
  "data": { ... message with reaction ... }
}
```

---

## 📞 Call Endpoints

### Initiate Call
```
POST /calls/initiate
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "recipientId": "user_id",
  "type": "audio" // or "video"
}

Response (201):
{
  "success": true,
  "data": { ... call object ... }
}
```

### Answer Call
```
POST /calls/:callId/answer
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": { ... call object ... }
}
```

### Reject Call
```
POST /calls/:callId/reject
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "busy" // optional
}

Response (200):
{
  "success": true,
  "data": { ... call object ... }
}
```

### End Call
```
POST /calls/:callId/end
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "qualityMetrics": {
    "videoBitrate": 2500,
    "audioBitrate": 128,
    "latency": 45
  }
}

Response (200):
{
  "success": true,
  "data": { ... call object ... }
}
```

### Get Call History
```
GET /calls/history?page=1&limit=20&type=audio&status=ended
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "calls": [ ... ],
    "pagination": { ... }
  }
}
```

---

## 👨‍💼 Admin Endpoints (Superuser Only)

### Get All Users
```
GET /admin/users?page=1&limit=10&role=user&status=online&search=john
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "users": [ ... ],
    "pagination": { ... }
  }
}
```

### Get User Details
```
GET /admin/users/:userId
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": {
    "user": { ... },
    "stats": { ... }
  }
}
```

### Block User
```
POST /admin/users/:userId/block
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "reason": "Spam behavior"
}

Response (200):
{
  "success": true,
  "data": { ... user object ... }
}
```

### Unblock User
```
POST /admin/users/:userId/unblock
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "data": { ... user object ... }
}
```

### Delete User
```
DELETE /admin/users/:userId
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Reset User Password
```
POST /admin/users/:userId/reset-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "newPassword": "NewPassword123"
}

Response (200):
{
  "success": true,
  "message": "User password reset successfully"
}
```

### Delete Message
```
DELETE /admin/messages/:messageId
Authorization: Bearer <access_token>

Response (200):
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## 🔌 Socket.io Events

### Emit Events (Client to Server)
- `user-online` - User comes online
- `user-offline` - User goes offline
- `send-message` - Send message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `message-read` - Message read
- `call-user` - Initiate call
- `answer-call` - Answer call
- `reject-call` - Reject call
- `end-call` - End call
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `ice-candidate` - ICE candidate

### Listen Events (Server to Client)
- `user-status-changed` - User status changed
- `receive-message` - New message received
- `user-typing` - User is typing
- `user-stop-typing` - User stopped typing
- `message-read-receipt` - Message read receipt
- `incoming-call` - Incoming call
- `call-answered` - Call answered
- `call-rejected` - Call rejected
- `call-ended` - Call ended
- `webrtc-offer` - WebRTC offer
- `webrtc-answer` - WebRTC answer
- `ice-candidate` - ICE candidate

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Error description"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting
- Max 100 requests per minute per IP
- Max 5 failed login attempts before 15-minute lock

## Security Notes
- Always use HTTPS in production
- Store tokens securely (e.g., secure cookies or secure storage)
- Implement token refresh before expiration
- Validate all user inputs

---

**Last Updated**: 2024
**Version**: 1.0.0
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

// Import database
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const callRoutes = require('./routes/calls');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: '✅ Server is running', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Events
const onlineUsers = new Map(); // Store online users

io.on('connection', (socket) => {
  console.log(`🟢 New user connected: ${socket.id}`);

  // User comes online
  socket.on('user-online', (userId) => {
    socket.join(`user_${userId}`);
    onlineUsers.set(userId, socket.id);
    console.log(`📱 User ${userId} is online`);
    
    io.emit('user-status-changed', { 
      userId, 
      status: 'online', 
      timestamp: new Date() 
    });
  });

  // User comes offline
  socket.on('user-offline', (userId) => {
    onlineUsers.delete(userId);
    console.log(`📴 User ${userId} is offline`);
    
    io.emit('user-status-changed', { 
      userId, 
      status: 'offline', 
      timestamp: new Date() 
    });
  });

  // New message event
  socket.on('send-message', (data) => {
    console.log(`💬 Message from ${data.senderId} to ${data.recipientId}`);
    io.to(`user_${data.recipientId}`).emit('receive-message', {
      messageId: data.messageId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      type: data.type,
      mediaUrl: data.mediaUrl,
      timestamp: new Date()
    });
  });

  // Typing indicator
  socket.on('typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user-typing', {
      senderId: data.senderId,
      senderName: data.senderName
    });
  });

  // Stop typing indicator
  socket.on('stop-typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user-stop-typing', {
      senderId: data.senderId
    });
  });

  // Message read receipt
  socket.on('message-read', (data) => {
    io.to(`user_${data.senderId}`).emit('message-read-receipt', {
      messageId: data.messageId,
      readAt: new Date()
    });
  });

  // Call events
  socket.on('call-user', (data) => {
    console.log(`📞 Incoming call from ${data.callerId} to ${data.recipientId}`);
    io.to(`user_${data.recipientId}`).emit('incoming-call', {
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName,
      callerAvatar: data.callerAvatar,
      type: data.type, // 'audio' or 'video'
      timestamp: new Date()
    });
  });

  socket.on('answer-call', (data) => {
    console.log(`✅ Call answered by ${data.answererId}`);
    io.to(`user_${data.callerId}`).emit('call-answered', {
      callId: data.callId,
      answererId: data.answererId,
      answererName: data.answererName
    });
  });

  socket.on('reject-call', (data) => {
    console.log(`❌ Call rejected by ${data.rejectorId}`);
    io.to(`user_${data.callerId}`).emit('call-rejected', {
      callId: data.callId,
      reason: data.reason || 'declined'
    });
  });

  socket.on('end-call', (data) => {
    console.log(`📵 Call ended: ${data.callId}`);
    io.to(`user_${data.recipientId}`).emit('call-ended', {
      callId: data.callId,
      duration: data.duration,
      quality: data.quality
    });
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', (data) => {
    io.to(`user_${data.recipientId}`).emit('webrtc-offer', {
      offer: data.offer,
      from: data.from
    });
  });

  socket.on('webrtc-answer', (data) => {
    io.to(`user_${data.callerId}`).emit('webrtc-answer', {
      answer: data.answer,
      from: data.from
    });
  });

  socket.on('ice-candidate', (data) => {
    io.to(`user_${data.to}`).emit('ice-candidate', {
      candidate: data.candidate,
      from: data.from
    });
  });

  // Group chat events
  socket.on('join-group', (data) => {
    socket.join(`group_${data.groupId}`);
    io.to(`group_${data.groupId}`).emit('group-user-joined', {
      groupId: data.groupId,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date()
    });
  });

  socket.on('leave-group', (data) => {
    socket.leave(`group_${data.groupId}`);
    io.to(`group_${data.groupId}`).emit('group-user-left', {
      groupId: data.groupId,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date()
    });
  });

  socket.on('group-message', (data) => {
    io.to(`group_${data.groupId}`).emit('group-message-received', {
      messageId: data.messageId,
      groupId: data.groupId,
      senderId: data.senderId,
      senderName: data.senderName,
      content: data.content,
      type: data.type,
      timestamp: new Date()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
    // Find and remove user from onlineUsers
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit('user-status-changed', { 
          userId, 
          status: 'offline' 
        });
        break;
      }
    }
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Server Startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 RA CHATS SERVER STARTED`);
  console.log(`${'='.repeat(50)}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.io: Ready for connections`);
  console.log(`📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`${'='.repeat(50)}\n`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io, server };
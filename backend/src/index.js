const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log(`✅ New user connected: ${socket.id}`);

  // User going online
  socket.on('user-online', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`📱 User ${userId} is online`);
    io.emit('user-status', { userId, status: 'online', timestamp: new Date() });
  });

  // New message
  socket.on('send-message', (data) => {
    console.log(`💬 Message from ${data.senderId} to ${data.recipientId}`);
    io.to(`user_${data.recipientId}`).emit('receive-message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user-typing', data);
  });

  // Stop typing
  socket.on('stop-typing', (data) => {
    io.to(`user_${data.recipientId}`).emit('user-stop-typing', data);
  });

  // Call events
  socket.on('call-user', (data) => {
    console.log(`📞 Incoming call from ${data.callerId} to ${data.recipientId}`);
    io.to(`user_${data.recipientId}`).emit('incoming-call', {
      callerId: data.callerId,
      callerName: data.callerName,
      type: data.type // 'audio' or 'video'
    });
  });

  socket.on('answer-call', (data) => {
    io.to(`user_${data.callerId}`).emit('call-answered', {
      answererId: data.answererId
    });
  });

  socket.on('reject-call', (data) => {
    io.to(`user_${data.callerId}`).emit('call-rejected', {
      reason: data.reason
    });
  });

  socket.on('end-call', (data) => {
    io.to(`user_${data.recipientId}`).emit('call-ended', {
      callerId: data.callerId
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
    io.emit('user-status', { userId: socket.id, status: 'offline' });
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔴 Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Server Startup
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔌 Socket.io is ready for connections\n`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
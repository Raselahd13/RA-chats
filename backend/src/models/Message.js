const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for group messages
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: 5000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location'],
      default: 'text'
    },
    mediaUrl: {
      type: String,
      default: null
    },
    mediaSize: {
      type: Number,
      default: null // in bytes
    },
    mediaDuration: {
      type: Number,
      default: null // for audio/video in seconds
    },
    metadata: {
      width: Number,
      height: Number,
      mimeType: String
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    reactions: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      _id: false
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    editedAt: {
      type: Date,
      default: null
    },
    deletedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ recipientId: 1, createdAt: -1 });
MessageSchema.index({ groupId: 1, createdAt: -1 });
MessageSchema.index({ 'senderId': 1, 'recipientId': 1, 'createdAt': -1 });
MessageSchema.index({ createdAt: -1 });
MessageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', MessageSchema);
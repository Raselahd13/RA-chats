const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      minlength: 3,
      maxlength: 50
    },
    description: {
      type: String,
      maxlength: 500,
      default: ''
    },
    avatar: {
      type: String,
      default: null
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isPrivate: {
      type: Boolean,
      default: false
    },
    joinRequests: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      }
    }],
    bannedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    mutedUsers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      mutedUntil: Date,
      _id: false
    }],
    pinnedMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    settings: {
      allowMemberInvite: {
        type: Boolean,
        default: true
      },
      messageNotifications: {
        type: String,
        enum: ['all', 'mentions', 'none'],
        default: 'all'
      },
      messageApprovalRequired: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
GroupSchema.index({ admin: 1 });
GroupSchema.index({ members: 1 });
GroupSchema.index({ createdAt: -1 });
GroupSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Group', GroupSchema);
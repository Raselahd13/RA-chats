const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    targetMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    targetGroupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null
    },
    action: {
      type: String,
      enum: [
        'user_deleted',
        'user_blocked',
        'user_unblocked',
        'user_password_reset',
        'user_role_changed',
        'user_status_updated',
        'message_deleted',
        'group_deleted',
        'group_moderated',
        'user_banned',
        'user_unbanned',
        'admin_login',
        'admin_logout',
        'system_notification_sent',
        'other'
      ],
      required: true
    },
    description: {
      type: String,
      maxlength: 500
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: String,
    userAgent: String,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success'
    },
    errorMessage: String
  },
  {
    timestamps: true
  }
);

// Index for faster queries
ActivityLogSchema.index({ adminId: 1, createdAt: -1 });
ActivityLogSchema.index({ targetUserId: 1, createdAt: -1 });
ActivityLogSchema.index({ action: 1, createdAt: -1 });
ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ status: 1 });

// TTL Index - Auto-delete logs after 90 days
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
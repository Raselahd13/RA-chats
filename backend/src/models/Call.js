const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema(
  {
    callerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['audio', 'video'],
      required: true
    },
    status: {
      type: String,
      enum: ['initiated', 'ringing', 'answered', 'rejected', 'missed', 'ended'],
      default: 'initiated'
    },
    rejectionReason: {
      type: String,
      enum: ['busy', 'declined', 'missed', 'network_error'],
      default: null
    },
    startedAt: {
      type: Date,
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    },
    duration: {
      type: Number,
      default: 0 // in seconds
    },
    groupCall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GroupCall',
      default: null
    },
    qualityMetrics: {
      videoBitrate: Number,
      audioBitrate: Number,
      videoFrameRate: Number,
      latency: Number, // in ms
      packetLoss: Number // percentage
    }
  },
  {
    timestamps: true
  }
);

// Calculate duration before saving
CallSchema.pre('save', function(next) {
  if (this.startedAt && this.endedAt) {
    this.duration = Math.floor((this.endedAt - this.startedAt) / 1000);
  }
  next();
});

// Index for faster queries
CallSchema.index({ callerId: 1, createdAt: -1 });
CallSchema.index({ recipientId: 1, createdAt: -1 });
CallSchema.index({ 'callerId': 1, 'recipientId': 1, 'createdAt': -1 });
CallSchema.index({ status: 1 });
CallSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Call', CallSchema);
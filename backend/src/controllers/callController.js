const Call = require('../models/Call');
const User = require('../models/User');

// @desc    Initiate a call
// @route   POST /api/calls/initiate
// @access  Private
exports.initiateCall = async (req, res) => {
  try {
    const { recipientId, type } = req.body;
    const callerId = req.user.userId;

    // Validation
    if (!recipientId || !type) {
      return res.status(400).json({
        success: false,
        message: 'recipientId and type (audio/video) are required'
      });
    }

    if (!['audio', 'video'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either audio or video'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if caller is blocked
    if (recipient.blockedUsers.includes(callerId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot call this user'
      });
    }

    // Create call record
    const call = await Call.create({
      callerId,
      recipientId,
      type,
      status: 'initiated',
      startedAt: new Date()
    });

    // Populate caller details
    await call.populate('callerId', 'username displayName avatar');

    res.status(201).json({
      success: true,
      message: 'Call initiated',
      data: call
    });
  } catch (error) {
    console.error('Initiate call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating call',
      error: error.message
    });
  }
};

// @desc    Answer a call
// @route   POST /api/calls/:callId/answer
// @access  Private
exports.answerCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.userId;

    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is recipient
    if (call.recipientId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not the recipient of this call'
      });
    }

    call.status = 'answered';
    await call.save();

    res.status(200).json({
      success: true,
      message: 'Call answered',
      data: call
    });
  } catch (error) {
    console.error('Answer call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error answering call',
      error: error.message
    });
  }
};

// @desc    Reject a call
// @route   POST /api/calls/:callId/reject
// @access  Private
exports.rejectCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is recipient or caller
    if (call.recipientId.toString() !== userId && call.callerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not involved in this call'
      });
    }

    call.status = 'rejected';
    call.rejectionReason = reason || 'declined';
    call.endedAt = new Date();
    await call.save();

    res.status(200).json({
      success: true,
      message: 'Call rejected',
      data: call
    });
  } catch (error) {
    console.error('Reject call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting call',
      error: error.message
    });
  }
};

// @desc    End a call
// @route   POST /api/calls/:callId/end
// @access  Private
exports.endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    const { qualityMetrics } = req.body;
    const userId = req.user.userId;

    const call = await Call.findById(callId);

    if (!call) {
      return res.status(404).json({
        success: false,
        message: 'Call not found'
      });
    }

    // Check if user is involved in call
    if (call.recipientId.toString() !== userId && call.callerId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not involved in this call'
      });
    }

    call.status = 'ended';
    call.endedAt = new Date();
    if (qualityMetrics) {
      call.qualityMetrics = qualityMetrics;
    }
    await call.save();

    res.status(200).json({
      success: true,
      message: 'Call ended',
      data: call
    });
  } catch (error) {
    console.error('End call error:', error);
    res.status(500).json({
      success: false,
      message: 'Error ending call',
      error: error.message
    });
  }
};

// @desc    Get call history
// @route   GET /api/calls/history
// @access  Private
exports.getCallHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const userId = req.user.userId;
    const skip = (page - 1) * limit;

    let query = {
      $or: [
        { callerId: userId },
        { recipientId: userId }
      ]
    };

    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Call.countDocuments(query);

    const calls = await Call.find(query)
      .populate('callerId', 'username displayName avatar')
      .populate('recipientId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      message: 'Call history retrieved successfully',
      data: {
        calls,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      }
    });
  } catch (error) {
    console.error('Get call history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving call history',
      error: error.message
    });
  }
};
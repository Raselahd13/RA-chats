const User = require('../models/User');
const Message = require('../models/Message');
const { logActivity, logError } = require('../utils/activityLogger');

// @desc    Get all users (Superuser only)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { displayName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip(skip)
      .sort({ createdAt: -1 });

    await logActivity(req.user.userId, 'admin_view_users', { total, page, limit }, null, null, req);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      }
    });
  } catch (error) {
    await logError(req.user.userId, 'admin_view_users', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:userId
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const messageCount = await Message.countDocuments({
      $or: [{ senderId: userId }, { recipientId: userId }]
    });

    await logActivity(req.user.userId, 'admin_view_user_details', { targetUserId: userId }, userId, null, req);

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user,
        stats: {
          messageCount,
          blockedCount: user.blockedUsers.length,
          accountAge: new Date() - user.createdAt
        }
      }
    });
  } catch (error) {
    await logError(req.user.userId, 'admin_view_user_details', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error retrieving user details',
      error: error.message
    });
  }
};

// @desc    Block user
// @route   POST /api/admin/users/:userId/block
// @access  Private/Admin
exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'superuser') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block another superuser'
      });
    }

    user.isBlocked = true;
    await user.save();

    await logActivity(
      req.user.userId,
      'user_blocked',
      { reason: reason || 'No reason provided' },
      userId,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    });
  } catch (error) {
    await logError(req.user.userId, 'user_blocked', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message
    });
  }
};

// @desc    Unblock user
// @route   POST /api/admin/users/:userId/unblock
// @access  Private/Admin
exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logActivity(
      req.user.userId,
      'user_unblocked',
      { targetUserId: userId },
      userId,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    });
  } catch (error) {
    await logError(req.user.userId, 'user_unblocked', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:userId
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'superuser') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete another superuser'
      });
    }

    // Delete user and related data
    await User.findByIdAndDelete(userId);
    await Message.deleteMany({
      $or: [{ senderId: userId }, { recipientId: userId }]
    });

    await logActivity(
      req.user.userId,
      'user_deleted',
      { deletedUser: user.email },
      userId,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await logError(req.user.userId, 'user_deleted', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/:userId/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    await logActivity(
      req.user.userId,
      'user_password_reset',
      { targetUserId: userId },
      userId,
      null,
      req
    );

    res.status(200).json({
      success: true,
      message: 'User password reset successfully'
    });
  } catch (error) {
    await logError(req.user.userId, 'user_password_reset', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/admin/messages/:messageId
// @access  Private/Admin
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndDelete(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await logActivity(
      req.user.userId,
      'message_deleted',
      { messageContent: message.content },
      message.senderId,
      messageId,
      req
    );

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    await logError(req.user.userId, 'message_deleted', error.message, req);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};
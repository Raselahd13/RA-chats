const Message = require('../models/Message');
const User = require('../models/User');
const { logActivity } = require('../utils/activityLogger');

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, groupId, content, type = 'text', mediaUrl, mediaSize, metadata } = req.body;
    const senderId = req.user.userId;

    // Validation
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    if (!recipientId && !groupId) {
      return res.status(400).json({
        success: false,
        message: 'Either recipientId or groupId is required'
      });
    }

    // Check if sender is blocked by recipient
    if (recipientId) {
      const recipient = await User.findById(recipientId);
      if (recipient && recipient.blockedUsers.includes(senderId)) {
        return res.status(403).json({
          success: false,
          message: 'You cannot send message to this user'
        });
      }
    }

    // Create message
    const message = await Message.create({
      senderId,
      recipientId: recipientId || null,
      groupId: groupId || null,
      content,
      type,
      mediaUrl,
      mediaSize,
      metadata,
      isRead: false
    });

    // Populate sender details
    await message.populate('senderId', 'username displayName avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// @desc    Get chat history with a user
// @route   GET /api/messages/chat/:userId
// @access  Private
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.userId;
    const skip = (page - 1) * limit;

    // Verify both users exist and are not blocked
    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (otherUser.blockedUsers.includes(currentUserId)) {
      return res.status(403).json({
        success: false,
        message: 'You are blocked by this user'
      });
    }

    // Get messages between two users
    const total = await Message.countDocuments({
      $or: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    });

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    })
      .populate('senderId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Mark messages as read
    await Message.updateMany(
      {
        senderId: userId,
        recipientId: currentUserId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        messages: messages.reverse(),
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        },
        otherUser: {
          _id: otherUser._id,
          username: otherUser.username,
          displayName: otherUser.displayName,
          avatar: otherUser.avatar,
          status: otherUser.status,
          lastSeen: otherUser.lastSeen
        }
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving chat history',
      error: error.message
    });
  }
};

// @desc    Get group messages
// @route   GET /api/messages/groups/:groupId
// @access  Private
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Message.countDocuments({ groupId });

    const messages = await Message.find({ groupId })
      .populate('senderId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      message: 'Group messages retrieved successfully',
      data: {
        messages: messages.reverse(),
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      }
    });
  } catch (error) {
    console.error('Get group messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving group messages',
      error: error.message
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
// @access  Private
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or recipient
    if (message.senderId.toString() !== userId && message.recipientId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete - add user to deletedBy array
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
    }

    // Hard delete if both users have deleted it
    if (message.deletedBy.length >= 2) {
      await Message.findByIdAndDelete(messageId);
    } else {
      await message.save();
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// @desc    Edit message
// @route   PUT /api/messages/:messageId
// @access  Private
exports.editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Can't edit messages older than 5 minutes
    const messageAge = Date.now() - message.createdAt;
    if (messageAge > 5 * 60 * 1000) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit messages within 5 minutes of sending'
      });
    }

    message.content = content;
    message.editedAt = new Date();
    await message.save();

    await message.populate('senderId', 'username displayName avatar');

    res.status(200).json({
      success: true,
      message: 'Message edited successfully',
      data: message
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error editing message',
      error: error.message
    });
  }
};

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
exports.searchMessages = async (req, res) => {
  try {
    const { query, userId, groupId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let searchFilter = {
      content: { $regex: query, $options: 'i' }
    };

    if (userId) {
      searchFilter.$or = [
        { senderId: userId },
        { recipientId: userId }
      ];
    }

    if (groupId) {
      searchFilter.groupId = groupId;
    }

    const total = await Message.countDocuments(searchFilter);

    const messages = await Message.find(searchFilter)
      .populate('senderId', 'username displayName avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    res.status(200).json({
      success: true,
      message: 'Messages found',
      data: {
        messages,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page
        }
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching messages',
      error: error.message
    });
  }
};

// @desc    Add reaction to message
// @route   POST /api/messages/:messageId/reaction
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.userId;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user already reacted with same emoji
    const existingReaction = message.reactions.findIndex(
      r => r.userId.toString() === userId && r.emoji === emoji
    );

    if (existingReaction !== -1) {
      // Remove reaction
      message.reactions.splice(existingReaction, 1);
    } else {
      // Add reaction
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Reaction added successfully',
      data: message
    });
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reaction',
      error: error.message
    });
  }
};
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (adminId, action, details = {}, targetUserId = null, targetMessageId = null, req = null) => {
  try {
    const logData = {
      adminId,
      action,
      description: `Admin performed action: ${action}`,
      details,
      targetUserId,
      targetMessageId,
      status: 'success'
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

const logError = async (adminId, action, errorMessage, req = null) => {
  try {
    const logData = {
      adminId,
      action,
      description: `Admin action failed: ${action}`,
      errorMessage,
      status: 'failed'
    };

    if (req) {
      logData.ipAddress = req.ip || req.connection.remoteAddress;
      logData.userAgent = req.get('user-agent');
    }

    await ActivityLog.create(logData);
  } catch (error) {
    console.error('Error logging activity error:', error);
  }
};

module.exports = {
  logActivity,
  logError
};
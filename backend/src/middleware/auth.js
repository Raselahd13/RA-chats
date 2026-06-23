const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided, authorization denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
};

// Middleware to check if user is superuser
const adminAuth = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== 'superuser') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Superuser privileges required.'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying admin privileges',
      error: error.message
    });
  }
};

module.exports = {
  auth,
  adminAuth
};
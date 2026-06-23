const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllUsers,
  getUserDetails,
  blockUser,
  unblockUser,
  deleteUser,
  resetUserPassword,
  deleteMessage
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require auth and admin privileges
router.use(auth, adminAuth);

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.post('/users/:userId/block', blockUser);
router.post('/users/:userId/unblock', unblockUser);
router.delete('/users/:userId', deleteUser);
router.post('/users/:userId/reset-password', resetUserPassword);

// Message management
router.delete('/messages/:messageId', deleteMessage);

module.exports = router;
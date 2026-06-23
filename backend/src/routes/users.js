const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  searchUsers,
  blockUser,
  unblockUser,
  getBlockedUsers
} = require('../controllers/userController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/search', searchUsers);
router.get('/blocked', getBlockedUsers);
router.post('/:userId/block', blockUser);
router.post('/:userId/unblock', unblockUser);

module.exports = router;
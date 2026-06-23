const express = require('express');
const {
  sendMessage,
  getChatHistory,
  getGroupMessages,
  deleteMessage,
  editMessage,
  searchMessages,
  addReaction
} = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/send', sendMessage);
router.get('/chat/:userId', getChatHistory);
router.get('/groups/:groupId', getGroupMessages);
router.get('/search', searchMessages);
router.delete('/:messageId', deleteMessage);
router.put('/:messageId', editMessage);
router.post('/:messageId/reaction', addReaction);

module.exports = router;
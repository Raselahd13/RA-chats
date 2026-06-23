const express = require('express');
const {
  initiateCall,
  answerCall,
  rejectCall,
  endCall,
  getCallHistory
} = require('../controllers/callController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post('/initiate', initiateCall);
router.post('/:callId/answer', answerCall);
router.post('/:callId/reject', rejectCall);
router.post('/:callId/end', endCall);
router.get('/history', getCallHistory);

module.exports = router;
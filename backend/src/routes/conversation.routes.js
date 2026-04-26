const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { 
  getConversations, getConversation, createConversation, sendMessage, markAsRead 
} = require('../controllers/conversation.controller');

router.use(protect);

router.get('/', getConversations);
router.get('/:id', getConversation);
router.post('/', createConversation);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markAsRead);

module.exports = router;

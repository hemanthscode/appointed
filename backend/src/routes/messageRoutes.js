const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { checkConversationAccess } = require('../middleware/roleCheck');
const validation = require('../middleware/validation');
const { messageLimiter } = require('../config/rateLimit');
const uploadMiddleware = require('../config/multer');

router.use(protect);

router.get('/conversations', validation.validatePagination, messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/search', validation.validatePagination, messageController.searchMessages);

router.post('/send', messageLimiter, uploadMiddleware.any, validation.validateMessage, messageController.sendMessage);

router.route('/:conversationId')
  .get(validation.validateMongoId('conversationId'), checkConversationAccess, validation.validatePagination, messageController.getMessages)
  .delete(validation.validateMongoId('conversationId'), checkConversationAccess, messageController.deleteConversation);

router.patch('/:conversationId/read', validation.validateMongoId('conversationId'), checkConversationAccess, messageController.markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { checkConversationAccess } = require('../middleware/roleCheck');
const validators = require('../utils/validators');
const { messageLimiter } = require('../config/rateLimit');
const uploadMiddleware = require('../config/multer');

router.use(protect);

router.get('/conversations', validators.validatePagination, messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);
router.get('/search', validators.validatePagination, messageController.searchMessages);

router.post('/create-direct', validators.validateMongoId('participantId'), messageController.createDirectConversation);

router.post('/create-group', validators.validateMongoIdArray('participants'), validators.validateGroupCreation, messageController.createGroupConversation);

router.post('/send', messageLimiter, uploadMiddleware.any, validators.validateMessage, messageController.sendMessage);

router.route('/:conversationId')
  .get(validators.validateMongoId('conversationId'), checkConversationAccess, validators.validatePagination, messageController.getMessages)
  .delete(validators.validateMongoId('conversationId'), checkConversationAccess, messageController.deleteConversation);

router.patch('/:conversationId/read', validators.validateMongoId('conversationId'), checkConversationAccess, messageController.markAsRead);

module.exports = router;

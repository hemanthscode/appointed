const express = require('express');
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  getUnreadCount,
  searchMessages
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');
const {
  checkConversationAccess
} = require('../middleware/roleCheck');
const {
  validateMessage,
  validateMongoId,
  validatePagination
} = require('../middleware/validation');
const { messageLimiter } = require('../middleware/rateLimit');
const uploadMiddleware = require('../config/multer');

const router = express.Router();

// All routes are protected
router.use(protect);

// Conversation routes
router.get('/conversations', validatePagination, getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/search', validatePagination, searchMessages);

// Send message with optional file attachment
router.post('/send', 
  messageLimiter,
  uploadMiddleware.any,
  validateMessage,
  sendMessage
);

// Specific conversation routes
router.route('/:conversationId')
  .get(
    validateMongoId('conversationId'),
    checkConversationAccess,
    validatePagination,
    getMessages
  )
  .delete(
    validateMongoId('conversationId'),
    checkConversationAccess,
    deleteConversation
  );

// Mark messages as read
router.patch('/:conversationId/read',
  validateMongoId('conversationId'),
  checkConversationAccess,
  markAsRead
);

module.exports = router;

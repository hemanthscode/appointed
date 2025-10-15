const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { validateMongoId, validatePagination } = require('../middleware/validation');

const router = express.Router();

router.use(protect);

router.get('/', validatePagination, getNotifications);
router.patch('/:id/read', validateMongoId('id'), markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:id', validateMongoId('id'), deleteNotification);
router.get('/unread-count', getUnreadCount);

module.exports = router;

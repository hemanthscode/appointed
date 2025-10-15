const Notification = require('../models/Notification');
const helpers = require('../utils/helpers');
const constants = require('../utils/constants');

/**
 * Get notifications for user with pagination and filters
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, unreadOnly = false, type = null } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .populate('sender', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Notification.countDocuments(query);

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ notifications, pagination: helpers.calculatePagination(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

/**
 * Mark single notification as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!notification) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Notification not found'));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(notification, 'Notification marked as read'));
  } catch (err) {
    next(err);
  }
};

/**
 * Mark all notifications as read
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'All notifications marked as read'));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete notification
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, recipient: req.user._id });
    if (!notification) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Notification not found'));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Notification deleted'));
  } catch (err) {
    next(err);
  }
};

const Notification = require('../models/Notification');
const { getSocketIO } = require('../config/socket');
const constants = require('../utils/constants');

const notificationService = {
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      await notification.populate('sender', 'name role');
      const io = getSocketIO();
      io.to(`user_${notification.recipient}`).emit(constants.SOCKET_EVENTS.NEW_NOTIFICATION, {
        id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority,
        sender: notification.sender,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText
      });
      return notification;
    } catch (error) {
      throw error;
    }
  },

  async getNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unreadOnly = false, type = null } = options;
    const query = { recipient: userId };
    if (unreadOnly) query.isRead = false;
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .populate('sender', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    return {
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  },

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  },

  async deleteNotification(notificationId, userId) {
    return await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  }
};

module.exports = notificationService;

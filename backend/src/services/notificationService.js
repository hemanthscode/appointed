const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

const notificationService = {
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      await notification.populate('sender', 'name role');
      emitToUser(notification.recipient, 'new_notification', {
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
      console.error('Create notification error:', error);
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
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return {
      notifications,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unreadCount
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
  },

  async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  },

  async createAppointmentNotification(type, appointment, sender) {
    const notifications = [];

    switch (type) {
      case 'new_request':
        notifications.push(await this.createNotification({
          recipient: appointment.teacher,
          sender: sender._id,
          type: 'appointment',
          title: 'New Appointment Request',
          message: `${sender.name} has requested an appointment`,
          priority: 'medium',
          relatedId: appointment._id,
          relatedModel: 'Appointment',
          actionUrl: `/appointments/${appointment._id}`,
          actionText: 'View Request'
        }));
        break;

      case 'confirmed':
        notifications.push(await this.createNotification({
          recipient: appointment.student,
          sender: sender._id,
          type: 'appointment',
          title: 'Appointment Confirmed',
          message: `Your appointment with ${sender.name} has been confirmed`,
          priority: 'high',
          relatedId: appointment._id,
          relatedModel: 'Appointment',
          actionUrl: `/appointments/${appointment._id}`,
          actionText: 'View Details'
        }));
        break;

      case 'rejected':
        notifications.push(await this.createNotification({
          recipient: appointment.student,
          sender: sender._id,
          type: 'appointment',
          title: 'Appointment Rejected',
          message: `Your appointment request has been rejected`,
          priority: 'medium',
          relatedId: appointment._id,
          relatedModel: 'Appointment',
          actionUrl: `/appointments/${appointment._id}`,
          actionText: 'View Details'
        }));
        break;

      case 'cancelled':
        const recipientId = sender._id.toString() === appointment.student.toString()
          ? appointment.teacher
          : appointment.student;
        notifications.push(await this.createNotification({
          recipient: recipientId,
          sender: sender._id,
          type: 'appointment',
          title: 'Appointment Cancelled',
          message: `Appointment on ${appointment.date.toDateString()} has been cancelled`,
          priority: 'medium',
          relatedId: appointment._id,
          relatedModel: 'Appointment'
        }));
        break;

      case 'reminder':
        notifications.push(
          await this.createNotification({
            recipient: appointment.student,
            type: 'reminder',
            title: 'Appointment Reminder',
            message: `Your appointment with ${appointment.teacher.name} is in 1 hour`,
            priority: 'high',
            relatedId: appointment._id,
            relatedModel: 'Appointment',
            actionUrl: `/appointments/${appointment._id}`,
            actionText: 'View Details'
          }),
          await this.createNotification({
            recipient: appointment.teacher,
            type: 'reminder',
            title: 'Appointment Reminder',
            message: `Your appointment with ${appointment.student.name} is in 1 hour`,
            priority: 'high',
            relatedId: appointment._id,
            relatedModel: 'Appointment',
            actionUrl: `/appointments/${appointment._id}`,
            actionText: 'View Details'
          })
        );
        break;
    }

    return notifications;
  },

  async createSystemNotification(users, title, message, priority = 'medium') {
    const notifications = [];
    for (const userId of users) {
      notifications.push(await this.createNotification({
        recipient: userId,
        type: 'system',
        title,
        message,
        priority
      }));
    }
    return notifications;
  },

  async scheduleAppointmentReminders() {
    const Appointment = require('../models/Appointment');
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);

    const upcoming = await Appointment.find({
      date: { $gte: new Date(), $lte: oneHourFromNow },
      status: 'confirmed',
      reminderSent: false
    }).populate('student teacher', 'name email');

    for (const appt of upcoming) {
      await this.createAppointmentNotification('reminder', appt);
      appt.reminderSent = true;
      appt.reminderSentAt = new Date();
      await appt.save();
    }

    console.info(`Sent reminders for ${upcoming.length} appointments`);
    return upcoming.length;
  }
};

module.exports = notificationService;

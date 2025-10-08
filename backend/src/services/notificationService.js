const Notification = require('../models/Notification');
const { emitToUser } = require('../config/socket');

const notificationService = {
  // Create a new notification
  createNotification: async (notificationData) => {
    try {
      const notification = await Notification.create(notificationData);
      
      // Populate sender information
      await notification.populate('sender', 'name role');
      
      // Emit real-time notification
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
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  // Get notifications for a user
  getNotifications: async (userId, options = {}) => {
    const {
      page = 1,
      limit = 20,
      unreadOnly = false,
      type = null
    } = options;

    const query = { recipient: userId };
    
    if (unreadOnly) {
      query.isRead = false;
    }
    
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      unreadCount
    };
  },

  // Mark notification as read
  markAsRead: async (notificationId, userId) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    return notification;
  },

  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result;
  },

  // Delete notification
  deleteNotification: async (notificationId, userId) => {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    return notification;
  },

  // Get unread count for a user
  getUnreadCount: async (userId) => {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false
    });

    return count;
  },

  // Create appointment-related notifications
  createAppointmentNotification: async (type, appointment, sender) => {
    const notifications = [];

    switch (type) {
      case 'new_request':
        notifications.push(await notificationService.createNotification({
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
        notifications.push(await notificationService.createNotification({
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
        notifications.push(await notificationService.createNotification({
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
        
        notifications.push(await notificationService.createNotification({
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
        // Send reminder to both student and teacher
        notifications.push(
          await notificationService.createNotification({
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
          await notificationService.createNotification({
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

  // Create system notifications
  createSystemNotification: async (users, title, message, priority = 'medium') => {
    const notifications = [];

    for (const userId of users) {
      notifications.push(await notificationService.createNotification({
        recipient: userId,
        type: 'system',
        title,
        message,
        priority
      }));
    }

    return notifications;
  },

  // Schedule appointment reminders (would be called by a cron job)
  scheduleAppointmentReminders: async () => {
    const Appointment = require('../models/Appointment');
    
    // Find appointments that are 1 hour away and haven't been reminded
    const oneHourFromNow = new Date();
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1);
    
    const upcomingAppointments = await Appointment.find({
      date: {
        $gte: new Date(),
        $lte: oneHourFromNow
      },
      status: 'confirmed',
      reminderSent: false
    }).populate('student teacher', 'name email');

    for (const appointment of upcomingAppointments) {
      await notificationService.createAppointmentNotification('reminder', appointment);
      
      // Mark reminder as sent
      appointment.reminderSent = true;
      appointment.reminderSentAt = new Date();
      await appointment.save();
    }

    console.log(`Sent reminders for ${upcomingAppointments.length} appointments`);
    return upcomingAppointments.length;
  }
};

module.exports = notificationService;

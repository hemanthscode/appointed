const mongoose = require('mongoose');
const constants = require('../utils/constants');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: Object.values(constants.NOTIFICATION_TYPES),
    required: true
  },
  priority: {
    type: String,
    enum: Object.values(constants.NOTIFICATION_PRIORITIES),
    default: constants.NOTIFICATION_PRIORITIES.MEDIUM
  },
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: {
    type: String,
    enum: [constants.COLLECTIONS.APPOINTMENTS, constants.COLLECTIONS.MESSAGES, constants.COLLECTIONS.USERS]
  },
  actionUrl: String,
  actionText: String,
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  deliveryMethod: {
    type: [String],
    enum: ['push', 'email', 'sms'],
    default: ['push']
  },
  deliveryStatus: {
    push: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    },
    email: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    },
    sms: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient retrieval of notifications
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model(constants.COLLECTIONS.NOTIFICATIONS, notificationSchema);

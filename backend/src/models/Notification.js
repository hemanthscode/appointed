const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['appointment', 'message', 'system', 'reminder', 'approval'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Related data
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: {
    type: String,
    enum: ['Appointment', 'Message', 'User']
  },
  // Actions
  actionUrl: String,
  actionText: String,
  // Status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  // Delivery
  deliveryMethod: {
    type: [String],
    enum: ['push', 'email', 'sms'],
    default: ['push']
  },
  deliveryStatus: {
    push: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
    email: { type: String, enum: ['sent', 'delivered', 'failed'] },
    sms: { type: String, enum: ['sent', 'delivered', 'failed'] }
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

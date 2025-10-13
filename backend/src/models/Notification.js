const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: [true, 'Title is required'], maxlength: [100, 'Title max 100 chars'] },
  message: { type: String, required: [true, 'Message is required'], maxlength: [500, 'Message max 500 chars'] },
  type: { type: String, enum: ['appointment', 'message', 'system', 'reminder', 'approval'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  relatedId: mongoose.Schema.Types.ObjectId,
  relatedModel: { type: String, enum: ['Appointment', 'Message', 'User'] },
  actionUrl: String,
  actionText: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
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

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

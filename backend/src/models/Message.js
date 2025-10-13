const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: [true, 'Message content is required'], maxlength: [1000, 'Message max 1000 chars'] },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
  editedAt: Date
}, {
  timestamps: true
});

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);

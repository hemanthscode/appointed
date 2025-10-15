const mongoose = require('mongoose');
const constants = require('../utils/constants');

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.CONVERSATIONS,
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: true
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [1000, 'Message must not exceed 1000 characters']
  },
  messageType: {
    type: String,
    enum: Object.values(constants.MESSAGE_TYPES),
    default: constants.MESSAGE_TYPES.TEXT
  },
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Indexes for fetching conversation messages by time and sender/receiver states
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model(constants.COLLECTIONS.MESSAGES, messageSchema);

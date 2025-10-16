const mongoose = require('mongoose');
const constants = require('../utils/constants');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: true
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.MESSAGES
  },
  lastMessageTime: Date,
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS
  }]
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageTime: -1 });
conversationSchema.index(
  { participants: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'direct' } }
);

module.exports = mongoose.model(constants.COLLECTIONS.CONVERSATIONS, conversationSchema);

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const helpers = require('../utils/helpers');
const constants = require('../utils/constants');

/**
 * Get list of user's conversations with pagination
 */
exports.getConversations = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;

    const query = { participants: req.user._id, isActive: true };

    const total = await Conversation.countDocuments(query);

    const conversations = await Conversation.find(query)
      .populate({ path: 'participants', select: 'name email role avatar status', match: { _id: { $ne: req.user._id } } })
      .populate({ path: 'lastMessage', select: 'content createdAt messageType' })
      .sort({ lastMessageTime: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const results = conversations.map(conv => {
      const other = conv.participants[0];
      const unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;

      return {
        id: conv._id,
        name: other?.name,
        role: other?.role,
        avatar: other?.avatar,
        online: other?.status === constants.USER_STATUS.ACTIVE,
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        time: conv.lastMessageTime ? conv.lastMessageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
        unread: unreadCount,
        lastMessageTime: conv.lastMessageTime
      };
    });

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ conversations: results, pagination: helpers.calculatePagination(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get messages for conversation with pagination
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found'));

    const total = await Message.countDocuments({ conversation: conversationId, isDeleted: false });

    let messages = await Message.find({ conversation: conversationId, isDeleted: false })
      .populate('sender', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Mark unread messages as read
    await Message.updateMany({ conversation: conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

    // Reset unread count for user in conversation
    const unreadMap = conversation.unreadCount || new Map();
    unreadMap.set(req.user._id.toString(), 0);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    messages = messages.reverse();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      messages,
      conversation: {
        id: conversation._id,
        participants: conversation.participants
      },
      pagination: helpers.calculatePagination(total, page, limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Send a new message
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver, content, messageType = constants.MESSAGE_TYPES.TEXT } = req.body;

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Receiver not found'));

    let conversation = await Conversation.findOne({ type: 'direct', participants: { $all: [req.user._id, receiver] } });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [req.user._id, receiver], type: 'direct' });
    }

    // Handle attachments from file upload middleware if any
    let attachment;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver,
      content,
      messageType,
      attachment
    });

    await message.populate('sender', 'name email role avatar');
    await message.populate('receiver', 'name email role');

    conversation.lastMessage = message._id;
    conversation.lastMessageTime = new Date();
    const unreadMap = conversation.unreadCount || new Map();
    unreadMap.set(receiver.toString(), (unreadMap.get(receiver.toString()) || 0) + 1);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(constants.HTTP_STATUS.CREATED).json(helpers.successResponse({ message }, constants.MESSAGES.SUCCESS.MESSAGE_SENT));
  } catch (err) {
    next(err);
  }
};

/**
 * Mark messages in conversation as read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found'));

    await Message.updateMany({ conversation: conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

    const unreadMap = conversation.unreadCount || new Map();
    unreadMap.set(req.user._id.toString(), 0);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Messages marked as read'));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a conversation (soft delete)
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found'));

    conversation.isActive = false;
    await conversation.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Conversation deleted'));
  } catch (err) {
    next(err);
  }
};

/**
 * Get total unread message count
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id, isActive: true });
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount?.get(req.user._id.toString()) || 0), 0);
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ unreadCount: totalUnread }));
  } catch (err) {
    next(err);
  }
};

/**
 * Search messages with query and optional conversation filter
 */
exports.searchMessages = async (req, res, next) => {
  try {
    const { q, conversationId, page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Search query must be at least 3 characters'));
    }

    const searchQuery = { content: { $regex: q, $options: 'i' }, isDeleted: false };
    if (conversationId) {
      searchQuery.conversation = conversationId;
    } else {
      const userConvs = await Conversation.find({ participants: req.user._id }).select('_id');
      searchQuery.conversation = { $in: userConvs.map(c => c._id) };
    }

    const total = await Message.countDocuments(searchQuery);

    const messages = await Message.find(searchQuery)
      .populate('sender', 'name email role')
      .populate('conversation', 'participants')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ messages, pagination: helpers.calculatePagination(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

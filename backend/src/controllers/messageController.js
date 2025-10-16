const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const helpers = require('../utils/helpers');
const constants = require('../utils/constants');

/**
 * Get paginated active conversations excluding those deleted for current user
 */
exports.getConversations = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;

    const query = {
      participants: req.user._id,
      isActive: true,
      deletedFor: { $ne: req.user._id }
    };

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
        name: conv.type === 'group' ? conv.name : other?.name,
        role: other?.role,
        avatar: other?.avatar,
        online: other?.status === constants.USER_STATUS.ACTIVE,
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        time: conv.lastMessageTime ? conv.lastMessageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
        unread: unreadCount,
        lastMessageTime: conv.lastMessageTime,
        type: conv.type
      };
    });

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ conversations: results, pagination: helpers.calculatePagination(total, page, limit) }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get paginated messages for an active conversation excluding those deleted for current user
 */
exports.getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = 50 } = req.query;

    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id, isActive: true, deletedFor: { $ne: req.user._id } });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found or inactive'));

    const total = await Message.countDocuments({ conversation: conversationId, isDeleted: false });

    const messages = await Message.find({ conversation: conversationId, isDeleted: false })
      .populate('sender', 'name email role avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    await Message.updateMany({ conversation: conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

    const unreadMap = conversation.unreadCount || new Map();
    unreadMap.set(req.user._id.toString(), 0);
    conversation.unreadCount = unreadMap;
    await conversation.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      messages: messages.reverse(),
      conversation: { id: conversation._id, participants: conversation.participants },
      pagination: helpers.calculatePagination(total, page, limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Send a new message, creating direct conversation if needed or restoring soft delete status
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiver, content, messageType = constants.MESSAGE_TYPES.TEXT } = req.body;

    const receiverUser = await User.findById(receiver);
    if (!receiverUser) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Receiver not found'));

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, receiver], $size: 2 },
      isActive: true
    });

    if (conversation) {
      if (conversation.deletedFor.includes(req.user._id)) {
        conversation.deletedFor.pull(req.user._id);
        await conversation.save();
      }
    } else {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [req.user._id, receiver],
        unreadCount: {}
      });
    }

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
 * Mark messages as read for current user in conversation
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id, isActive: true, deletedFor: { $ne: req.user._id } });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found or inactive'));

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
 * Soft delete conversation for user; if all delete, mark inactive and mark messages deleted
 */
exports.deleteConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
      isActive: true,
      deletedFor: { $ne: req.user._id }
    });
    if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found or inactive'));

    if (!conversation.deletedFor.includes(req.user._id)) {
      conversation.deletedFor.push(req.user._id);
      await conversation.save();
    }

    const stillActiveParticipants = conversation.participants.filter(p => !conversation.deletedFor.includes(p.toString()));
    if (stillActiveParticipants.length === 0) {
      conversation.isActive = false;
      await Message.updateMany({ conversation: conversation._id }, { isDeleted: true });
      await conversation.save();
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Conversation deleted for you'));
  } catch (err) {
    next(err);
  }
};

/**
 * Get total unread message count for current user
 */
exports.getUnreadCount = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true,
      deletedFor: { $ne: req.user._id }
    });
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount?.get(req.user._id.toString()) || 0), 0);
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ unreadCount: totalUnread }));
  } catch (err) {
    next(err);
  }
};

/**
 * Search messages containing query across user's conversations or within a specific conversation
 */
exports.searchMessages = async (req, res, next) => {
  try {
    const { q, conversationId, page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Search query must be at least 3 characters'));
    }

    const searchQuery = { content: { $regex: q, $options: 'i' }, isDeleted: false };

    if (conversationId) {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: req.user._id,
        isActive: true,
        deletedFor: { $ne: req.user._id }
      });
      if (!conversation) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Conversation not found or inactive'));
      searchQuery.conversation = conversationId;
    } else {
      const userConvs = await Conversation.find({
        participants: req.user._id,
        isActive: true,
        deletedFor: { $ne: req.user._id }
      }).select('_id');
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

/**
 * Create or fetch direct conversation restoring if soft-deleted for current user
 */
exports.createDirectConversation = async (req, res, next) => {
  try {
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json(helpers.errorResponse('Participant ID is required'));

    const participant = await User.findById(participantId);
    if (!participant) return res.status(404).json(helpers.errorResponse('Participant not found'));

    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [req.user._id, participantId], $size: 2 },
      isActive: true
    });

    if (conversation) {
      if (conversation.deletedFor.includes(req.user._id)) {
        conversation.deletedFor.pull(req.user._id);
        await conversation.save();
      }
      return res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(conversation, 'Existing direct conversation fetched'));
    }

    conversation = await Conversation.create({
      type: 'direct',
      participants: [req.user._id, participantId],
      unreadCount: {}
    });

    res.status(constants.HTTP_STATUS.CREATED).json(helpers.successResponse(conversation, 'New direct conversation created'));
  } catch (error) {
    next(error);
  }
};

/**
 * Create a group conversation with validated participants and includes creator if missing
 */
exports.createGroupConversation = async (req, res, next) => {
  try {
    const { name, participants } = req.body;
    if (!name || !participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json(helpers.errorResponse('Group name and at least two participants are required'));
    }

    const userId = req.user._id.toString();
    if (!participants.includes(userId)) participants.push(userId);

    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return res.status(400).json(helpers.errorResponse('One or more participants are invalid'));
    }

    const conversation = await Conversation.create({
      name,
      type: 'group',
      participants,
      unreadCount: {}
    });

    res.status(constants.HTTP_STATUS.CREATED).json(helpers.successResponse(conversation, 'Group conversation created'));
  } catch (error) {
    next(error);
  }
};

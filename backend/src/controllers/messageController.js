const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const conversations = await Conversation.find({ participants: req.user._id, isActive: true })
    .populate({ path: 'participants', select: 'name email role avatar status', match: { _id: { $ne: req.user._id } } })
    .populate({ path: 'lastMessage', select: 'content createdAt messageType' })
    .sort({ lastMessageTime: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Conversation.countDocuments({ participants: req.user._id, isActive: true });

  const results = conversations.map(conv => {
    const other = conv.participants[0];
    const unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;
    return {
      id: conv._id,
      name: other?.name,
      role: other?.role,
      avatar: other?.avatar,
      online: other?.status === 'active',
      lastMessage: conv.lastMessage?.content || 'No messages yet',
      time: conv.lastMessageTime ? conv.lastMessageTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      unread: unreadCount,
      conversationId: conv._id,
      lastMessageTime: conv.lastMessageTime
    };
  });

  res.status(200).json({
    success: true,
    data: { conversations: results, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

  const messages = await Message.find({ conversation: conversationId, isDeleted: false })
    .populate('sender', 'name email role')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  // Mark unread messages as read for this user
  await Message.updateMany({ conversation: conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

  // Reset the user's unread count for this conversation
  const unreadMap = conversation.unreadCount || new Map();
  unreadMap.set(req.user._id.toString(), 0);
  conversation.unreadCount = unreadMap;
  await conversation.save();

  res.status(200).json({
    success: true,
    data: {
      messages: messages.reverse(),
      conversation: {
        id: conversation._id,
        participants: conversation.participants
      },
      pagination: { page, limit, total: await Message.countDocuments({ conversation: conversationId, isDeleted: false }), totalPages: Math.ceil(await Message.countDocuments({ conversation: conversationId, isDeleted: false }) / Number(limit)) }
    }
  });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content, messageType = 'text' } = req.body;

  const receiverUser = await User.findById(receiver);
  if (!receiverUser) return res.status(404).json({ success: false, message: 'Receiver not found' });

  let conversation = await Conversation.findOne({ type: 'direct', participants: { $all: [req.user._id, receiver] } });

  if (!conversation) {
    conversation = await Conversation.create({ participants: [req.user._id, receiver], type: 'direct' });
  }

  let attachment;
  if(req.file) {
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

  conversation.lastMessage = message._id;
  conversation.lastMessageTime = new Date();
  const unreadMap = conversation.unreadCount || new Map();
  unreadMap.set(receiver.toString(), (unreadMap.get(receiver.toString()) || 0) + 1);
  conversation.unreadCount = unreadMap;
  await conversation.save();

  await message.populate([{ path: 'sender', select: 'name email role' }, { path: 'receiver', select: 'name email role' }]);

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message
    }
  });
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

  await Message.updateMany({ conversation: conversationId, receiver: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });

  const unreadMap = conversation.unreadCount || new Map();
  unreadMap.set(req.user._id.toString(), 0);
  conversation.unreadCount = unreadMap;
  await conversation.save();

  res.status(200).json({ success: true, message: 'Messages marked as read' });
});

exports.deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const conversation = await Conversation.findOne({ _id: conversationId, participants: req.user._id });
  if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

  conversation.isActive = false;
  await conversation.save();
  
  res.status(200).json({ success: true, message: 'Conversation deleted' });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ participants: req.user._id, isActive: true });
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount?.get(req.user._id.toString()) || 0), 0);

  res.status(200).json({ success: true, data: { unreadCount: totalUnread } });
});

exports.searchMessages = asyncHandler(async (req, res) => {
  const { q, conversationId, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({ success: false, message: 'Search query must be at least 3 characters' });
  }

  const searchQuery = { content: { $regex: q, $options: 'i' }, isDeleted: false };
  
  if (conversationId) searchQuery.conversation = conversationId;
  else {
    const userConvs = await Conversation.find({ participants: req.user._id }).select('_id');
    searchQuery.conversation = { $in: userConvs.map(c => c._id) };
  }

  const messages = await Message.find(searchQuery)
    .populate('sender', 'name email role')
    .populate('conversation', 'participants')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Message.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: { messages, pagination: { page, limit, total, totalPages: Math.ceil(total / Number(limit)) } }
  });
});

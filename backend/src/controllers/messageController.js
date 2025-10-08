const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { emitToConversation, emitToUser } = require('../config/socket');

// @desc    Get all conversations for user
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true
  })
  .populate({
    path: 'participants',
    select: 'name email role avatar status',
    match: { _id: { $ne: req.user._id } }
  })
  .populate({
    path: 'lastMessage',
    select: 'content createdAt messageType'
  })
  .sort({ lastMessageTime: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  // Add unread count and format response
  const conversationsWithUnread = conversations.map(conv => {
    const conversation = conv.toObject();
    
    // Get unread count for current user
    const unreadCount = conversation.unreadCount?.get(req.user._id.toString()) || 0;
    
    // Get other participant info
    const otherParticipant = conversation.participants[0];
    
    return {
      id: conversation._id,
      name: otherParticipant?.name,
      role: otherParticipant?.role,
      avatar: otherParticipant?.avatar,
      online: otherParticipant?.status === 'active', // Simplified online check
      lastMessage: conversation.lastMessage?.content || 'No messages yet',
      time: conversation.lastMessageTime 
        ? new Date(conversation.lastMessageTime).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        : '',
      unread: unreadCount,
      conversationId: conversation._id,
      lastMessageTime: conversation.lastMessageTime
    };
  });

  const total = await Conversation.countDocuments({
    participants: req.user._id,
    isActive: true
  });

  res.status(200).json({
    success: true,
    data: {
      conversations: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Verify user is participant in conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  // Get messages
  const messages = await Message.find({
    conversation: conversationId,
    isDeleted: false
  })
  .populate('sender', 'name email role')
  .sort({ createdAt: -1 })
  .limit(limit * 1)
  .skip((page - 1) * limit);

  // Mark messages as read for current user
  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: req.user._id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Update conversation unread count
  const unreadCount = conversation.unreadCount || new Map();
  unreadCount.set(req.user._id.toString(), 0);
  conversation.unreadCount = unreadCount;
  await conversation.save();

  // Format messages for frontend
  const formattedMessages = messages.reverse().map(message => ({
    id: message._id,
    message: message.content,
    time: new Date(message.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    isOwn: message.sender._id.toString() === req.user._id.toString(),
    sender: message.sender,
    messageType: message.messageType,
    attachment: message.attachment,
    createdAt: message.createdAt,
    isRead: message.isRead,
    readAt: message.readAt
  }));

  const total = await Message.countDocuments({
    conversation: conversationId,
    isDeleted: false
  });

  res.status(200).json({
    success: true,
    data: {
      messages: formattedMessages,
      conversation: {
        id: conversation._id,
        participants: conversation.participants
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Send a message
// @route   POST /api/messages/send
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, content, messageType = 'text' } = req.body;

  // Verify receiver exists
  const receiverUser = await User.findById(receiver).select('name email role');
  if (!receiverUser) {
    return res.status(404).json({
      success: false,
      message: 'Receiver not found'
    });
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    type: 'direct',
    participants: { $all: [req.user._id, receiver] }
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiver],
      type: 'direct'
    });
  }

  // Create message
  const message = await Message.create({
    conversation: conversation._id,
    sender: req.user._id,
    receiver,
    content,
    messageType,
    attachment: req.file ? {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : undefined
  });

  // Update conversation
  conversation.lastMessage = message._id;
  conversation.lastMessageTime = new Date();
  
  // Update unread count for receiver
  const unreadCount = conversation.unreadCount || new Map();
  const currentUnread = unreadCount.get(receiver.toString()) || 0;
  unreadCount.set(receiver.toString(), currentUnread + 1);
  conversation.unreadCount = unreadCount;
  
  await conversation.save();

  // Populate message for response
  await message.populate([
    { path: 'sender', select: 'name email role' },
    { path: 'receiver', select: 'name email role' }
  ]);

  // Emit real-time message to conversation participants
  emitToConversation(conversation._id, 'message_received', {
    id: message._id,
    message: message.content,
    time: new Date(message.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }),
    sender: {
      id: req.user._id,
      name: req.user.name
    },
    messageType: message.messageType,
    conversationId: conversation._id,
    createdAt: message.createdAt
  });

  // Emit notification to receiver
  emitToUser(receiver, 'new_message_notification', {
    conversationId: conversation._id,
    sender: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role
    },
    message: content,
    timestamp: new Date()
  });

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      message: {
        id: message._id,
        message: message.content,
        time: new Date(message.createdAt).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isOwn: true,
        sender: message.sender,
        messageType: message.messageType,
        attachment: message.attachment,
        conversationId: conversation._id
      }
    }
  });
});

// @desc    Mark messages as read
// @route   PATCH /api/messages/:conversationId/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  // Verify user is participant
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  // Mark all unread messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: req.user._id,
      isRead: false
    },
    {
      isRead: true,
      readAt: new Date()
    }
  );

  // Update conversation unread count
  const unreadCount = conversation.unreadCount || new Map();
  unreadCount.set(req.user._id.toString(), 0);
  conversation.unreadCount = unreadCount;
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Messages marked as read'
  });
});

// @desc    Delete conversation
// @route   DELETE /api/messages/:conversationId
// @access  Private
const deleteConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: req.user._id
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found'
    });
  }

  // Mark conversation as inactive for this user
  // In a more complex system, you might want to track per-user deletion
  conversation.isActive = false;
  await conversation.save();

  res.status(200).json({
    success: true,
    message: 'Conversation deleted successfully'
  });
});

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
    isActive: true
  });

  let totalUnread = 0;
  conversations.forEach(conv => {
    const unreadCount = conv.unreadCount?.get(req.user._id.toString()) || 0;
    totalUnread += unreadCount;
  });

  res.status(200).json({
    success: true,
    data: {
      unreadCount: totalUnread
    }
  });
});

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
const searchMessages = asyncHandler(async (req, res) => {
  const { q, conversationId, page = 1, limit = 20 } = req.query;

  if (!q || q.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Search query must be at least 3 characters'
    });
  }

  // Build search query
  const searchQuery = {
    content: { $regex: q, $options: 'i' },
    isDeleted: false
  };

  // Limit to specific conversation if provided
  if (conversationId) {
    searchQuery.conversation = conversationId;
  } else {
    // Only search in conversations user is part of
    const userConversations = await Conversation.find({
      participants: req.user._id
    }).select('_id');
    
    searchQuery.conversation = {
      $in: userConversations.map(conv => conv._id)
    };
  }

  const messages = await Message.find(searchQuery)
    .populate('sender', 'name email role')
    .populate('conversation', 'participants')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Message.countDocuments(searchQuery);

  res.status(200).json({
    success: true,
    data: {
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  getUnreadCount,
  searchMessages
};

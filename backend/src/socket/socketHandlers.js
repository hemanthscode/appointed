const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const notificationService = require('../services/notificationService');

const socketHandlers = (io) => {

  // Client connected
  const onConnection = (socket) => {
    io.to(socket.id).emit('connected', { message: 'Connection established' });

    socket.join(`user_${socket.userId}`);
    updateOnlineStatus(socket, true);

    socket.on('join_conversation', (convId) => {
      socket.join(`conversation_${convId}`);
      io.to(`conversation_${convId}`).emit('user_joined', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    });

    socket.on('leave_conversation', (convId) => {
      socket.leave(`conversation_${convId}`);
      io.to(`conversation_${convId}`).emit('user_left', {
        userId: socket.userId,
        userName: socket.userName,
        timestamp: new Date()
      });
    });

    socket.on('new_message', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', receiverId } = data;
        if (!conversationId || !content || !receiverId) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.includes(socket.userId)) {
          socket.emit('error', { message: 'Access denied or conversation not found' });
          return;
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType
        });

        await message.populate('sender', 'name role avatar');
        await message.populate('receiver', 'name role avatar');

        conversation.lastMessage = message._id;
        conversation.lastMessageTime = new Date();
        const unreadMap = conversation.unreadCount || new Map();
        unreadMap.set(receiverId, (unreadMap.get(receiverId) || 0) + 1);
        conversation.unreadCount = unreadMap;

        await conversation.save();

        const msgData = {
          id: message._id,
          content,
          messageType,
          sender: { id: message.sender._id, name: message.sender.name, role: message.sender.role, avatar: message.sender.avatar },
          receiver: { id: message.receiver._id, name: message.receiver.name },
          conversationId,
          timestamp: message.createdAt,
          isRead: false
        };

        io.to(`conversation_${conversationId}`).emit('message_received', msgData);

        const receiverSockets = await io.in(`user_${receiverId}`).fetchSockets();
        const receiverInConv = receiverSockets.some(s => s.rooms.has(`conversation_${conversationId}`));

        if (!receiverInConv) {
          io.to(`user_${receiverId}`).emit('new_message_notification', {
            conversationId,
            sender: { id: socket.userId, name: socket.userName, role: socket.userRole },
            preview: content.slice(0, 50),
            timestamp: new Date()
          });

          await notificationService.createNotification({
            recipient: receiverId,
            sender: socket.userId,
            type: 'message',
            title: 'New Message',
            message: `${socket.userName} sent you a message`,
            relatedId: conversationId,
            relatedModel: 'Conversation'
          });
        }

        socket.emit('message_sent', { tempId: data.tempId, messageId: message._id, timestamp: message.createdAt });
      } catch (error) {
        socket.emit('error', { message: 'Unable to send message' });
      }
    });

    socket.on('typing_start', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName,
        conversationId: data.conversationId,
        timestamp: new Date()
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
        userId: socket.userId,
        conversationId: data.conversationId,
        timestamp: new Date()
      });
    });

    socket.on('appointment_update', async (data) => {
      // See detailed implementation in controllers/services
    });

    socket.on('update_status', async (data) => {
      // See detailed implementation in controllers/services
    });

    socket.on('disconnect', async (reason) => {
      updateOnlineStatus(socket, false);
    });
  };

  async function updateOnlineStatus(socket, online) {
    try {
      await User.findByIdAndUpdate(socket.userId, { status: online ? 'active' : 'inactive', lastSeen: new Date() });
      notifyContacts(socket.userId, online);
    } catch (error) {
      // log error
    }
  }

  async function notifyContacts(userId, online) {
    try {
      const conversations = await Conversation.find({ participants: userId }).populate('participants');
      const contacts = conversations.flatMap(c => c.participants.filter(u => u._id.toString() !== userId));
      const uniqueContacts = [...new Set(contacts.map(c => c._id.toString()))];
      uniqueContacts.forEach(contactId => {
        io.to(`user_${contactId}`).emit('contact_status_update', { userId, status: online ? 'online' : 'offline', timestamp: new Date() });
      });
    } catch (error) {
      // log error
    }
  }

  return {
    onConnection
  };
};

module.exports = socketHandlers;

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const notificationService = require('../services/notificationService');

// Socket event handlers
const socketHandlers = (io) => {
  
  // Handle new connection
  const handleConnection = (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Update user online status
    updateUserOnlineStatus(socket.userId, true);
    
    // Notify user's contacts about online status
    notifyContactsOnlineStatus(socket.userId, true);
  };

  // Handle user joining a conversation
  const handleJoinConversation = (socket, conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`📞 User ${socket.userId} joined conversation ${conversationId}`);
    
    // Notify other participants
    socket.to(`conversation_${conversationId}`).emit('user_joined', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date()
    });
  };

  // Handle user leaving a conversation
  const handleLeaveConversation = (socket, conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`📱 User ${socket.userId} left conversation ${conversationId}`);
    
    // Notify other participants
    socket.to(`conversation_${conversationId}`).emit('user_left', {
      userId: socket.userId,
      userName: socket.userName,
      timestamp: new Date()
    });
  };

  // Handle new message
  const handleNewMessage = async (socket, data) => {
    try {
      const { conversationId, content, messageType = 'text', receiverId } = data;

      // Validate message data
      if (!conversationId || !content || !receiverId) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      // Check if conversation exists and user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Create message in database
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        receiver: receiverId,
        content,
        messageType
      });

      await message.populate([
        { path: 'sender', select: 'name role avatar' },
        { path: 'receiver', select: 'name role avatar' }
      ]);

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.lastMessageTime = new Date();
      
      // Update unread count for receiver
      const unreadCount = conversation.unreadCount || new Map();
      const currentUnread = unreadCount.get(receiverId.toString()) || 0;
      unreadCount.set(receiverId.toString(), currentUnread + 1);
      conversation.unreadCount = unreadCount;
      
      await conversation.save();

      // Format message for real-time transmission
      const messageData = {
        id: message._id,
        content: message.content,
        messageType: message.messageType,
        sender: {
          id: message.sender._id,
          name: message.sender.name,
          role: message.sender.role,
          avatar: message.sender.avatar
        },
        receiver: {
          id: message.receiver._id,
          name: message.receiver.name
        },
        conversationId,
        timestamp: message.createdAt,
        isRead: false
      };

      // Emit to conversation participants
      io.to(`conversation_${conversationId}`).emit('message_received', messageData);

      // Send push notification to receiver if they're not in the conversation
      const receiverSockets = await io.in(`user_${receiverId}`).fetchSockets();
      const isReceiverInConversation = receiverSockets.some(s => 
        s.rooms.has(`conversation_${conversationId}`)
      );

      if (!isReceiverInConversation) {
        io.to(`user_${receiverId}`).emit('new_message_notification', {
          conversationId,
          sender: messageData.sender,
          preview: content.substring(0, 50),
          timestamp: new Date()
        });

        // Create notification in database
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

      // Confirm message sent to sender
      socket.emit('message_sent', {
        tempId: data.tempId, // Client-side temporary ID
        messageId: message._id,
        timestamp: message.createdAt
      });

    } catch (error) {
      console.error('Error handling new message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  };

  // Handle typing indicators
  const handleTypingStart = (socket, data) => {
    const { conversationId } = data;
    
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.userName,
      conversationId,
      timestamp: new Date()
    });
  };

  const handleTypingStop = (socket, data) => {
    const { conversationId } = data;
    
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId: socket.userId,
      conversationId,
      timestamp: new Date()
    });
  };

  // Handle appointment updates
  const handleAppointmentUpdate = async (socket, data) => {
    try {
      const { appointmentId, action, message } = data;

      // Verify appointment exists and user has access
      const appointment = await Appointment.findById(appointmentId)
        .populate('student teacher', 'name email role');

      if (!appointment) {
        socket.emit('error', { message: 'Appointment not found' });
        return;
      }

      const userId = socket.userId;
      const isStudent = appointment.student._id.toString() === userId;
      const isTeacher = appointment.teacher._id.toString() === userId;

      if (!isStudent && !isTeacher) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Determine the other party
      const otherPartyId = isStudent ? appointment.teacher._id : appointment.student._id;
      const otherPartyName = isStudent ? appointment.teacher.name : appointment.student.name;

      // Emit update to the other party
      io.to(`user_${otherPartyId}`).emit('appointment_updated', {
        appointmentId,
        action,
        message,
        updatedBy: {
          id: userId,
          name: socket.userName,
          role: socket.userRole
        },
        timestamp: new Date()
      });

      // Create notification
      let notificationTitle = '';
      let notificationMessage = '';

      switch (action) {
        case 'request':
          notificationTitle = 'New Appointment Request';
          notificationMessage = `${socket.userName} requested an appointment`;
          break;
        case 'approve':
          notificationTitle = 'Appointment Approved';
          notificationMessage = `Your appointment was approved by ${socket.userName}`;
          break;
        case 'reject':
          notificationTitle = 'Appointment Rejected';
          notificationMessage = `Your appointment was rejected by ${socket.userName}`;
          break;
        case 'cancel':
          notificationTitle = 'Appointment Cancelled';
          notificationMessage = `Appointment was cancelled by ${socket.userName}`;
          break;
        case 'reschedule':
          notificationTitle = 'Appointment Rescheduled';
          notificationMessage = `Appointment was rescheduled by ${socket.userName}`;
          break;
      }

      if (notificationTitle) {
        await notificationService.createNotification({
          recipient: otherPartyId,
          sender: userId,
          type: 'appointment',
          title: notificationTitle,
          message: notificationMessage,
          relatedId: appointmentId,
          relatedModel: 'Appointment'
        });
      }

    } catch (error) {
      console.error('Error handling appointment update:', error);
      socket.emit('error', { message: 'Failed to update appointment' });
    }
  };

  // Handle user status updates
  const handleStatusUpdate = async (socket, data) => {
    try {
      const { status } = data; // online, away, busy, offline
      
      // Update user status in database
      await User.findByIdAndUpdate(socket.userId, { 
        status: status === 'offline' ? 'inactive' : 'active',
        lastSeen: new Date()
      });

      // Broadcast status to user's contacts
      notifyContactsOnlineStatus(socket.userId, status);

    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Handle video call events
  const handleVideoCall = (socket, data) => {
    const { conversationId, callType, offer, answer, candidate } = data;

    if (offer) {
      // Forward call offer to other participants
      socket.to(`conversation_${conversationId}`).emit('video_call_offer', {
        from: socket.userId,
        fromName: socket.userName,
        conversationId,
        callType,
        offer
      });
    } else if (answer) {
      // Forward call answer
      socket.to(`conversation_${conversationId}`).emit('video_call_answer', {
        from: socket.userId,
        answer
      });
    } else if (candidate) {
      // Forward ICE candidate
      socket.to(`conversation_${conversationId}`).emit('video_call_candidate', {
        from: socket.userId,
        candidate
      });
    }
  };

  // Handle call end
  const handleCallEnd = (socket, data) => {
    const { conversationId } = data;
    
    socket.to(`conversation_${conversationId}`).emit('video_call_ended', {
      from: socket.userId,
      timestamp: new Date()
    });
  };

  // Handle file sharing
  const handleFileShare = async (socket, data) => {
    try {
      const { conversationId, fileName, fileSize, fileType } = data;

      // Emit file sharing notification to conversation
      socket.to(`conversation_${conversationId}`).emit('file_shared', {
        from: socket.userId,
        fromName: socket.userName,
        fileName,
        fileSize,
        fileType,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Error handling file share:', error);
      socket.emit('error', { message: 'Failed to share file' });
    }
  };

  // Handle user disconnect
  const handleDisconnect = async (socket, reason) => {
    console.log(`❌ User disconnected: ${socket.userName} (${socket.userId}) - Reason: ${reason}`);
    
    // Update user offline status
    await updateUserOnlineStatus(socket.userId, false);
    
    // Notify contacts about offline status
    notifyContactsOnlineStatus(socket.userId, false);
    
    // Leave all rooms
    const rooms = Array.from(socket.rooms);
    rooms.forEach(room => {
      if (room.startsWith('conversation_')) {
        socket.to(room).emit('user_left', {
          userId: socket.userId,
          userName: socket.userName,
          timestamp: new Date()
        });
      }
    });
  };

  // Helper functions
  const updateUserOnlineStatus = async (userId, isOnline) => {
    try {
      await User.findByIdAndUpdate(userId, {
        status: isOnline ? 'active' : 'inactive',
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating user online status:', error);
    }
  };

  const notifyContactsOnlineStatus = async (userId, isOnline) => {
    try {
      // Find user's conversations to get their contacts
      const conversations = await Conversation.find({
        participants: userId
      }).populate('participants', '_id');

      // Get all unique contact IDs
      const contactIds = new Set();
      conversations.forEach(conv => {
        conv.participants.forEach(participant => {
          if (participant._id.toString() !== userId) {
            contactIds.add(participant._id.toString());
          }
        });
      });

      // Emit status update to all contacts
      contactIds.forEach(contactId => {
        io.to(`user_${contactId}`).emit('contact_status_update', {
          userId,
          status: isOnline ? 'online' : 'offline',
          lastSeen: new Date()
        });
      });

    } catch (error) {
      console.error('Error notifying contacts about status:', error);
    }
  };

  // Return all handlers
  return {
    handleConnection,
    handleJoinConversation,
    handleLeaveConversation,
    handleNewMessage,
    handleTypingStart,
    handleTypingStop,
    handleAppointmentUpdate,
    handleStatusUpdate,
    handleVideoCall,
    handleCallEnd,
    handleFileShare,
    handleDisconnect
  };
};

module.exports = socketHandlers;

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('./auth');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = authConfig.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;
      
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.userId})`);
    
    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Handle joining conversation rooms
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });
    
    // Handle leaving conversation rooms
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });
    
    // Handle new message
    socket.on('new_message', async (data) => {
      try {
        // Emit to conversation room
        socket.to(`conversation_${data.conversationId}`).emit('message_received', {
          ...data,
          senderId: socket.userId,
          senderName: socket.userName,
          timestamp: new Date()
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing_start', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.userName
      });
    });
    
    socket.on('typing_stop', (data) => {
      socket.to(`conversation_${data.conversationId}`).emit('user_stop_typing', {
        userId: socket.userId
      });
    });
    
    // Handle appointment updates
    socket.on('appointment_update', (data) => {
      // Notify relevant users about appointment changes
      if (data.studentId) {
        socket.to(`user_${data.studentId}`).emit('appointment_updated', data);
      }
      if (data.teacherId) {
        socket.to(`user_${data.teacherId}`).emit('appointment_updated', data);
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userName} (${socket.userId})`);
    });
  });

  return io;
};

const getSocketIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

// Utility functions for emitting to specific users/rooms
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(event, data);
  }
};

const emitToConversation = (conversationId, event, data) => {
  if (io) {
    io.to(`conversation_${conversationId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    // Get all connected sockets with specific role
    const connectedSockets = Array.from(io.sockets.sockets.values());
    connectedSockets.forEach(socket => {
      if (socket.userRole === role) {
        socket.emit(event, data);
      }
    });
  }
};

module.exports = {
  initializeSocket,
  getSocketIO,
  emitToUser,
  emitToConversation,
  emitToRole
};

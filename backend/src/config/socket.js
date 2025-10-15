const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SOCKET_EVENTS, HTTP_STATUS, MESSAGES } = require('../utils/constants');
const authConfig = require('./auth');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication token required'));

      const decoded = authConfig.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) return next(new Error('User not found'));
      if (user.status !== 'active') return next(new Error('User not active'));

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.userName = user.name;

      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  return io;
};

const getSocketIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

module.exports = { initializeSocket, getSocketIO };

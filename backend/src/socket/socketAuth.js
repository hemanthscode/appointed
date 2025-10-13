const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

/**
 * Socket Authentication Middleware for Socket.IO
 */
const authenticate = async (socket, next) => {
  try {
    let token = socket.handshake.auth.token
      || (socket.handshake.headers.authorization ? socket.handshake.headers.authorization.split(' ')[1] : null)
      || (socket.handshake.query ? socket.handshake.query.token : null);

    if (!token) return next(new Error('Authentication token required'));

    const decoded = authConfig.verify(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) return next(new Error('User not found'));
    if (user.status !== 'active') return next(new Error('User is not active'));

    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    socket.userEmail = user.email;
    socket.userDepartment = user.department;
    socket.user = user;

    next();
  } catch (err) {
    console.warn('Socket authentication failed:', err.message);
    next(new Error('Authentication failed'));
  }
};

/**
 * Socket Authorization Middleware: restrict to allowed roles
 */
const authorize = (allowedRoles = []) => (socket, next) => {
  if (allowedRoles.length === 0 || allowedRoles.includes(socket.userRole)) return next();
  next(new Error(`Access denied, requires role: ${allowedRoles.join(', ')}`));
};

/**
 * Check resource access for socket user (conversation, appointment, user)
 */
const checkResourceAccess = async (socket, resourceType, resourceId) => {
  try {
    const userId = socket.userId;
    const role = socket.userRole;

    if (resourceType === 'conversation') {
      const Conversation = require('../models/Conversation');
      const conv = await Conversation.findById(resourceId);
      if (!conv) return false;
      if (role === 'admin') return true;
      return conv.participants.some(p => p.toString() === userId);
    }

    if (resourceType === 'appointment') {
      const Appointment = require('../models/Appointment');
      const appt = await Appointment.findById(resourceId);
      if (!appt) return false;
      if (role === 'admin') return true;
      return (appt.student.toString() === userId) || (appt.teacher.toString() === userId);
    }

    if (resourceType === 'user') {
      if (role === 'admin') return true;
      if (userId === resourceId) return true;
      if (role === 'teacher') {
        const User = require('../models/User');
        const target = await User.findById(resourceId);
        return target && target.role === 'student';
      }
      return false;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * Rate Limiting for socket events (simple sliding window)
 */
const rateLimit = (max = 100, windowMs = 60000) => {
  const clients = new Map();

  return (socket, next) => {
    const now = Date.now();
    const id = socket.userId;

    if (!clients.has(id)) {
      clients.set(id, { events: [], windowStart: now });
    }
    const client = clients.get(id);

    client.events = client.events.filter(t => now - t < windowMs);

    if (client.events.length >= max) {
      return next(new Error('Rate limit exceeded'));
    }

    client.events.push(now);

    // Cleanup older clients occasionally
    if (Math.random() < 0.01) {
      for (const [key, val] of clients.entries()) {
        if (now - val.windowStart > windowMs * 2) clients.delete(key);
      }
    }

    next();
  };
};

/**
 * Log socket events (only in development)
 */
const logEvent = (socket, eventName, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`Socket Event: ${eventName}`, {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      timestamp: new Date().toISOString(),
      data: typeof data === 'object' ? Object.keys(data) : data
    });
  }
};

/**
 * Monitor socket connection, track activity and disconnect idle
 */
const monitorConnection = (socket) => {
  const start = Date.now();
  let lastActivity = start;
  let eventCount = 0;

  const origEmit = socket.emit.bind(socket);
  socket.emit = (...args) => {
    lastActivity = Date.now();
    eventCount++;
    return origEmit(...args);
  };

  const interval = setInterval(() => {
    const now = Date.now();
    const duration = now - start;
    const idle = now - lastActivity;

    if (duration % 300000 === 0) { // Every 5 minutes
      console.info(`Socket Stats - User ${socket.userName}, Duration ${Math.round(duration/1000)}s, Events ${eventCount}, Idle ${Math.round(idle/1000)}s`);
    }

    if (idle > 3600000) { // 1 hour idle
      console.info(`Disconnecting idle user ${socket.userName}`);
      socket.disconnect(true);
    }
  }, 60000);

  socket.on('disconnect', () => {
    clearInterval(interval);
    console.info(`Socket disconnected - User ${socket.userName}, total duration ${Math.round((Date.now() - start)/1000)}s, total events ${eventCount}`);
  });
};

module.exports = {
  authenticate,
  authorize,
  checkResourceAccess,
  rateLimit,
  logEvent,
  monitorConnection
};

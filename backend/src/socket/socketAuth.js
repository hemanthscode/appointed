const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

// Socket authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    // Extract token from handshake
    let token;
    
    // Check auth header
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    }
    // Check headers
    else if (socket.handshake.headers.authorization) {
      token = socket.handshake.headers.authorization.split(' ')[1];
    }
    // Check query parameters (for some clients)
    else if (socket.handshake.query && socket.handshake.query.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify token
    const decoded = authConfig.verifyToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      return next(new Error('User not found'));
    }

    // Check if user is active
    if (user.status !== 'active') {
      return next(new Error('User account is not active'));
    }

    // Add user info to socket
    socket.userId = user._id.toString();
    socket.userRole = user.role;
    socket.userName = user.name;
    socket.userEmail = user.email;
    socket.userDepartment = user.department;
    socket.user = user;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication failed'));
  }
};

// Role-based socket authorization
const authorizeSocket = (allowedRoles = []) => {
  return (socket, next) => {
    if (allowedRoles.length === 0) {
      return next(); // Allow all authenticated users
    }

    if (!allowedRoles.includes(socket.userRole)) {
      return next(new Error(`Access denied. Required role: ${allowedRoles.join(' or ')}`));
    }

    next();
  };
};

// Check if socket user can access specific resource
const checkResourceAccess = async (socket, resourceType, resourceId) => {
  try {
    const userId = socket.userId;
    const userRole = socket.userRole;

    switch (resourceType) {
      case 'conversation':
        const Conversation = require('../models/Conversation');
        const conversation = await Conversation.findById(resourceId);
        
        if (!conversation) {
          return false;
        }

        // Admin can access all conversations
        if (userRole === 'admin') {
          return true;
        }

        // Check if user is participant
        return conversation.participants.some(
          participant => participant.toString() === userId
        );

      case 'appointment':
        const Appointment = require('../models/Appointment');
        const appointment = await Appointment.findById(resourceId);
        
        if (!appointment) {
          return false;
        }

        // Admin can access all appointments
        if (userRole === 'admin') {
          return true;
        }

        // Check if user is involved in appointment
        return appointment.student.toString() === userId || 
               appointment.teacher.toString() === userId;

      case 'user':
        // Users can access their own profile, teachers can access student profiles,
        // admins can access all profiles
        if (userRole === 'admin') {
          return true;
        }
        
        if (userId === resourceId) {
          return true;
        }

        if (userRole === 'teacher') {
          const targetUser = await User.findById(resourceId);
          return targetUser && targetUser.role === 'student';
        }

        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking resource access:', error);
    return false;
  }
};

// Rate limiting for socket events
const rateLimitSocket = (maxEvents = 100, windowMs = 60000) => {
  const clients = new Map();

  return (socket, next) => {
    const clientId = socket.userId;
    const now = Date.now();
    
    if (!clients.has(clientId)) {
      clients.set(clientId, {
        events: [],
        windowStart: now
      });
    }

    const client = clients.get(clientId);
    
    // Clean old events outside the window
    client.events = client.events.filter(eventTime => now - eventTime < windowMs);
    
    // Check if client exceeded rate limit
    if (client.events.length >= maxEvents) {
      return next(new Error('Rate limit exceeded'));
    }

    // Add current event
    client.events.push(now);
    
    // Clean up old clients periodically
    if (Math.random() < 0.01) { // 1% chance to cleanup
      for (const [id, clientData] of clients.entries()) {
        if (now - clientData.windowStart > windowMs * 2) {
          clients.delete(id);
        }
      }
    }

    next();
  };
};

// Log socket events for monitoring
const logSocketEvent = (socket, eventName, data = {}) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📡 Socket Event: ${eventName}`, {
      userId: socket.userId,
      userName: socket.userName,
      userRole: socket.userRole,
      timestamp: new Date().toISOString(),
      data: typeof data === 'object' ? Object.keys(data) : data
    });
  }
};

// Validate socket event data
const validateSocketData = (requiredFields = []) => {
  return (data, callback) => {
    const errors = [];

    if (!data || typeof data !== 'object') {
      errors.push('Data must be an object');
      return callback(errors);
    }

    requiredFields.forEach(field => {
      if (!(field in data) || data[field] === null || data[field] === undefined) {
        errors.push(`${field} is required`);
      }
    });

    callback(errors.length > 0 ? errors : null);
  };
};

// Socket connection monitoring
const monitorConnection = (socket) => {
  const startTime = Date.now();
  let lastActivity = startTime;
  let eventCount = 0;

  // Track activity
  const originalEmit = socket.emit;
  socket.emit = function(...args) {
    lastActivity = Date.now();
    eventCount++;
    return originalEmit.apply(this, args);
  };

  // Set up monitoring
  const monitoringInterval = setInterval(() => {
    const now = Date.now();
    const connectionDuration = now - startTime;
    const idleTime = now - lastActivity;

    // Log connection stats periodically
    if (connectionDuration % 300000 === 0) { // Every 5 minutes
      console.log(`📊 Socket Stats - User: ${socket.userName}, Duration: ${Math.round(connectionDuration/1000)}s, Events: ${eventCount}, Idle: ${Math.round(idleTime/1000)}s`);
    }

    // Disconnect idle connections (optional)
    if (idleTime > 3600000) { // 1 hour idle
      console.log(`⏱️  Disconnecting idle user: ${socket.userName}`);
      socket.disconnect(true);
    }
  }, 60000); // Check every minute

  // Clean up on disconnect
  socket.on('disconnect', () => {
    clearInterval(monitoringInterval);
    const totalDuration = Date.now() - startTime;
    console.log(`📈 Connection Summary - User: ${socket.userName}, Total Duration: ${Math.round(totalDuration/1000)}s, Total Events: ${eventCount}`);
  });
};

module.exports = {
  authenticateSocket,
  authorizeSocket,
  checkResourceAccess,
  rateLimitSocket,
  logSocketEvent,
  validateSocketData,
  monitorConnection
};

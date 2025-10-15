const User = require('../models/User');
const authConfig = require('../config/auth');
const constants = require('../utils/constants');

const socketService = {
  async authenticate(token) {
    if (!token) throw new Error('Authentication token required');
    const decoded = authConfig.verifyToken(token);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) throw new Error('User not found');
    if (user.status !== constants.USER_STATUS.ACTIVE) throw new Error('User not active');
    return user;
  },

  authorize(allowedRoles = []) {
    return (socket, next) => {
      if (allowedRoles.length === 0 || allowedRoles.includes(socket.userRole)) return next();
      next(new Error(`Access denied, requires role: ${allowedRoles.join(', ')}`));
    };
  },

  async checkResourceAccess(socket, resourceType, resourceId) {
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
  }
};

module.exports = socketService;

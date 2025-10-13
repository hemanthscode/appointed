/**
 * Role-based Access Control Middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires role ${roles.join(' or ')}`
      });
    }

    next();
  };
};

const studentOnly = authorize('student');
const teacherOnly = authorize('teacher');
const adminOnly = authorize('admin');
const teacherOrAdmin = authorize('teacher', 'admin');
const studentOrTeacher = authorize('student', 'teacher');
const anyRole = authorize('student', 'teacher', 'admin');

/**
 * Resource Ownership Verification Middleware
 * Check if user owns the resource or is admin
 */
const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.role === 'admin' || req.user._id.toString() === resourceId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: You can only access your own resources'
    });
  };
};

/**
 * Appointment Access Checker
 */
const checkAppointmentAccess = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointmentId = req.params.id || req.params.appointmentId;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'Appointment ID required' });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'admin' || 
        appointment.student.toString() === req.user._id.toString() || 
        appointment.teacher.toString() === req.user._id.toString()) {
      req.appointment = appointment;
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied: Not involved in this appointment' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error checking appointment access' });
  }
};

/**
 * Conversation Access Checker
 */
const checkConversationAccess = async (req, res, next) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversationId = req.params.id || req.params.conversationId;

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'Conversation ID required' });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (req.user.role === 'admin' || conversation.participants.includes(req.user._id)) {
      req.conversation = conversation;
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied: Not part of this conversation' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error checking conversation access' });
  }
};

module.exports = {
  authorize,
  studentOnly,
  teacherOnly,
  adminOnly,
  teacherOrAdmin,
  studentOrTeacher,
  anyRole,
  checkResourceOwnership,
  checkAppointmentAccess,
  checkConversationAccess
};

// Role-based access control middleware

// Check if user has required role
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
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

// Student only access
const studentOnly = authorize('student');

// Teacher only access
const teacherOnly = authorize('teacher');

// Admin only access
const adminOnly = authorize('admin');

// Teacher or Admin access
const teacherOrAdmin = authorize('teacher', 'admin');

// Student or Teacher access
const studentOrTeacher = authorize('student', 'teacher');

// Any authenticated user
const anyRole = authorize('student', 'teacher', 'admin');

// Check if user can access specific resource
const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Users can only access their own resources
    if (req.user._id.toString() !== resourceId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }
    
    next();
  };
};

// Check appointment access (student or teacher involved in appointment)
const checkAppointmentAccess = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointmentId = req.params.id || req.params.appointmentId;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID required'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Admin can access all appointments
    if (req.user.role === 'admin') {
      req.appointment = appointment;
      return next();
    }

    // Check if user is involved in the appointment
    const userId = req.user._id.toString();
    const studentId = appointment.student.toString();
    const teacherId = appointment.teacher.toString();

    if (userId !== studentId && userId !== teacherId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not involved in this appointment.'
      });
    }

    req.appointment = appointment;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking appointment access'
    });
  }
};

// Check message/conversation access
const checkConversationAccess = async (req, res, next) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversationId = req.params.id || req.params.conversationId;
    
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID required'
      });
    }

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // Admin can access all conversations
    if (req.user.role === 'admin') {
      req.conversation = conversation;
      return next();
    }

    // Check if user is participant in conversation
    const userId = req.user._id.toString();
    const isParticipant = conversation.participants.some(
      participant => participant.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not part of this conversation.'
      });
    }

    req.conversation = conversation;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error checking conversation access'
    });
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

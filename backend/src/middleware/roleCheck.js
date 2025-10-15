const constants = require('../utils/constants');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json({ success: false, message: `Access denied: requires role ${roles.join(' or ')}` });
    }
    next();
  };
};

const studentOnly = authorize(constants.USER_ROLES.STUDENT);
const teacherOnly = authorize(constants.USER_ROLES.TEACHER);
const adminOnly = authorize(constants.USER_ROLES.ADMIN);
const teacherOrAdmin = authorize(constants.USER_ROLES.TEACHER, constants.USER_ROLES.ADMIN);
const studentOrTeacher = authorize(constants.USER_ROLES.STUDENT, constants.USER_ROLES.TEACHER);
const anyRole = authorize(constants.USER_ROLES.STUDENT, constants.USER_ROLES.TEACHER, constants.USER_ROLES.ADMIN);

/**
 * Resource Ownership verification (user can access own resources or admin)
 */
const checkResourceOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField] || req.body[resourceField];
    if (!req.user) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json({ success: false, message: 'Authentication required' });
    }
    if (req.user.role === constants.USER_ROLES.ADMIN || req.user._id.toString() === resourceId) {
      return next();
    }
    return res.status(constants.HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: You can only access your own resources' });
  };
};

/**
 * Checks appointment access - only student/teacher involved or admin allowed
 */
const checkAppointmentAccess = async (req, res, next) => {
  try {
    const Appointment = require('../models/Appointment');
    const appointmentId = req.params.id || req.params.appointmentId;

    if (!appointmentId) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Appointment ID required' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Appointment not found' });
    }
    if (
      req.user.role === constants.USER_ROLES.ADMIN ||
      appointment.student.toString() === req.user._id.toString() ||
      appointment.teacher.toString() === req.user._id.toString()
    ) {
      req.appointment = appointment;
      return next();
    }
    return res.status(constants.HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Not involved in this appointment' });
  } catch {
    return res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error checking appointment access' });
  }
};

/**
 * Checks conversation access - only participant or admin allowed
 */
const checkConversationAccess = async (req, res, next) => {
  try {
    const Conversation = require('../models/Conversation');
    const conversationId = req.params.id || req.params.conversationId;

    if (!conversationId) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({ success: false, message: 'Conversation ID required' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Conversation not found' });
    }
    if (req.user.role === constants.USER_ROLES.ADMIN || conversation.participants.includes(req.user._id)) {
      req.conversation = conversation;
      return next();
    }
    return res.status(constants.HTTP_STATUS.FORBIDDEN).json({ success: false, message: 'Access denied: Not a participant of this conversation' });
  } catch {
    return res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Server error checking conversation access' });
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
  checkConversationAccess,
};

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle express-validator errors uniformly
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

/**
 * User Registration Validation Rules
 */
const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must have uppercase, lowercase, and number'),
  body('role').isIn(['student', 'teacher', 'admin']).withMessage('Role must be student, teacher, or admin'),
  body('department').notEmpty().withMessage('Department is required'),
  body('year').if(body('role').equals('student')).notEmpty().withMessage('Year is required for students'),
  body('subject').if(body('role').equals('teacher')).notEmpty().withMessage('Subject is required for teachers'),
  handleValidationErrors
];

/**
 * Login Validation
 */
const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Profile Update Validation
 */
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('phone').optional().matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Invalid phone number'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
  body('address').optional().trim(),
  handleValidationErrors
];

/**
 * Appointment Creation Validation
 */
const validateAppointment = [
  body('teacher').isMongoId().withMessage('Valid teacher ID required'),
  body('date').isISO8601().toDate().custom(date => {
    if (date < new Date()) throw new Error('Date cannot be in the past');
    return true;
  }),
  body('time').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).withMessage('Time format invalid'),
  body('purpose').isIn(['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'])
    .withMessage('Valid purpose required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message max 500 characters'),
  handleValidationErrors
];

/**
 * Appointment Update Validation
 */
const validateAppointmentUpdate = [
  body('status').optional().isIn(['pending', 'confirmed', 'completed', 'rejected', 'cancelled']).withMessage('Invalid status'),
  body('teacherResponse.message').optional().isLength({ max: 200 }).withMessage('Teacher response max 200 chars'),
  body('rejectionReason').optional().isLength({ max: 200 }).withMessage('Rejection reason max 200 chars'),
  body('studentRating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating 1 to 5'),
  body('studentFeedback').optional().isLength({ max: 500 }).withMessage('Feedback max 500 chars'),
  handleValidationErrors
];

/**
 * Message Validation
 */
const validateMessage = [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content 1 to 1000 chars'),
  body('receiver').isMongoId().withMessage('Valid receiver ID required'),
  handleValidationErrors
];

/**
 * Schedule Slot Validation
 */
const validateScheduleSlot = [
  body('date').isISO8601().toDate().custom(date => {
    if (date < new Date()) throw new Error('Date cannot be in the past');
    return true;
  }),
  body('time').matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i).withMessage('Invalid time format'),
  body('status').optional().isIn(['available', 'blocked', 'unavailable']).withMessage('Invalid status'),
  body('blockReason').optional().isLength({ max: 100 }).withMessage('Block reason max 100 chars'),
  handleValidationErrors
];

/**
 * Mongo ID Validation (param)
 */
const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Valid ${paramName} required`),
  handleValidationErrors
];

/**
 * Pagination Validation (query)
 */
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be integer >= 1'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'name', '-name', 'date', '-date']).withMessage('Invalid sort field'),
  handleValidationErrors
];

/**
 * Appointment Query Validation
 */
const validateAppointmentQuery = [
  query('status').optional().isIn(['pending', 'confirmed', 'completed', 'rejected', 'cancelled']).withMessage('Invalid status'),
  query('date').optional().isISO8601().withMessage('Invalid date format'),
  query('teacher').optional().isMongoId().withMessage('Invalid teacher ID'),
  query('student').optional().isMongoId().withMessage('Invalid student ID'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateAppointment,
  validateAppointmentUpdate,
  validateMessage,
  validateScheduleSlot,
  validateMongoId,
  validatePagination,
  validateAppointmentQuery,
  handleValidationErrors
};

const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
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

// User validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .isIn(['student', 'teacher'])
    .withMessage('Role must be either student or teacher'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .optional()
    .trim(),
  body('subject')
    .optional()
    .trim(),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('address')
    .optional()
    .trim(),
  handleValidationErrors
];

// Appointment validation
const validateAppointment = [
  body('teacher')
    .isMongoId()
    .withMessage('Valid teacher ID is required'),
  body('date')
    .isISO8601()
    .toDate()
    .custom((value) => {
      if (value < new Date()) {
        throw new Error('Appointment date cannot be in the past');
      }
      return true;
    }),
  body('time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Please provide a valid time format (e.g., 2:00 PM)'),
  body('purpose')
    .isIn(['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'])
    .withMessage('Please select a valid purpose'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters'),
  handleValidationErrors
];

// Appointment update validation
const validateAppointmentUpdate = [
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'rejected', 'cancelled'])
    .withMessage('Invalid status'),
  body('teacherResponse.message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Teacher response cannot be more than 200 characters'),
  body('rejectionReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Rejection reason cannot be more than 200 characters'),
  body('studentRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('studentFeedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Feedback cannot be more than 500 characters'),
  handleValidationErrors
];

// Message validation
const validateMessage = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and cannot exceed 1000 characters'),
  body('receiver')
    .isMongoId()
    .withMessage('Valid receiver ID is required'),
  handleValidationErrors
];

// Schedule validation
const validateScheduleSlot = [
  body('date')
    .isISO8601()
    .toDate()
    .custom(value => {
      if (value < new Date()) throw new Error('Schedule date cannot be in the past');
      return true;
    }),
  body('time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Please provide a valid time format (e.g., 2:00 PM)'),
  body('status')
    .optional()
    .isIn(['available', 'blocked', 'unavailable'])
    .withMessage('Invalid status'),
  body('blockReason')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Block reason cannot be more than 100 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    next();
  }
];

const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Valid ${paramName} is required`),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    next();
  }
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'name', '-name', 'date', '-date']).withMessage('Invalid sort field'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Validation error', errors: errors.array() });
    next();
  }
];

const validateAppointmentQuery = [
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'completed', 'rejected', 'cancelled'])
    .withMessage('Invalid status filter'),
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  query('teacher')
    .optional()
    .isMongoId()
    .withMessage('Invalid teacher ID'),
  query('student')
    .optional()
    .isMongoId()
    .withMessage('Invalid student ID'),
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

const { body, param, query, validationResult } = require('express-validator');
const validators = require('../utils/validators');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Handles express-validator errors uniformly, returning JSON response.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(constants.HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: constants.MESSAGES.ERROR.VALIDATION_ERROR,
      errors: errors.array()
    });
  }
  next();
};

/**
 * User Registration Validation
 */
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .custom((value) => {
      const { isValid, errors } = validators.validatePassword(value);
      if (!isValid) {
        throw new Error(errors.join('. '));
      }
      return true;
    }),
  body('role')
    .isIn(Object.values(constants.USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(constants.USER_ROLES).join(', ')}`),
  body('department')
    .if(body('role').custom(role => role === constants.USER_ROLES.STUDENT || role === constants.USER_ROLES.TEACHER))
    .notEmpty()
    .withMessage('Department is required'),
  body('year')
    .if(body('role').equals(constants.USER_ROLES.STUDENT))
    .notEmpty()
    .withMessage('Year is required for students'),
  body('subject')
    .if(body('role').equals(constants.USER_ROLES.TEACHER))
    .notEmpty()
    .withMessage('Subject is required for teachers'),
  handleValidationErrors,
];

/**
 * User Login Validation
 */
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Profile Update Validation
 */
const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .custom(phone => {
      if (!phone) return true;
      if (!helpers.isValidPhone(phone)) throw new Error('Invalid phone number');
      return true;
    }),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),
  handleValidationErrors,
];

/**
 * Appointment Creation Validation
 */
const validateAppointment = [
  body('teacher')
    .isMongoId()
    .withMessage('Valid teacher ID is required'),
  body('date')
    .isISO8601()
    .toDate()
    .custom(value => {
      if (value < new Date().setHours(0,0,0,0)) throw new Error('Date cannot be in the past');
      return true;
    }),
  body('time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Time must be in format like 2:00 PM'),
  body('purpose')
    .isIn(constants.APPOINTMENT_PURPOSES.map(p => p.value))
    .withMessage('Purpose is required and must be valid'),
  body('subject')
    .notEmpty()
    .withMessage('Subject is required'),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  handleValidationErrors,
];

/**
 * Appointment Update Validation
 */
const validateAppointmentUpdate = [
  body('status')
    .optional()
    .isIn(Object.values(constants.APPOINTMENT_STATUS))
    .withMessage('Invalid status value'),
  body('teacherResponse.message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Teacher message with max 200 characters'),
  body('rejectionReason')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Rejection reason max 200 chars'),
  body('studentRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Student rating must be between 1 and 5'),
  body('studentFeedback')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Student feedback max 500 chars'),
  handleValidationErrors,
];

/**
 * Message Validation
 */
const validateMessage = [
  body('receiver').isMongoId().withMessage('Valid receiver ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content must be 1 to 1000 characters'),
  handleValidationErrors,
];

/**
 * Schedule Slot Validation
 */
const validateScheduleSlot = [
  body('date')
    .isISO8601()
    .toDate()
    .custom(date => {
      if (date < new Date().setHours(0,0,0,0)) throw new Error('Date cannot be in the past');
      return true;
    }),
  body('time')
    .matches(/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i)
    .withMessage('Invalid time format'),
  body('status')
    .optional()
    .isIn(Object.values(constants.SCHEDULE_STATUS))
    .withMessage('Invalid schedule status'),
  body('blockReason')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Block reason max 100 chars'),
  handleValidationErrors,
];

/**
 * MongoID validation for route params
 */
const validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];

/**
 * Pagination validation for queries
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer >= 1'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: constants.PAGINATION.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${constants.PAGINATION.MAX_LIMIT}`),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'name', '-name', 'date', '-date'])
    .withMessage('Invalid sort field'),
  handleValidationErrors,
];

/**
 * Appointment query filters validation
 */
const validateAppointmentQuery = [
  query('status')
    .optional()
    .isIn(Object.values(constants.APPOINTMENT_STATUS))
    .withMessage('Invalid status'),
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
  handleValidationErrors,
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

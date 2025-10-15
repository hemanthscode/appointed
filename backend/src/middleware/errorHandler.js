const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * 404 Not Found Middleware
 */
const notFound = (req, res, next) => {
  res.status(constants.HTTP_STATUS.NOT_FOUND);
  next(new Error(`Not found - ${req.originalUrl}`));
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : constants.HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Server Error';

  // Specific error handling
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = constants.HTTP_STATUS.NOT_FOUND;
  } else if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = constants.HTTP_STATUS.CONFLICT;
  } else if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join('. ');
    statusCode = constants.HTTP_STATUS.UNPROCESSABLE_ENTITY;
  } else if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
  } else if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = constants.HTTP_STATUS.UNAUTHORIZED;
  }

  res.status(statusCode).json(helpers.errorResponse(message));
};

module.exports = {
  notFound,
  errorHandler
};

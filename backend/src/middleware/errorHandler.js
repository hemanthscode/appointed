/**
 * Not Found Middleware
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Specific Mongoose errors
  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }
  if (err.code === 11000) {
    let message = 'Duplicate field value entered';
    if (err.keyValue?.email) {
      message = 'Email already exists';
    }
    error = { message, statusCode: 400 };
  }
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join('. ');
    error = { message, statusCode: 400 };
  }
  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }
  if (err.name === 'TokenExpiredError') {
    error = { message: 'Token expired', statusCode: 401 };
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { message: 'File too large', statusCode: 400 };
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    error = { message: 'Too many files', statusCode: 400 };
  }
  if (err.status === 429) {
    error = { message: 'Too many requests, please try again later', statusCode: 429 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Async Handler Wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler
};

const rateLimit = require('express-rate-limit');

/**
 * General API rate limit: 100 requests per 15 minutes/IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Authentication endpoints limiter: 5 requests per 15 minutes/IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

/**
 * Password reset limiter: 3 requests per hour/IP
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * File upload limiter: 10 uploads per 15 minutes/IP
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Message sending limiter: 30 messages per minute/IP
 */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many messages sent, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  messageLimiter
};

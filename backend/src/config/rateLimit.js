const rateLimit = require('express-rate-limit');
const { RATE_LIMITS, MESSAGES, HTTP_STATUS } = require('../utils/constants');

const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.WINDOW_MS,
  max: RATE_LIMITS.API.MAX_REQUESTS,
  message: { success: false, message: 'Too many requests from this IP, please try later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX_REQUESTS,
  message: { success: false, message: 'Too many authentication attempts, please try later.' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: RATE_LIMITS.PASSWORD_RESET.WINDOW_MS,
  max: RATE_LIMITS.PASSWORD_RESET.MAX_REQUESTS,
  message: { success: false, message: 'Too many password reset attempts, please try later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const messageLimiter = rateLimit({
  windowMs: RATE_LIMITS.MESSAGES.WINDOW_MS,
  max: RATE_LIMITS.MESSAGES.MAX_REQUESTS,
  message: { success: false, message: 'Too many messages sent, slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  messageLimiter,
};

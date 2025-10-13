const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',

  passwordMinLength: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
  passwordSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,

  passwordResetExpire: parseInt(process.env.PASSWORD_RESET_EXPIRE) || 10 * 60 * 1000, // 10 minutes
  emailVerificationExpire: parseInt(process.env.EMAIL_VERIFICATION_EXPIRE) || 24 * 60 * 60 * 1000, // 24 hours

  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
  lockoutDuration: parseInt(process.env.LOCKOUT_DURATION) || 30 * 60 * 1000, // 30 minutes

  generateToken: (payload) => jwt.sign(payload, authConfig.jwtSecret, { expiresIn: authConfig.jwtExpire }),

  generateRefreshToken: (payload) => jwt.sign(payload, authConfig.jwtSecret, { expiresIn: authConfig.jwtRefreshExpire }),

  verifyToken: (token) => jwt.verify(token, authConfig.jwtSecret),

  generateRandomToken: () => crypto.randomBytes(32).toString('hex')
};

module.exports = authConfig;

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT } = require('../utils/constants');

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || JWT.ACCESS_TOKEN_EXPIRE,
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || JWT.REFRESH_TOKEN_EXPIRE,

  passwordResetExpire: parseInt(process.env.PASSWORD_RESET_EXPIRE) || JWT.PASSWORD_RESET_EXPIRE,
  emailVerificationExpire: parseInt(process.env.EMAIL_VERIFICATION_EXPIRE) || JWT.EMAIL_VERIFICATION_EXPIRE,

  generateToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtExpire });
  },

  generateRefreshToken(payload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: this.jwtRefreshExpire });
  },

  verifyToken(token) {
    return jwt.verify(token, this.jwtSecret);
  },

  generateRandomToken() {
    return crypto.randomBytes(32).toString('hex');
  }
};

module.exports = authConfig;

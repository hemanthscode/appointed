const jwt = require('jsonwebtoken');

const authConfig = {
  // JWT Settings
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
  
  // Password Settings
  passwordMinLength: 8,
  passwordSaltRounds: 12,
  
  // Token Settings
  passwordResetExpire: 10 * 60 * 1000, // 10 minutes
  emailVerificationExpire: 24 * 60 * 60 * 1000, // 24 hours
  
  // Rate Limiting
  maxLoginAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  
  // Generate JWT Token
  generateToken: (payload) => {
    return jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtExpire
    });
  },
  
  // Generate Refresh Token
  generateRefreshToken: (payload) => {
    return jwt.sign(payload, authConfig.jwtSecret, {
      expiresIn: authConfig.jwtRefreshExpire
    });
  },
  
  // Verify Token
  verifyToken: (token) => {
    return jwt.verify(token, authConfig.jwtSecret);
  },
  
  // Generate Random Token
  generateRandomToken: () => {
    return require('crypto').randomBytes(32).toString('hex');
  }
};

module.exports = authConfig;

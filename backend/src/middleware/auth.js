const authConfig = require('../config/auth');
const User = require('../models/User');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Require valid JWT token and active user
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.UNAUTHORIZED));
    }
    try {
      const decoded = authConfig.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.status !== constants.USER_STATUS.ACTIVE) {
        return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.UNAUTHORIZED));
      }

      req.user = user;
      next();
    } catch {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.INVALID_TOKEN));
    }
  } catch {
    res.status(constants.HTTP_STATUS.INTERNAL_SERVER_ERROR).json(helpers.errorResponse());
  }
};

/**
 * Optional authentication (attaches user if valid token, else continues)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      try {
        const decoded = authConfig.verifyToken(token);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.status === constants.USER_STATUS.ACTIVE) {
          req.user = user;
        }
      } catch {
        // invalid token, continue without user
      }
    }
    next();
  } catch {
    next();
  }
};

module.exports = { protect, optionalAuth };

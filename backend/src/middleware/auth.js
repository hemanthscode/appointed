const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authConfig = require('../config/auth');

/**
 * Protect routes - Require valid JWT and active user
 */
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
      const decoded = authConfig.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');

      if (!user || user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }

      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error in authentication' });
  }
};

/**
 * Optional authentication - Attaches user if token valid, else proceeds without user
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
        if (user && user.status === 'active') {
          req.user = user;
        }
      } catch {
        // Invalid token - proceed without user
      }
    }

    next();
  } catch {
    next();
  }
};

module.exports = { protect, optionalAuth };

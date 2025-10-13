const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;

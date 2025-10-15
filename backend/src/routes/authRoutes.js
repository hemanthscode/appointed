const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validation = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../config/rateLimit');
const { protect } = require('../middleware/auth');

router.post('/register', authLimiter, validation.validateRegister, authController.register);
router.post('/login', authLimiter, validation.validateLogin, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;

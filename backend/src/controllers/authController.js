const User = require('../models/User');
const authService = require('../services/authService');
const emailService = require('../services/emailService');
const { asyncHandler } = require('../middleware/errorHandler');
const validators = require('../utils/validators');
const Schedule = require('../models/Schedule');
const constants = require('../utils/constants');

// Helper to seed default schedule slots for a new teacher
async function seedDefaultScheduleSlots(teacherId, days = 14) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const slotsToInsert = [];

  for (let day = 0; day < days; day++) {
    const date = new Date(today);
    date.setDate(date.getDate() + day);

    // Skip weekends if desired
    if ([0, 6].includes(date.getDay())) continue;

    for (const time of constants.TIME_SLOTS) {
      slotsToInsert.push({
        teacher: teacherId,
        date,
        time,
        duration: 60,
        status: 'available',
        isRecurring: false,
        isActive: true
      });
    }
  }

  try {
    await Schedule.insertMany(slotsToInsert, { ordered: false });
  } catch (e) {
    // Ignore duplicate key errors silently (in case slots already seeded)
    if (e.code !== 11000) throw e;
  }
}

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, year, subject } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ success: false, message: 'User already exists with this email' });
  }

  const userData = { name, email, password, role, department };
  if (role === 'student') userData.year = year;
  if (role === 'teacher') userData.subject = subject;

  const user = await User.create(userData);

  // Seed default schedule slots if new user is a teacher
  if (role === 'teacher') {
    await seedDefaultScheduleSlots(user._id, 14); // Seed slots for next 14 days
  }

  const tokens = authService.generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  try {
    await emailService.sendWelcomeEmail(user);
  } catch (e) {
    // Non-blocking: log error as needed
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toJSON()
    }
  });
});


exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const validPass = await user.comparePassword(password);
  if (!validPass) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(401).json({ success: false, message: 'Your account has been suspended. Please contact admin.' });
  }

  const message = user.status === 'pending' ? 'Login successful. Your account is pending approval.' : 'Login successful';
  const tokens = authService.generateTokens(user);
  user.refreshToken = tokens.refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message,
    data: {
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toJSON()
    }
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.invalidateRefreshToken(req.user._id);
  res.status(200).json({ success: true, message: 'Logout successful' });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

  try {
    const { user } = await authService.verifyToken(refreshToken);
    if (user.refreshToken !== refreshToken) throw new Error('Invalid refresh token');

    const tokens = authService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: user.toJSON()
      }
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ success: false, message: 'No user found with this email' });

  const token = await authService.createPasswordResetToken(email);

  try {
    await emailService.sendPasswordResetEmail(user, token);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (e) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await authService.verifyPasswordToken(token);

  await authService.resetPassword(token, password);

  const authToken = user.generateAuthToken();

  res.status(200).json({ success: true, message: 'Password reset successful', data: { token: authToken } });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('appointments', null, null, { sort: { date: -1 } });

  res.status(200).json({ success: true, data: user.toJSON() });
});

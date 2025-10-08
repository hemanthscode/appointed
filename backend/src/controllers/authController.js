const User = require('../models/User');
const authConfig = require('../config/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, department, year, subject } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Create user object
  const userData = {
    name,
    email,
    password,
    role,
    department
  };

  // Add role-specific fields
  if (role === 'student') {
    userData.year = year;
  } else if (role === 'teacher') {
    userData.subject = subject;
  }

  // Create user
  const user = await User.create(userData);

  // Generate token
  const token = user.generateAuthToken();
  const refreshToken = authConfig.generateRefreshToken({ id: user._id });

  // Save refresh token
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  // Send welcome email
  try {
    await emailService.sendWelcomeEmail(user);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        year: user.year,
        subject: user.subject
      }
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  console.log('🔐 Login attempt for:', email); // Debug log

  // Check if user exists and get password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log('❌ User not found:', email); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  console.log('✅ User found:', { email: user.email, role: user.role, status: user.status }); // Debug log

  // Check password
  const isValidPassword = await user.comparePassword(password);
  console.log('🔑 Password valid:', isValidPassword); // Debug log
  
  if (!isValidPassword) {
    console.log('❌ Password invalid for:', email); // Debug log
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // ⭐ FIXED: Only block suspended users, allow all others
  if (user.status === 'suspended') {
    return res.status(401).json({
      success: false,
      message: 'Your account has been suspended. Please contact admin.'
    });
  }

  // ⭐ OPTIONAL: Show pending message but still allow login
  let loginMessage = 'Login successful';
  if (user.status === 'pending') {
    loginMessage = 'Login successful. Your account is pending approval for full access.';
  }

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = authConfig.generateRefreshToken({ id: user._id });

  // Update user
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  console.log('✅ Login successful for:', email); // Debug log

  res.status(200).json({
    success: true,
    message: loginMessage,
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        status: user.status,
        year: user.year,
        subject: user.subject,
        avatar: user.avatar,
        bio: user.bio
      }
    }
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Clear refresh token
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 }
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token required'
    });
  }

  try {
    // Verify refresh token
    const decoded = authConfig.verifyToken(refreshToken);
    
    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = authConfig.generateRefreshToken({ id: user._id });

    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with this email'
    });
  }

  // Generate reset token
  const resetToken = authConfig.generateRandomToken();
  
  // Set reset token and expiration
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = new Date(Date.now() + authConfig.passwordResetExpire);
  await user.save();

  // Send reset email
  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: 'Email could not be sent'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  // Find user by reset token
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Generate new token
  const authToken = user.generateAuthToken();

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      token: authToken
    }
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('appointments', 'date time status purpose');

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe
};

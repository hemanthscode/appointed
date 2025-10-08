const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authConfig = require('../config/auth');

const authService = {
  // Generate JWT tokens
  generateTokens: (user) => {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    const accessToken = authConfig.generateToken(payload);
    const refreshToken = authConfig.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken
    };
  },

  // Verify JWT token
  verifyToken: async (token) => {
    try {
      const decoded = authConfig.verifyToken(token);
      
      // Check if user still exists
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user is still active
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      return { user, decoded };
    } catch (error) {
      throw new Error('Invalid token');
    }
  },

  // Hash password
  hashPassword: async (password) => {
    return await bcrypt.hash(password, authConfig.passwordSaltRounds);
  },

  // Compare password
  comparePassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Generate random token for password reset
  generateResetToken: () => {
    return authConfig.generateRandomToken();
  },

  // Validate password strength
  validatePassword: (password) => {
    const minLength = authConfig.passwordMinLength;
    const errors = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*])/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Check if user can login (rate limiting, account status)
  canUserLogin: async (email) => {
    const user = await User.findOne({ email });
    
    if (!user) {
      return { canLogin: false, reason: 'User not found' };
    }

    if (user.status === 'suspended') {
      return { canLogin: false, reason: 'Account suspended' };
    }

    if (user.status === 'inactive') {
      return { canLogin: false, reason: 'Account inactive' };
    }

    if (user.status === 'pending') {
      return { canLogin: false, reason: 'Account pending approval' };
    }

    // Add rate limiting check here if needed
    // Check lockout status, failed attempts, etc.

    return { canLogin: true, user };
  },

  // Update user last login
  updateLastLogin: async (userId) => {
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date()
    });
  },

  // Invalidate refresh token
  invalidateRefreshToken: async (userId) => {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 }
    });
  },

  // Generate password reset token and save
  createPasswordResetToken: async (email) => {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('No user found with this email');
    }

    const resetToken = authService.generateResetToken();
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + authConfig.passwordResetExpire);
    await user.save();

    return resetToken;
  },

  // Verify password reset token
  verifyPasswordResetToken: async (token) => {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    return user;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const user = await authService.verifyPasswordResetToken(token);
    
    // Validate new password
    const passwordValidation = authService.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join('. '));
    }

    // Hash new password
    user.password = await authService.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return user;
  },

  // Check if user has permission for resource
  checkPermission: (user, resource, action) => {
    // Define permissions matrix
    const permissions = {
      admin: {
        users: ['read', 'write', 'delete'],
        appointments: ['read', 'write', 'delete'],
        schedule: ['read', 'write'],
        messages: ['read', 'write', 'delete'],
        system: ['read', 'write']
      },
      teacher: {
        users: ['read'], // Can read student profiles
        appointments: ['read', 'write'], // Can manage their appointments
        schedule: ['read', 'write'], // Can manage their schedule
        messages: ['read', 'write'], // Can send/receive messages
        students: ['read'] // Can view student list
      },
      student: {
        users: ['read'], // Can read teacher profiles
        appointments: ['read', 'write'], // Can manage their appointments
        schedule: ['read'], // Can view teacher schedules
        messages: ['read', 'write'], // Can send/receive messages
        teachers: ['read'] // Can view teacher list
      }
    };

    const userPermissions = permissions[user.role];
    if (!userPermissions) {
      return false;
    }

    const resourcePermissions = userPermissions[resource];
    if (!resourcePermissions) {
      return false;
    }

    return resourcePermissions.includes(action);
  }
};

module.exports = authService;

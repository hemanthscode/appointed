const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authConfig = require('../config/auth');

const authService = {
  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    };
    return {
      accessToken: authConfig.generateToken(payload),
      refreshToken: authConfig.generateRefreshToken(payload)
    };
  },

  async verifyToken(token) {
    try {
      const decoded = authConfig.verifyToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (!user || user.status !== 'active') throw new Error('User not found or inactive');
      return { user, decoded };
    } catch (err) {
      throw new Error('Invalid token');
    }
  },

  async hashPassword(password) {
    return await bcrypt.hash(password, authConfig.passwordSaltRounds);
  },

  async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  generateResetToken() {
    return authConfig.generateRandomToken();
  },

  validatePassword(password) {
    const errors = [];

    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < authConfig.passwordMinLength) {
      errors.push(`Password must be at least ${authConfig.passwordMinLength} characters long`);
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
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  async canUserLogin(email) {
    const user = await User.findOne({ email });
    if (!user) return { canLogin: false, reason: 'User not found' };
    if (user.status === 'suspended') return { canLogin: false, reason: 'Account suspended' };
    if (user.status === 'inactive') return { canLogin: false, reason: 'Account inactive' };
    if (user.status === 'pending') return { canLogin: false, reason: 'Account pending approval' };
    return { canLogin: true, user };
  },

  async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  },

  async invalidateRefreshToken(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  },

  async createPasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('No user found with this email');

    const resetToken = this.generateResetToken();

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + authConfig.passwordResetExpire);
    await user.save();

    return resetToken;
  },

  async verifyPasswordResetToken(token) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) throw new Error('Invalid or expired reset token');
    return user;
  },

  async resetPassword(token, newPassword) {
    const user = await this.verifyPasswordResetToken(token);
    const { isValid, errors } = this.validatePassword(newPassword);
    if (!isValid) throw new Error(errors.join('. '));

    user.password = await this.hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return user;
  },

  checkPermission(user, resource, action) {
    const permissions = {
      admin: {
        users: ['read', 'write', 'delete'],
        appointments: ['read', 'write', 'delete'],
        schedule: ['read', 'write'],
        messages: ['read', 'write', 'delete'],
        system: ['read', 'write']
      },
      teacher: {
        users: ['read'], // can read students
        appointments: ['read', 'write'],
        schedule: ['read', 'write'],
        messages: ['read', 'write'],
        students: ['read']
      },
      student: {
        users: ['read'],
        appointments: ['read', 'write'],
        schedule: ['read'],
        messages: ['read', 'write'],
        teachers: ['read']
      }
    };

    return permissions[user.role]?.[resource]?.includes(action) || false;
  }
};

module.exports = authService;

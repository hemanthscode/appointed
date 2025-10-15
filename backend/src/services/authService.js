const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authConfig = require('../config/auth');
const constants = require('../utils/constants');

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
      if (!user || user.status !== constants.USER_STATUS.ACTIVE) throw new Error('User not found or inactive');
      return { user, decoded };
    } catch {
      throw new Error('Invalid token');
    }
  },

  async hashPassword(password) {
    return await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
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
    if (password.length < 8) errors.push('Password must be at least 8 characters long');
    if (!/(?=.*[a-z])/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/(?=.*[A-Z])/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/(?=.*\d)/.test(password)) errors.push('Password must contain at least one number');
    if (!/(?=.*[!@#$%^&*])/.test(password)) errors.push('Password must contain at least one special character');
    return { isValid: errors.length === 0, errors };
  },

  async canUserLogin(email) {
    const user = await User.findOne({ email });
    if (!user) return { canLogin: false, reason: 'User not found' };
    if (user.status === constants.USER_STATUS.SUSPENDED) return { canLogin: false, reason: 'Account suspended' };
    if (user.status === constants.USER_STATUS.INACTIVE) return { canLogin: false, reason: 'Account inactive' };
    if (user.status === constants.USER_STATUS.PENDING) return { canLogin: false, reason: 'Account pending approval' };
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
    user.passwordResetExpires = new Date(Date.now() + (parseInt(process.env.PASSWORD_RESET_EXPIRE) || constants.JWT.PASSWORD_RESET_EXPIRE));
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
  }
};

module.exports = authService;

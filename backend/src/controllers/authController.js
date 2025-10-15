const authService = require('../services/authService');
const emailService = require('../services/emailService');
const User = require('../models/User');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');
const validators = require('../utils/validators');

/**
 * Register new user
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, year, subject } = req.body;

    // Central synchronous validation
    const { isValid, errors } = validators.validateUser(req.body);
    if (!isValid) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse(constants.MESSAGES.ERROR.VALIDATION_ERROR, errors));
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse(constants.MESSAGES.ERROR.EMAIL_EXISTS));
    }

    const newUserData = { name, email, password, role, department };
    if (role === constants.USER_ROLES.STUDENT) newUserData.year = year;
    if (role === constants.USER_ROLES.TEACHER) newUserData.subject = subject;

    const user = await User.create(newUserData);

    // Generate tokens
    const tokens = authService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (err) {
      // Fail silently but log
      console.warn('Failed to send welcome email:', err.message);
    }

    return res.status(constants.HTTP_STATUS.CREATED).json(helpers.successResponse({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toJSON()
    }, constants.MESSAGES.SUCCESS.USER_REGISTERED));
  } catch (error) {
    next(error);
  }
};

/**
 * User login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.INVALID_CREDENTIALS));
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.INVALID_CREDENTIALS));
    }

    if (user.status === constants.USER_STATUS.SUSPENDED) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse('Your account has been suspended. Please contact admin.'));
    }

    const message = user.status === constants.USER_STATUS.PENDING ? 'Login successful. Your account is pending approval.' : constants.MESSAGES.SUCCESS.LOGIN_SUCCESS;

    const tokens = authService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toJSON()
    }, message));
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user (invalidate refresh token)
 */
exports.logout = async (req, res, next) => {
  try {
    await authService.invalidateRefreshToken(req.user._id);
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, constants.MESSAGES.SUCCESS.LOGOUT_SUCCESS));
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token with refresh token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse('Refresh token required'));
    }

    const { user } = await authService.verifyToken(refreshToken);
    if (user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    const tokens = authService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: user.toJSON()
    }));
  } catch {
    res.status(constants.HTTP_STATUS.UNAUTHORIZED).json(helpers.errorResponse(constants.MESSAGES.ERROR.INVALID_TOKEN));
  }
};

/**
 * Initiate forgot password (send reset email)
 */
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }

    const token = await authService.createPasswordResetToken(email);
    await emailService.sendPasswordResetEmail(user, token);

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, constants.MESSAGES.SUCCESS.PASSWORD_RESET_SENT));
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await authService.resetPassword(token, password);
    const authToken = user.generateAuthToken();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ token: authToken }, constants.MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESS));
  } catch (error) {
    next(error);
  }
};

/**
 * Get logged-in user's profile
 */
exports.getMe = async (req, res, next) => {
  try {
    const populateField = req.user.role === constants.USER_ROLES.STUDENT
      ? 'studentAppointments'
      : req.user.role === constants.USER_ROLES.TEACHER
        ? 'teacherAppointments'
        : ''; // No appointments for admin by default, or add if desired

    const query = User.findById(req.user._id).select('-password -refreshToken');

    if (populateField) {
      query.populate({
        path: populateField,
        options: { sort: { date: -1 } }
      });
    }

    const user = await query;

    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON()));
  } catch (error) {
    next(error);
  }
};

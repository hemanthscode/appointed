const User = require('../models/User');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Get paginated list of users (admin only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;

    const query = {}; // Optionally add filters here if desired

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(users.map(u => u.toJSON()), null, {
      page, limit, total, totalPages: Math.ceil(total / limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk user operations: activate, deactivate, suspend, delete (admin only)
 */
exports.bulkUserOperation = async (req, res, next) => {
  try {
    const { ids, operation } = req.body;
    let result;

    switch (operation) {
      case 'activate':
        result = await User.updateMany({ _id: { $in: ids } }, { status: constants.USER_STATUS.ACTIVE });
        break;
      case 'deactivate':
        result = await User.updateMany({ _id: { $in: ids } }, { status: constants.USER_STATUS.INACTIVE });
        break;
      case 'suspend':
        result = await User.updateMany({ _id: { $in: ids } }, { status: constants.USER_STATUS.SUSPENDED });
        break;
      case 'delete':
        result = await User.deleteMany({ _id: { $in: ids } });
        break;
      default:
        return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Invalid operation'));
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(result, `Operation ${operation} completed`));
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending approval users (admin only)
 */
exports.getApprovals = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;
    const query = { status: constants.USER_STATUS.PENDING };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(users.map(u => u.toJSON()), null, {
      page, limit, total, totalPages: Math.ceil(total / limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Approve a user registration (admin only)
 */
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: constants.USER_STATUS.ACTIVE }, { new: true });
    if (!user) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('User not found'));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), 'User approved'));
  } catch (err) {
    next(err);
  }
};

/**
 * Reject a user registration (admin only)
 */
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('User not found'));

    user.status = constants.USER_STATUS.INACTIVE;
    await user.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), 'User rejected'));
  } catch (err) {
    next(err);
  }
};

/**
 * Get system stats overview (admin only)
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    // Additional stats (appointments, messages, etc.) can be added here

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ userCount }));
  } catch (err) {
    next(err);
  }
};

/**
 * Get system settings (admin only)
 * Placeholder - implement settings storage/retrieval as needed
 */
exports.getSettings = async (req, res, next) => {
  try {
    // Current static or from DB
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({}));
  } catch (err) {
    next(err);
  }
};

/**
 * Update system settings (admin only)
 */
exports.updateSettings = async (req, res, next) => {
  try {
    // Save settings to DB or config store as needed
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Settings updated'));
  } catch (err) {
    next(err);
  }
};

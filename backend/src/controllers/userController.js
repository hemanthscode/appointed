const User = require('../models/User');
const Appointment = require('../models/Appointment');
const fileService = require('../services/fileService');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user));
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'phone', 'address', 'bio', 'office'];
    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), constants.MESSAGES.SUCCESS.PROFILE_UPDATED));
  } catch (error) {
    next(error);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('No file uploaded'));

    if (req.user.avatar) {
      await fileService.deleteFile(req.user.avatar, 'avatars');
    }

    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.filename }, { new: true });
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({ avatar: user.avatar, avatarUrl: `/uploads/avatars/${user.avatar}` }, constants.MESSAGES.SUCCESS.FILE_UPLOADED));
  } catch (error) {
    next(error);
  }
};

exports.getTeachers = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, department, subject, search, sort = '-rating' } = req.query;
    const query = { role: constants.USER_ROLES.TEACHER, status: constants.USER_STATUS.ACTIVE };
    if (department) query.department = department;
    if (subject) query.subject = new RegExp(subject, 'i');
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { subject: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') }
    ];

    const teachers = await User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('teacherAppointments', null, null, { match: { status: { $in: [constants.APPOINTMENT_STATUS.CONFIRMED, constants.APPOINTMENT_STATUS.COMPLETED] } } });

    const total = await User.countDocuments(query);

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(teachers.map(t => t.toJSON()), null, {
      page, limit, total, totalPages: Math.ceil(total / limit)
    }));
  } catch (error) {
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, department, year, search, sort = 'name' } = req.query;
    const query = { role: constants.USER_ROLES.STUDENT };
    if (department) query.department = department;
    if (year) query.year = year;
    if (search) query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') }
    ];

    const students = await User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    const total = await User.countDocuments(query);

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(students.map(s => s.toJSON()), null, {
      page, limit, total, totalPages: Math.ceil(total / limit)
    }));
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id).select('-password -refreshToken');
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }
    if (user.role === constants.USER_ROLES.TEACHER) {
      await user.populate('teacherAppointments');
    } else if (user.role === constants.USER_ROLES.STUDENT) {
      await user.populate('studentAppointments');
    }
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON()));
  } catch (error) {
    next(error);
  }
};


exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!Object.values(constants.USER_STATUS).includes(status)) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Invalid status'));
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), 'User status updated'));
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse(constants.MESSAGES.ERROR.USER_NOT_FOUND));
    }
    if (user.avatar) {
      await fileService.deleteFile(user.avatar, 'avatars');
    }
    await Appointment.deleteMany({ $or: [{ student: user._id }, { teacher: user._id }] });
    await user.deleteOne();
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const validCurr = await user.comparePassword(currentPassword);
    if (!validCurr) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Current password incorrect'));
    }
    user.password = newPassword;
    await user.save();
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Password changed successfully'));
  } catch (error) {
    next(error);
  }
};

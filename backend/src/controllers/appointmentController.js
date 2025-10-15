const Appointment = require('../models/Appointment');
const User = require('../models/User');
const helpers = require('../utils/helpers');
const constants = require('../utils/constants');

/**
 * Get list of appointments with filters and pagination
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, status, date, teacher, student } = req.query;

    const filter = {};

    // Role-based filtering
    if (req.user.role === constants.USER_ROLES.STUDENT) {
      filter.student = req.user._id;
    } else if (req.user.role === constants.USER_ROLES.TEACHER) {
      filter.teacher = req.user._id;
    } else if (req.user.role === constants.USER_ROLES.ADMIN) {
      if (student) filter.student = student;
      if (teacher) filter.teacher = teacher;
    }

    // Optional filters
    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const total = await Appointment.countDocuments(filter);
    const appointments = await Appointment.find(filter)
      .populate('student teacher', 'name email role')
      .sort({ date: -1, _id: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(constants.HTTP_STATUS.OK).json(helpers.paginate(appointments, total, page, limit));
  } catch (err) {
    next(err);
  }
};

/**
 * Get single appointment by ID with access control
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate('student teacher', 'name email role');

    if (!appointment) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));
    }

    // Authorization: owner or admin
    if (
      req.user.role !== constants.USER_ROLES.ADMIN &&
      appointment.student._id.toString() !== req.user._id.toString() &&
      appointment.teacher._id.toString() !== req.user._id.toString()
    ) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Access denied'));
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment));
  } catch (err) {
    next(err);
  }
};

/**
 * Create appointment (Student role)
 */
exports.createAppointment = async (req, res, next) => {
  try {
    // Validate input
    const { teacher, date, time, purpose, message } = req.body;

    // Use validators outside for brevity here
    const validation = require('../middleware/validation');
    validation.validateAppointment(req.body);
    const { isValid, errors } = validation.validateAppointment(req.body);
    if (!isValid) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse(errors.join('. ')));
    }

    const appointment = new Appointment({
      student: req.user._id,
      teacher,
      date,
      time,
      purpose,
      message,
      status: constants.APPOINTMENT_STATUS.PENDING
    });
    await appointment.save();

    res.status(constants.HTTP_STATUS.CREATED).json(helpers.successResponse(appointment, 'Appointment created'));
  } catch (err) {
    next(err);
  }
};

/**
 * Update appointment status or details by owner or admin
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    // Authorization check
    if (
      req.user.role !== constants.USER_ROLES.ADMIN &&
      appointment.student.toString() !== req.user._id.toString() &&
      appointment.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Not authorized'));
    }

    const updates = req.body;
    // Prevent role change or invalid status
    if (updates.status && !Object.values(constants.APPOINTMENT_STATUS).includes(updates.status)) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Invalid status'));
    }

    Object.assign(appointment, updates);
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Appointment updated'));
  } catch (err) {
    next(err);
  }
};

/**
 * Approve appointment (teacher only)
 */
exports.approveAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    if (req.user.role !== constants.USER_ROLES.TEACHER) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Only teachers can approve'));
    }

    appointment.status = constants.APPOINTMENT_STATUS.CONFIRMED;
    appointment.confirmedAt = new Date();
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Appointment confirmed'));
  } catch (err) {
    next(err);
  }
};

/**
 * Reject appointment (teacher only)
 */
exports.rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    if (req.user.role !== constants.USER_ROLES.TEACHER) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Only teachers can reject'));
    }

    appointment.status = constants.APPOINTMENT_STATUS.REJECTED;
    appointment.rejectionReason = rejectionReason;
    appointment.rejectedAt = new Date();
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Appointment rejected'));
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel appointment (student, teacher, or admin)
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    if (
      req.user.role !== constants.USER_ROLES.ADMIN &&
      appointment.student.toString() !== req.user._id.toString() &&
      appointment.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Not authorized to cancel'));
    }

    appointment.status = constants.APPOINTMENT_STATUS.CANCELLED;
    appointment.cancelledAt = new Date();
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Appointment cancelled'));
  } catch (err) {
    next(err);
  }
};

/**
 * Mark appointment as completed (teacher only)
 */
exports.completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    if (req.user.role !== constants.USER_ROLES.TEACHER) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Only teachers can mark completed'));
    }

    appointment.status = constants.APPOINTMENT_STATUS.COMPLETED;
    appointment.completedAt = new Date();
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Appointment marked as completed'));
  } catch (err) {
    next(err);
  }
};

/**
 * Rate and feedback (student only)
 */
exports.rateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    if (appointment.student.toString() !== req.user._id.toString()) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Only the student can rate'));
    }

    appointment.studentRating = rating;
    appointment.studentFeedback = feedback;
    await appointment.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(appointment, 'Rating saved'));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an appointment
 */
exports.deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Appointment not found'));

    // Only admin or involved user
    if (
      req.user.role !== constants.USER_ROLES.ADMIN &&
      appointment.student.toString() !== req.user._id.toString() &&
      appointment.teacher.toString() !== req.user._id.toString()
    ) {
      return res.status(constants.HTTP_STATUS.FORBIDDEN).json(helpers.errorResponse('Not authorized'));
    }

    await appointment.deleteOne();
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Appointment deleted'));
  } catch (err) {
    next(err);
  }
};

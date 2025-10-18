const Appointment = require('../models/Appointment');
const User = require('../models/User');
const helpers = require('../utils/helpers');
const constants = require('../utils/constants');

/**
 * Get list of appointments with filters and pagination
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, status, date, teacher, student, all } = req.query;

    const filter = {};

    if (req.user.role === constants.USER_ROLES.STUDENT) {
      filter.student = req.user._id;
    } else if (req.user.role === constants.USER_ROLES.TEACHER) {
      filter.teacher = req.user._id;
    } else if (req.user.role === constants.USER_ROLES.ADMIN) {
      if (student) filter.student = student;
      if (teacher) filter.teacher = teacher;
    }

    if (status) filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }

    const total = await Appointment.countDocuments(filter);

    let query = Appointment.find(filter).populate('student teacher', 'name email role').sort({ date: -1, _id: -1 });

    if (all === 'true') {
      // Return all without limit and skip
      const appointments = await query.exec();
      res.status(constants.HTTP_STATUS.OK).json({ data: appointments, total, pagination: null });
      return;
    }

    const appointments = await query.limit(Number(limit)).skip((Number(page) - 1) * Number(limit)).exec();

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
    const { teacher, date, time, purpose, message } = req.body;

    const { isValid, errors } = require('../utils/validators').validateAppointment(req.body);
    if (!isValid) {
      return res
        .status(constants.HTTP_STATUS.BAD_REQUEST)
        .json(helpers.errorResponse(constants.MESSAGES.ERROR.VALIDATION_ERROR, errors));
    }

    // Create and save new appointment without subject
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

    return res
      .status(constants.HTTP_STATUS.CREATED)
      .json(helpers.successResponse(appointment, constants.MESSAGES.SUCCESS.APPOINTMENT_CREATED));
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

    // Additional status transition validation can be added here if needed

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

    if ([constants.APPOINTMENT_STATUS.CANCELLED, constants.APPOINTMENT_STATUS.REJECTED, constants.APPOINTMENT_STATUS.COMPLETED].includes(appointment.status)) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse(`Cannot approve an appointment that is ${appointment.status}`));
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

    if ([constants.APPOINTMENT_STATUS.CANCELLED, constants.APPOINTMENT_STATUS.REJECTED, constants.APPOINTMENT_STATUS.COMPLETED].includes(appointment.status)) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse(`Cannot reject an appointment that is ${appointment.status}`));
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

    if ([constants.APPOINTMENT_STATUS.REJECTED, constants.APPOINTMENT_STATUS.COMPLETED, constants.APPOINTMENT_STATUS.CANCELLED].includes(appointment.status)) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse(`Cannot cancel an appointment that is ${appointment.status}`));
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

    if ([constants.APPOINTMENT_STATUS.CANCELLED, constants.APPOINTMENT_STATUS.REJECTED].includes(appointment.status)) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse(`Cannot complete an appointment that is ${appointment.status}`));
    }

    if (appointment.status !== constants.APPOINTMENT_STATUS.CONFIRMED) {
      return res.status(constants.HTTP_STATUS.CONFLICT).json(helpers.errorResponse('Only confirmed appointments can be marked as completed'));
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

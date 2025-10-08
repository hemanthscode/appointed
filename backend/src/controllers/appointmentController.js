const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const { asyncHandler } = require('../middleware/errorHandler');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const { emitToUser } = require('../config/socket');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    date,
    teacher,
    student,
    sort = '-createdAt'
  } = req.query;

  // Build query based on user role
  let query = {};

  // Role-based filtering
  if (req.user.role === 'student') {
    query.student = req.user._id;
  } else if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
  }
  // Admin can see all appointments (no additional filter)

  // Additional filters
  if (status) {
    query.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    query.date = {
      $gte: startDate,
      $lt: endDate
    };
  }

  if (teacher && req.user.role !== 'teacher') {
    query.teacher = teacher;
  }

  if (student && req.user.role !== 'student') {
    query.student = student;
  }

  // Execute query
  const appointments = await Appointment.find(query)
    .populate('student', 'name email department year')
    .populate('teacher', 'name email department subject')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('student', 'name email department year phone')
    .populate('teacher', 'name email department subject phone office');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      appointment
    }
  });
});

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (Student only)
const createAppointment = asyncHandler(async (req, res) => {
  const { teacher, date, time, purpose, message } = req.body;

  // Check if teacher exists and is active
  const teacherUser = await User.findOne({
    _id: teacher,
    role: 'teacher',
    status: 'active'
  });

  if (!teacherUser) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found or inactive'
    });
  }

  // Check if slot is available
  const existingAppointment = await Appointment.findOne({
    teacher,
    date: new Date(date),
    time,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (existingAppointment) {
    return res.status(400).json({
      success: false,
      message: 'This time slot is already booked'
    });
  }

  // Create appointment
  const appointment = await Appointment.create({
    student: req.user._id,
    teacher,
    date: new Date(date),
    time,
    purpose,
    message,
    subject: teacherUser.subject,
    department: teacherUser.department
  });

  // Populate the created appointment
  await appointment.populate([
    { path: 'student', select: 'name email department year' },
    { path: 'teacher', select: 'name email department subject' }
  ]);

  // Create schedule slot if doesn't exist
  await Schedule.findOneAndUpdate(
    {
      teacher,
      date: new Date(date),
      time
    },
    {
      teacher,
      date: new Date(date),
      time,
      status: 'booked',
      appointment: appointment._id,
      student: req.user._id
    },
    {
      upsert: true,
      new: true
    }
  );

  // Send notification to teacher
  await notificationService.createNotification({
    recipient: teacher,
    sender: req.user._id,
    type: 'appointment',
    title: 'New Appointment Request',
    message: `${req.user.name} has requested an appointment`,
    relatedId: appointment._id,
    relatedModel: 'Appointment'
  });

  // Send email to teacher
  try {
    await emailService.sendAppointmentNotification(teacherUser, appointment);
  } catch (error) {
    console.error('Failed to send appointment email:', error);
  }

  // Emit real-time notification
  emitToUser(teacher, 'new_appointment_request', {
    appointment,
    message: `New appointment request from ${req.user.name}`
  });

  res.status(201).json({
    success: true,
    message: 'Appointment created successfully',
    data: {
      appointment
    }
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
const updateAppointment = asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  const allowedUpdates = ['date', 'time', 'message'];
  const updates = {};

  // Only allow updates from the student who created the appointment
  if (req.user.role === 'student' && appointment.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this appointment'
    });
  }

  // Only allow pending appointments to be updated
  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending appointments can be updated'
    });
  }

  // Build updates object
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // If date or time changed, check availability
  if (updates.date || updates.time) {
    const checkDate = updates.date ? new Date(updates.date) : appointment.date;
    const checkTime = updates.time || appointment.time;

    const conflict = await Appointment.findOne({
      _id: { $ne: appointment._id },
      teacher: appointment.teacher,
      date: checkDate,
      time: checkTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
  }

  // Update appointment
  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate([
    { path: 'student', select: 'name email department year' },
    { path: 'teacher', select: 'name email department subject' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully',
    data: {
      appointment
    }
  });
});

// @desc    Approve appointment
// @route   PATCH /api/appointments/:id/approve
// @access  Private (Teacher only)
const approveAppointment = asyncHandler(async (req, res) => {
  const { message } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.teacher._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to approve this appointment'
    });
  }

  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending appointments can be approved'
    });
  }

  // Update appointment
  appointment.status = 'confirmed';
  appointment.confirmedAt = new Date();
  if (message) {
    appointment.teacherResponse = {
      message,
      respondedAt: new Date()
    };
  }
  await appointment.save();

  // Update schedule slot
  await Schedule.findOneAndUpdate(
    {
      teacher: appointment.teacher._id,
      date: appointment.date,
      time: appointment.time
    },
    { status: 'booked' }
  );

  // Send notification to student
  await notificationService.createNotification({
    recipient: appointment.student._id,
    sender: req.user._id,
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: `Your appointment with ${req.user.name} has been confirmed`,
    relatedId: appointment._id,
    relatedModel: 'Appointment'
  });

  // Send confirmation email
  try {
    await emailService.sendAppointmentConfirmation(appointment.student, appointment);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }

  // Emit real-time notification
  emitToUser(appointment.student._id, 'appointment_confirmed', {
    appointment,
    message: `Your appointment has been confirmed`
  });

  res.status(200).json({
    success: true,
    message: 'Appointment approved successfully',
    data: {
      appointment
    }
  });
});

// @desc    Reject appointment
// @route   PATCH /api/appointments/:id/reject
// @access  Private (Teacher only)
const rejectAppointment = asyncHandler(async (req, res) => {
  const { rejectionReason } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.teacher._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reject this appointment'
    });
  }

  if (appointment.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending appointments can be rejected'
    });
  }

  // Update appointment
  appointment.status = 'rejected';
  appointment.rejectedAt = new Date();
  appointment.rejectionReason = rejectionReason;
  await appointment.save();

  // Free up schedule slot
  await Schedule.findOneAndUpdate(
    {
      teacher: appointment.teacher._id,
      date: appointment.date,
      time: appointment.time
    },
    {
      status: 'available',
      $unset: { appointment: 1, student: 1 }
    }
  );

  // Send notification to student
  await notificationService.createNotification({
    recipient: appointment.student._id,
    sender: req.user._id,
    type: 'appointment',
    title: 'Appointment Rejected',
    message: `Your appointment request has been rejected`,
    relatedId: appointment._id,
    relatedModel: 'Appointment'
  });

  // Emit real-time notification
  emitToUser(appointment.student._id, 'appointment_rejected', {
    appointment,
    rejectionReason,
    message: `Your appointment request has been rejected`
  });

  res.status(200).json({
    success: true,
    message: 'Appointment rejected',
    data: {
      appointment
    }
  });
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('student', 'name email')
    .populate('teacher', 'name email');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Check authorization
  const userId = req.user._id.toString();
  const canCancel = userId === appointment.student._id.toString() || 
                   userId === appointment.teacher._id.toString();

  if (!canCancel) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this appointment'
    });
  }

  if (appointment.status === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Completed appointments cannot be cancelled'
    });
  }

  // Update appointment
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  await appointment.save();

  // Free up schedule slot
  await Schedule.findOneAndUpdate(
    {
      teacher: appointment.teacher._id,
      date: appointment.date,
      time: appointment.time
    },
    {
      status: 'available',
      $unset: { appointment: 1, student: 1 }
    }
  );

  // Notify the other party
  const otherPartyId = userId === appointment.student._id.toString() 
    ? appointment.teacher._id 
    : appointment.student._id;

  await notificationService.createNotification({
    recipient: otherPartyId,
    sender: req.user._id,
    type: 'appointment',
    title: 'Appointment Cancelled',
    message: `Appointment on ${appointment.date.toDateString()} has been cancelled`,
    relatedId: appointment._id,
    relatedModel: 'Appointment'
  });

  // Emit real-time notification
  emitToUser(otherPartyId, 'appointment_cancelled', {
    appointment,
    message: `Appointment has been cancelled`
  });

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled successfully',
    data: {
      appointment
    }
  });
});

// @desc    Complete appointment
// @route   PATCH /api/appointments/:id/complete
// @access  Private (Teacher only)
const completeAppointment = asyncHandler(async (req, res) => {
  const { teacherFeedback, meetingNotes } = req.body;

  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to complete this appointment'
    });
  }

  if (appointment.status !== 'confirmed') {
    return res.status(400).json({
      success: false,
      message: 'Only confirmed appointments can be completed'
    });
  }

  // Update appointment
  appointment.status = 'completed';
  appointment.completedAt = new Date();
  if (teacherFeedback) appointment.teacherFeedback = teacherFeedback;
  if (meetingNotes) appointment.meetingNotes = meetingNotes;
  await appointment.save();

  // Update schedule slot
  await Schedule.findOneAndUpdate(
    {
      teacher: appointment.teacher,
      date: appointment.date,
      time: appointment.time
    },
    { status: 'available', $unset: { appointment: 1, student: 1 } }
  );

  res.status(200).json({
    success: true,
    message: 'Appointment completed successfully',
    data: {
      appointment
    }
  });
});

// @desc    Rate appointment
// @route   PATCH /api/appointments/:id/rate
// @access  Private (Student only)
const rateAppointment = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;

  const appointment = await Appointment.findById(req.params.id)
    .populate('teacher');

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  if (appointment.student.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to rate this appointment'
    });
  }

  if (appointment.status !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Only completed appointments can be rated'
    });
  }

  if (appointment.studentRating) {
    return res.status(400).json({
      success: false,
      message: 'This appointment has already been rated'
    });
  }

  // Update appointment
  appointment.studentRating = rating;
  if (feedback) appointment.studentFeedback = feedback;
  await appointment.save();

  // Update teacher's overall rating
  const teacher = await User.findById(appointment.teacher._id);
  const newTotalRatings = teacher.totalRatings + 1;
  const newRating = ((teacher.rating * teacher.totalRatings) + rating) / newTotalRatings;

  teacher.rating = Math.round(newRating * 10) / 10; // Round to 1 decimal
  teacher.totalRatings = newTotalRatings;
  await teacher.save();

  res.status(200).json({
    success: true,
    message: 'Appointment rated successfully',
    data: {
      appointment
    }
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: 'Appointment not found'
    });
  }

  // Free up schedule slot
  await Schedule.findOneAndUpdate(
    {
      teacher: appointment.teacher,
      date: appointment.date,
      time: appointment.time
    },
    {
      status: 'available',
      $unset: { appointment: 1, student: 1 }
    }
  );

  await Appointment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Appointment deleted successfully'
  });
});

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  approveAppointment,
  rejectAppointment,
  cancelAppointment,
  completeAppointment,
  rateAppointment,
  deleteAppointment
};

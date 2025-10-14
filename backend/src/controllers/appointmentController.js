const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');

// ✅ Enhanced Get Appointments with role-based filtering
exports.getAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, date, teacher, student } = req.query;
  const query = {};

  // 🔹 Secure filtering based on logged-in user's role
  if (req.user.role === 'student') {
    query.student = req.user._id;
  } else if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
  } else if (req.user.role === 'admin') {
    // Admin can see all appointments — optionally filter
    if (student) query.student = student;
    if (teacher) query.teacher = teacher;
  }

  // 🔹 Optional filters (for all roles)
  if (status) query.status = status;
  if (date) query.date = new Date(date);

  const appointments = await Appointment.find(query)
    .populate('student teacher', '-password -refreshToken')
    .sort({ date: -1, time: 1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: appointments,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// ✅ Get single appointment by ID
exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate(
    'student teacher',
    '-password -refreshToken'
  );

  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });

  // Restrict direct access (students & teachers can only view their own)
  if (
    req.user.role !== 'admin' &&
    appointment.student._id.toString() !== req.user._id.toString() &&
    appointment.teacher._id.toString() !== req.user._id.toString()
  ) {
    return res
      .status(403)
      .json({ success: false, message: 'Access denied to this appointment' });
  }

  res.status(200).json({ success: true, data: appointment });
});

// ✅ Create new appointment (student only)
exports.createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    student: req.user._id,
    status: 'pending',
  });
  res
    .status(201)
    .json({ success: true, message: 'Appointment created', data: appointment });
});

// ✅ Update appointment (authorized user)
exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });

  // Allow updates only by owner (student/teacher involved)
  if (
    req.user.role !== 'admin' &&
    appointment.student.toString() !== req.user._id.toString() &&
    appointment.teacher.toString() !== req.user._id.toString()
  ) {
    return res
      .status(403)
      .json({ success: false, message: 'Not authorized to update this booking' });
  }

  const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res
    .status(200)
    .json({ success: true, message: 'Appointment updated', data: updated });
});

// ✅ Delete appointment (admin only)
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });
  res.status(200).json({ success: true, message: 'Appointment deleted' });
});

// ✅ Approve appointment (teacher only)
exports.approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });
  if (req.user.role !== 'teacher')
    return res
      .status(403)
      .json({ success: false, message: 'Only teachers can approve appointments' });

  appointment.status = 'confirmed';
  appointment.confirmedAt = new Date();
  await appointment.save();

  res
    .status(200)
    .json({ success: true, message: 'Appointment approved', data: appointment });
});

// ✅ Reject appointment (teacher only)
exports.rejectAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });
  if (req.user.role !== 'teacher')
    return res
      .status(403)
      .json({ success: false, message: 'Only teachers can reject appointments' });

  appointment.status = 'rejected';
  appointment.rejectionReason = req.body.reason || '';
  appointment.rejectedAt = new Date();
  await appointment.save();

  res
    .status(200)
    .json({ success: true, message: 'Appointment rejected', data: appointment });
});

// ✅ Cancel appointment (student or teacher)
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });

  const isAuthorized =
    req.user.role === 'admin' ||
    appointment.student.toString() === req.user._id.toString() ||
    appointment.teacher.toString() === req.user._id.toString();

  if (!isAuthorized)
    return res
      .status(403)
      .json({ success: false, message: 'Access denied for cancellation' });

  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  await appointment.save();

  res
    .status(200)
    .json({ success: true, message: 'Appointment cancelled', data: appointment });
});

// ✅ Mark appointment as completed (teacher only)
exports.completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });
  if (req.user.role !== 'teacher')
    return res
      .status(403)
      .json({ success: false, message: 'Only teachers can complete appointments' });

  appointment.status = 'completed';
  appointment.completedAt = new Date();
  await appointment.save();

  res.status(200).json({
    success: true,
    message: 'Appointment marked as completed',
    data: appointment,
  });
});

// ✅ Rate appointment (student only)
exports.rateAppointment = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment)
    return res
      .status(404)
      .json({ success: false, message: 'Appointment not found' });

  // Role check & ownership
  if (req.user.role !== 'student' ||
      appointment.student.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ success: false, message: 'Only the student can rate this appointment' });
  }

  appointment.studentRating = rating;
  appointment.studentFeedback = feedback;
  await appointment.save();

  res
    .status(200)
    .json({ success: true, message: 'Appointment rated successfully', data: appointment });
});

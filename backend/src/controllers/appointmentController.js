const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');

// Get appointments with pagination and filters
exports.getAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, date, teacher, student } = req.query;
  const query = {};
  if (status) query.status = status;
  if (date) query.date = new Date(date);
  if (teacher) query.teacher = teacher;
  if (student) query.student = student;

  const appointments = await Appointment.find(query)
    .populate('student teacher', '-password -refreshToken')
    .sort({ date: 1, time: 1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: appointments,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

// Get single appointment by ID
exports.getAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('student teacher', '-password -refreshToken');
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.status(200).json({ success: true, data: appointment });
});

// Create new appointment (student only)
exports.createAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.create({
    ...req.body,
    student: req.user._id,
    status: 'pending'
  });
  res.status(201).json({ success: true, message: 'Appointment created', data: appointment });
});

// Update appointment (authorized user)
exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.status(200).json({ success: true, message: 'Appointment updated', data: appointment });
});

// Delete appointment (admin only)
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  res.status(200).json({ success: true, message: 'Appointment deleted' });
});

// Approve appointment (teacher only)
exports.approveAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  appointment.status = 'confirmed';
  appointment.confirmedAt = new Date();
  await appointment.save();
  res.status(200).json({ success: true, message: 'Appointment approved', data: appointment });
});

// Reject appointment (teacher only)
exports.rejectAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  appointment.status = 'rejected';
  appointment.rejectionReason = req.body.reason || '';
  appointment.rejectedAt = new Date();
  await appointment.save();
  res.status(200).json({ success: true, message: 'Appointment rejected', data: appointment });
});

// Cancel appointment (student or teacher)
exports.cancelAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  await appointment.save();
  res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
});

// Mark appointment as completed (teacher only)
exports.completeAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
  appointment.status = 'completed';
  appointment.completedAt = new Date();
  await appointment.save();
  res.status(200).json({ success: true, message: 'Appointment marked completed', data: appointment });
});

// Rate appointment (student only)
exports.rateAppointment = asyncHandler(async (req, res) => {
  const { rating, feedback } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

  appointment.studentRating = rating;
  appointment.studentFeedback = feedback;
  await appointment.save();
  res.status(200).json({ success: true, message: 'Appointment rated', data: appointment });
});

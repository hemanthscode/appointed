const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');
const fileService = require('../services/fileService');

exports.getProfile = asyncHandler(async (req, res) => {
  // Fetch user without populating appointments
  const user = await User.findById(req.user._id).lean();

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.status(200).json({ success: true, data: user });
});


exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'address', 'bio', 'office'];
  const updates = {};
  allowedFields.forEach(f => {
    if (f in req.body) updates[f] = req.body[f];
  });
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: 'Profile updated', data: user.toJSON() });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  if (req.user.avatar) await fileService.deleteFile(req.user.avatar, 'avatars');

  const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.filename }, { new: true });
  res.status(200).json({ success: true, message: 'Avatar uploaded', data: { avatar: user.avatar, avatarUrl: `/uploads/avatars/${user.avatar}` } });
});

exports.getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, department, subject, search, sort = '-rating' } = req.query;
  const query = { role: 'teacher', status: 'active' };
  if (department) query.department = department;
  if (subject) query.subject = new RegExp(subject, 'i');
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { subject: new RegExp(search, 'i') }, { department: new RegExp(search, 'i') }];
  
  const teachers = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit))
    .populate('appointments', null, null, { match: { status: { $in: ['confirmed', 'completed'] } } });

  const total = await User.countDocuments(query);

  // Additional stats can be added here

  res.status(200).json({
    success: true,
    data: teachers.map(t => t.toJSON()),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

exports.getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, department, year, search, sort = 'name' } = req.query;
  const query = { role: 'student' };
  if (department) query.department = department;
  if (year) query.year = year;
  if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { department: new RegExp(search, 'i') }];

  const students = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: students.map(s => s.toJSON()),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken')
    .populate('appointments');

  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.status(200).json({ success: true, data: user.toJSON() });
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'active', 'inactive', 'suspended'];
  if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  res.status(200).json({ success: true, message: 'User status updated', data: user.toJSON() });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  if (user.avatar) await fileService.deleteFile(user.avatar, 'avatars');
  await Appointment.deleteMany({ $or: [{ student: user._id }, { teacher: user._id }] });
  await user.deleteOne();

  res.status(200).json({ success: true, message: 'User deleted successfully' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const validCurr = await user.comparePassword(currentPassword);
  if (!validCurr) return res.status(400).json({ success: false, message: 'Current password incorrect' });

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

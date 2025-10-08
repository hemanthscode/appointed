const User = require('../models/User');
const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');
const fileService = require('../services/fileService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('appointments', 'date time status purpose teacher student', null, {
      sort: { date: -1 }
    });

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'address', 'bio', 'office'];
  const updates = {};

  // Only include allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// @desc    Upload user avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  // Delete old avatar if exists
  if (req.user.avatar) {
    await fileService.deleteFile(req.user.avatar);
  }

  // Update user avatar
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: req.file.filename },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      avatar: user.avatar,
      avatarUrl: `/uploads/avatars/${user.avatar}`
    }
  });
});

// @desc    Get all teachers
// @route   GET /api/users/teachers
// @access  Private
const getTeachers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    subject,
    search,
    sort = '-rating'
  } = req.query;

  // Build query
  const query = { role: 'teacher', status: 'active' };

  if (department) {
    query.department = department;
  }

  if (subject) {
    query.subject = new RegExp(subject, 'i');
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { subject: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') }
    ];
  }

  // Execute query with pagination
  const teachers = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('appointments', 'date time status', null, {
      match: { status: { $in: ['confirmed', 'completed'] } }
    });

  // Get total count
  const total = await User.countDocuments(query);

  // Calculate additional fields for each teacher
  const teachersWithStats = teachers.map(teacher => {
    const teacherObj = teacher.toObject();
    
    // Calculate availability status (simplified)
    teacherObj.availability = teacherObj.appointments && teacherObj.appointments.length > 10 
      ? 'Busy' : 'Available';
    
    // Next available slot (mock data for now)
    teacherObj.nextSlot = '2:00 PM Today';
    
    return teacherObj;
  });

  res.status(200).json({
    success: true,
    data: {
      teachers: teachersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Admin/Teacher)
const getStudents = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    department,
    year,
    search,
    sort = 'name'
  } = req.query;

  // Build query
  const query = { role: 'student' };

  if (department) {
    query.department = department;
  }

  if (year) {
    query.year = year;
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') }
    ];
  }

  // Execute query
  const students = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken')
    .populate('appointments', 'date time status purpose');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// @desc    Update user status
// @route   PATCH /api/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User status updated successfully',
    data: {
      user
    }
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Delete user's avatar if exists
  if (user.avatar) {
    await fileService.deleteFile(user.avatar);
  }

  // Delete related appointments
  await Appointment.deleteMany({
    $or: [
      { student: user._id },
      { teacher: user._id }
    ]
  });

  // Delete user
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isValidPassword = await user.comparePassword(currentPassword);
  if (!isValidPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  getProfile,
  updateProfile,
  uploadAvatar,
  getTeachers,
  getStudents,
  getUserById,
  updateUserStatus,
  deleteUser,
  changePassword
};

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Department = require('../models/Department');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    status,
    department,
    search,
    sort = '-createdAt'
  } = req.query;

  // Build query
  let query = {};

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (department) {
    query.department = department;
  }

  if (search) {
    query.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { department: new RegExp(search, 'i') }
    ];
  }

  // Execute query
  const users = await User.find(query)
    .select('-password -refreshToken')
    .populate('appointments', 'date time status')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  // Add additional statistics for each user
  const usersWithStats = await Promise.all(users.map(async (user) => {
    const userObj = user.toObject();
    
    if (user.role === 'teacher') {
      // Get teacher-specific stats
      const teacherStats = await Appointment.aggregate([
        { $match: { teacher: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      userObj.stats = {
        totalAppointments: user.appointmentsCount || 0,
        rating: user.rating || 0,
        statusBreakdown: teacherStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } else if (user.role === 'student') {
      // Get student-specific stats
      const studentStats = await Appointment.aggregate([
        { $match: { student: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      userObj.stats = {
        totalAppointments: user.appointmentsCount || 0,
        statusBreakdown: studentStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    }
    
    return userObj;
  }));

  res.status(200).json({
    success: true,
    data: {
      users: usersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Get user approval requests
// @route   GET /api/admin/approvals
// @access  Private (Admin)
const getApprovals = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    sort = '-createdAt'
  } = req.query;

  // Build query for pending users
  let query = { status: 'pending' };

  if (type) {
    query.role = type;
  }

  const pendingUsers = await User.find(query)
    .select('-password -refreshToken')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  // Format for approval interface
  const approvals = pendingUsers.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    type: user.role,
    department: user.department,
    year: user.year,
    subject: user.subject,
    requestDate: user.createdAt,
    status: user.status,
    // Mock documents for now - in real app this would come from user model
    documents: user.role === 'teacher' 
      ? ['CV.pdf', 'Qualification_Certificate.pdf', 'ID_Proof.pdf']
      : ['Student_ID.pdf', 'Enrollment_Certificate.pdf']
  }));

  res.status(200).json({
    success: true,
    data: {
      approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Approve user registration
// @route   PATCH /api/admin/approvals/:id/approve
// @access  Private (Admin)
const approveUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending users can be approved'
    });
  }

  // Update user status
  user.status = 'active';
  user.isVerified = true;
  await user.save();

  // Create notification for user
  const notificationService = require('../services/notificationService');
  await notificationService.createNotification({
    recipient: user._id,
    sender: req.user._id,
    type: 'approval',
    title: 'Account Approved',
    message: message || 'Your account has been approved and is now active',
    priority: 'high'
  });

  // Send approval email
  try {
    const emailService = require('../services/emailService');
    await emailService.sendApprovalEmail(user, message);
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }

  res.status(200).json({
    success: true,
    message: 'User approved successfully',
    data: { user }
  });
});

// @desc    Reject user registration
// @route   PATCH /api/admin/approvals/:id/reject
// @access  Private (Admin)
const rejectUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (user.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending users can be rejected'
    });
  }

  // Send rejection email before deleting
  try {
    const emailService = require('../services/emailService');
    await emailService.sendRejectionEmail(user, reason);
  } catch (error) {
    console.error('Failed to send rejection email:', error);
  }

  // Delete user (or mark as rejected based on business requirements)
  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'User registration rejected'
  });
});

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getSystemStats = asyncHandler(async (req, res) => {
  const { period = 'all' } = req.query;

  // Build date filter based on period
  let dateFilter = {};
  const today = new Date();

  switch (period) {
    case 'today':
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateFilter = { $gte: today, $lt: tomorrow };
      break;
    
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      dateFilter = { $gte: weekAgo, $lte: today };
      break;
    
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      dateFilter = { $gte: monthAgo, $lte: today };
      break;
    
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(today.getFullYear() - 1);
      dateFilter = { $gte: yearAgo, $lte: today };
      break;
    
    default:
      dateFilter = {}; // All time
  }

  // Get user statistics
  const userStats = await User.aggregate([
    ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
      }
    }
  ]);

  // Get appointment statistics
  const appointmentStats = await Appointment.aggregate([
    ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get department statistics
  const departmentStats = await User.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: '$department',
        teachers: { $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] } },
        students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    { $sort: { total: -1 } }
  ]);

  // Get recent activity (last 10 users registered)
  const recentUsers = await User.find()
    .select('name email role status createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

  // Format response
  const formattedUserStats = {
    students: 0,
    teachers: 0,
    admins: 0,
    total: 0,
    active: 0,
    pending: 0
  };

  const formattedAppointmentStats = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    total: 0
  };

  userStats.forEach(stat => {
    formattedUserStats[stat._id + 's'] = stat.count; // students, teachers, etc.
    formattedUserStats.total += stat.count;
    formattedUserStats.active += stat.active;
    formattedUserStats.pending += stat.pending;
  });

  appointmentStats.forEach(stat => {
    formattedAppointmentStats[stat._id] = stat.count;
    formattedAppointmentStats.total += stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      period,
      users: formattedUserStats,
      appointments: formattedAppointmentStats,
      departments: departmentStats,
      recentActivity: recentUsers,
      generatedAt: new Date()
    }
  });
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
// @access  Private (Admin)
const updateSettings = asyncHandler(async (req, res) => {
  // This would typically update a Settings model
  // For now, we'll just return success
  const { settings } = req.body;

  // In a real implementation, you would:
  // 1. Validate settings
  // 2. Update Settings model
  // 3. Apply changes to system

  res.status(200).json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings }
  });
});

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSettings = asyncHandler(async (req, res) => {
  // This would typically fetch from a Settings model
  const settings = {
    general: {
      siteName: 'Appointed',
      siteDescription: 'Student-Teacher Appointment System',
      maintenanceMode: false,
      registrationEnabled: true
    },
    appointments: {
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      defaultAppointmentDuration: 60,
      allowStudentCancellation: true,
      requireTeacherApproval: true
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderHours: 24
    },
    security: {
      maxLoginAttempts: 5,
      sessionTimeout: 1440, // minutes
      requirePasswordChange: false,
      passwordMinLength: 8
    }
  };

  res.status(200).json({
    success: true,
    data: { settings }
  });
});

// @desc    Bulk user operations
// @route   PATCH /api/admin/users/bulk
// @access  Private (Admin)
const bulkUserOperation = asyncHandler(async (req, res) => {
  const { userIds, operation, data } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs array is required'
    });
  }

  let updateData = {};
  let message = '';

  switch (operation) {
    case 'activate':
      updateData = { status: 'active' };
      message = 'Users activated successfully';
      break;
    
    case 'deactivate':
      updateData = { status: 'inactive' };
      message = 'Users deactivated successfully';
      break;
    
    case 'suspend':
      updateData = { status: 'suspended' };
      message = 'Users suspended successfully';
      break;
    
    case 'delete':
      await User.deleteMany({ _id: { $in: userIds } });
      return res.status(200).json({
        success: true,
        message: 'Users deleted successfully'
      });
    
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid operation'
      });
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    updateData
  );

  res.status(200).json({
    success: true,
    message,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

module.exports = {
  getUsers,
  getApprovals,
  approveUser,
  rejectUser,
  getSystemStats,
  updateSettings,
  getSettings,
  bulkUserOperation
};

const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Schedule = require('../models/Schedule');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Get paginated users list with optional filters (admins only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT, role, status, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      // Text search on name/email (simple example)
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    res.status(constants.HTTP_STATUS.OK).json(
      helpers.successResponse(users.map(u => u.toJSON()), null, helpers.calculatePagination(total, page, limit))
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Bulk user operations by IDs: activate, deactivate, suspend, delete (admins only)
 */
exports.bulkUserOperation = async (req, res, next) => {
  try {
    const { ids, operation } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Array of user IDs is required'));
    }

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

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(result, `Operation '${operation}' completed`));
  } catch (error) {
    next(error);
  }
};

/**
 * List users pending approval (status = PENDING) with pagination (admins only)
 */
exports.getApprovals = async (req, res, next) => {
  try {
    const { page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;
    const query = { status: constants.USER_STATUS.PENDING };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: 1 });

    res.status(constants.HTTP_STATUS.OK).json(
      helpers.successResponse(users.map(u => u.toJSON()), null, helpers.calculatePagination(total, page, limit))
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Approve a pending user by ID (admins only)
 */
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, status: constants.USER_STATUS.PENDING },
      { status: constants.USER_STATUS.ACTIVE },
      { new: true }
    );
    if (!user) {
      return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Pending user not found'));
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), 'User approved'));
  } catch (err) {
    next(err);
  }
};

/**
 * Reject a pending user by ID (admins only)
 */
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.params.id, status: constants.USER_STATUS.PENDING });
    if (!user) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Pending user not found'));

    user.status = constants.USER_STATUS.INACTIVE;
    await user.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(user.toJSON(), 'User rejected'));
  } catch (err) {
    next(err);
  }
};

/**
 * Get system-wide stats (users count etc., extendable) (admins only)
 */
exports.getSystemStats = async (req, res, next) => {
  try {
    const { timeRange = '30' } = req.query; // Days to look back (default 30)
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // ============================================
    // USER STATISTICS
    // ============================================
    const [totalUsers, usersByRole, usersByStatus, recentUsers, pendingApprovals] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ status: constants.USER_STATUS.PENDING })
    ]);

    // User growth trend (last 7 days)
    const userGrowthTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const userStats = {
      total: totalUsers,
      byRole: usersByRole.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      byStatus: usersByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      recentRegistrations: recentUsers,
      pendingApprovals,
      growthTrend: userGrowthTrend
    };

    // ============================================
    // TEACHER STATISTICS
    // ============================================
    const [
      totalTeachers,
      activeTeachers,
      teachersByDepartment,
      topRatedTeachers,
      teacherUtilization
    ] = await Promise.all([
      User.countDocuments({ role: constants.USER_ROLES.TEACHER }),
      User.countDocuments({ 
        role: constants.USER_ROLES.TEACHER, 
        status: constants.USER_STATUS.ACTIVE 
      }),
      User.aggregate([
        { $match: { role: constants.USER_ROLES.TEACHER } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.find({ role: constants.USER_ROLES.TEACHER })
        .sort({ rating: -1, totalRatings: -1 })
        .limit(5)
        .select('name department subject rating totalRatings appointmentsCount')
        .lean(),
      User.aggregate([
        { $match: { role: constants.USER_ROLES.TEACHER } },
        {
          $group: {
            _id: null,
            avgAppointments: { $avg: '$appointmentsCount' },
            maxAppointments: { $max: '$appointmentsCount' },
            avgRating: { $avg: '$rating' },
            totalAppointments: { $sum: '$appointmentsCount' }
          }
        }
      ])
    ]);

    const teacherStats = {
      total: totalTeachers,
      active: activeTeachers,
      inactive: totalTeachers - activeTeachers,
      byDepartment: teachersByDepartment,
      topRated: topRatedTeachers,
      utilization: teacherUtilization[0] || {
        avgAppointments: 0,
        maxAppointments: 0,
        avgRating: 0,
        totalAppointments: 0
      }
    };

    // ============================================
    // STUDENT STATISTICS
    // ============================================
    const [
      totalStudents,
      activeStudents,
      studentsByDepartment,
      studentsByYear,
      mostActiveStudents
    ] = await Promise.all([
      User.countDocuments({ role: constants.USER_ROLES.STUDENT }),
      User.countDocuments({ 
        role: constants.USER_ROLES.STUDENT, 
        status: constants.USER_STATUS.ACTIVE 
      }),
      User.aggregate([
        { $match: { role: constants.USER_ROLES.STUDENT } },
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      User.aggregate([
        { $match: { role: constants.USER_ROLES.STUDENT } },
        { $group: { _id: '$year', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      User.find({ role: constants.USER_ROLES.STUDENT })
        .sort({ appointmentsCount: -1 })
        .limit(5)
        .select('name department year appointmentsCount')
        .lean()
    ]);

    const studentStats = {
      total: totalStudents,
      active: activeStudents,
      inactive: totalStudents - activeStudents,
      byDepartment: studentsByDepartment,
      byYear: studentsByYear,
      mostActive: mostActiveStudents
    };

    // ============================================
    // APPOINTMENT STATISTICS
    // ============================================
    const [
      totalAppointments,
      appointmentsByStatus,
      recentAppointments,
      upcomingAppointments,
      appointmentsByPurpose,
      appointmentTrend,
      avgRating
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Appointment.countDocuments({ createdAt: { $gte: startDate } }),
      Appointment.countDocuments({
        date: { $gte: new Date() },
        status: { $in: [constants.APPOINTMENT_STATUS.PENDING, constants.APPOINTMENT_STATUS.CONFIRMED] }
      }),
      Appointment.aggregate([
        { $group: { _id: '$purpose', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Appointment.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 30 }
      ]),
      Appointment.aggregate([
        { $match: { studentRating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avgRating: { $avg: '$studentRating' }, totalRatings: { $sum: 1 } } }
      ])
    ]);

    // Calculate completion rate
    const completedCount = appointmentsByStatus.find(
      s => s._id === constants.APPOINTMENT_STATUS.COMPLETED
    )?.count || 0;
    const completionRate = totalAppointments > 0 
      ? ((completedCount / totalAppointments) * 100).toFixed(2) 
      : 0;

    const appointmentStats = {
      total: totalAppointments,
      byStatus: appointmentsByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      recent: recentAppointments,
      upcoming: upcomingAppointments,
      byPurpose: appointmentsByPurpose,
      trend: appointmentTrend,
      completionRate: parseFloat(completionRate),
      averageRating: avgRating[0]?.avgRating?.toFixed(2) || 0,
      totalRatings: avgRating[0]?.totalRatings || 0
    };

    // ============================================
    // DEPARTMENT INSIGHTS
    // ============================================
    const departmentInsights = await Appointment.aggregate([
      {
        $group: {
          _id: '$department',
          totalAppointments: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ['$status', constants.APPOINTMENT_STATUS.COMPLETED] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', constants.APPOINTMENT_STATUS.PENDING] }, 1, 0]
            }
          },
          avgRating: { $avg: '$studentRating' }
        }
      },
      { $sort: { totalAppointments: -1 } }
    ]);

    // ============================================
    // SCHEDULE STATISTICS
    // ============================================
    const [totalSlots, slotsByStatus, slotsUtilization] = await Promise.all([
      Schedule.countDocuments({ isActive: true }),
      Schedule.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Schedule.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            available: {
              $sum: {
                $cond: [{ $eq: ['$status', constants.SCHEDULE_STATUS.AVAILABLE] }, 1, 0]
              }
            },
            booked: {
              $sum: {
                $cond: [{ $eq: ['$status', constants.SCHEDULE_STATUS.BOOKED] }, 1, 0]
              }
            },
            blocked: {
              $sum: {
                $cond: [{ $eq: ['$status', constants.SCHEDULE_STATUS.BLOCKED] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const utilizationData = slotsUtilization[0] || { available: 0, booked: 0, blocked: 0 };
    const utilizationRate = totalSlots > 0 
      ? ((utilizationData.booked / totalSlots) * 100).toFixed(2) 
      : 0;

    const scheduleStats = {
      totalSlots,
      byStatus: slotsByStatus.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      utilizationRate: parseFloat(utilizationRate),
      utilization: utilizationData
    };

    // ============================================
    // PERFORMANCE METRICS
    // ============================================
    const performanceMetrics = {
      appointmentResponseTime: {
        // Average time from pending to confirmed/rejected
        description: 'Average time for teachers to respond to appointments'
      },
      studentEngagement: {
        activeStudentsWithAppointments: await User.countDocuments({
          role: constants.USER_ROLES.STUDENT,
          appointmentsCount: { $gt: 0 }
        }),
        totalActiveStudents: activeStudents,
        engagementRate: activeStudents > 0 
          ? (
              (await User.countDocuments({
                role: constants.USER_ROLES.STUDENT,
                appointmentsCount: { $gt: 0 }
              }) / activeStudents) * 100
            ).toFixed(2)
          : 0
      },
      teacherAvailability: {
        averageSlotsPerTeacher: totalSlots > 0 && activeTeachers > 0
          ? (totalSlots / activeTeachers).toFixed(2)
          : 0,
        avgAvailableSlots: utilizationData.available,
        avgBookedSlots: utilizationData.booked
      }
    };

    // ============================================
    // ALERTS & WARNINGS
    // ============================================
    const alerts = [];
    
    if (pendingApprovals > 10) {
      alerts.push({
        type: 'warning',
        message: `${pendingApprovals} users pending approval`,
        action: 'Review pending user registrations'
      });
    }

    if (upcomingAppointments > 100) {
      alerts.push({
        type: 'info',
        message: `${upcomingAppointments} upcoming appointments`,
        action: 'Monitor appointment load'
      });
    }

    if (parseFloat(completionRate) < 50) {
      alerts.push({
        type: 'warning',
        message: `Low completion rate: ${completionRate}%`,
        action: 'Investigate appointment cancellations'
      });
    }

    if (activeTeachers < 5) {
      alerts.push({
        type: 'error',
        message: `Only ${activeTeachers} active teachers`,
        action: 'Recruit more teachers or activate pending accounts'
      });
    }

    // ============================================
    // COMPILE RESPONSE
    // ============================================
    const stats = {
      overview: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalAppointments,
        pendingApprovals,
        upcomingAppointments
      },
      users: userStats,
      teachers: teacherStats,
      students: studentStats,
      appointments: appointmentStats,
      schedules: scheduleStats,
      departments: departmentInsights,
      performance: performanceMetrics,
      alerts,
      generatedAt: new Date(),
      timeRange: `Last ${daysAgo} days`
    };

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(stats));
  } catch (err) {
    next(err);
  }
};

/**
 * Get system settings placeholder (admins only)
 */
exports.getSettings = async (req, res, next) => {
  try {
    // Placeholder: integrate DB or config store here
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({}));
  } catch (err) {
    next(err);
  }
};

/**
 * Update system settings placeholder (admins only)
 */
exports.updateSettings = async (req, res, next) => {
  try {
    // Placeholder: save settings to DB or config store here
    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Settings updated'));
  } catch (err) {
    next(err);
  }
};

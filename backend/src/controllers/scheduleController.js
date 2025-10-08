const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get teacher's schedule
// @route   GET /api/schedule
// @access  Private (Teacher)
const getSchedule = asyncHandler(async (req, res) => {
  const {
    date,
    week,
    month,
    year,
    status,
    page = 1,
    limit = 50
  } = req.query;

  // Build date filter
  let dateFilter = {};
  
  if (date) {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    dateFilter.date = {
      $gte: targetDate,
      $lt: nextDate
    };
  } else if (week) {
    // Week filter logic
    const [year, week] = week.split('-W');
    const startOfWeek = new Date(year, 0, 1 + (week - 1) * 7);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    dateFilter.date = {
      $gte: startOfWeek,
      $lt: endOfWeek
    };
  } else if (month) {
    const [year, monthNum] = month.split('-');
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0);
    
    dateFilter.date = {
      $gte: startOfMonth,
      $lte: endOfMonth
    };
  }

  // Build query
  const query = {
    teacher: req.user._id,
    isActive: true,
    ...dateFilter
  };

  if (status) {
    query.status = status;
  }

  // Get schedule slots
  const scheduleSlots = await Schedule.find(query)
    .populate('student', 'name email department year')
    .populate('appointment', 'purpose message status')
    .sort({ date: 1, time: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Get statistics
  const stats = await Schedule.aggregate([
    { $match: { teacher: req.user._id, isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusCounts = {
    available: 0,
    booked: 0,
    blocked: 0,
    unavailable: 0
  };

  stats.forEach(stat => {
    statusCounts[stat._id] = stat.count;
  });

  const total = await Schedule.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      scheduleSlots,
      statistics: statusCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update schedule (create/update multiple slots)
// @route   PUT /api/schedule
// @access  Private (Teacher)
const updateSchedule = asyncHandler(async (req, res) => {
  const { scheduleSlots } = req.body;

  if (!Array.isArray(scheduleSlots) || scheduleSlots.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Schedule slots array is required'
    });
  }

  const updatedSlots = [];
  const errors = [];

  for (let i = 0; i < scheduleSlots.length; i++) {
    const slotData = scheduleSlots[i];
    
    try {
      // Check if slot already exists
      let existingSlot = await Schedule.findOne({
        teacher: req.user._id,
        date: new Date(slotData.date),
        time: slotData.time
      });

      if (existingSlot) {
        // Check if slot is booked before updating
        if (existingSlot.status === 'booked' && slotData.status !== 'booked') {
          errors.push({
            index: i,
            message: 'Cannot modify booked time slot'
          });
          continue;
        }

        // Update existing slot
        existingSlot.status = slotData.status;
        existingSlot.blockReason = slotData.blockReason;
        existingSlot.notes = slotData.notes;
        existingSlot.duration = slotData.duration || 60;
        
        await existingSlot.save();
        updatedSlots.push(existingSlot);
      } else {
        // Create new slot
        const newSlot = await Schedule.create({
          teacher: req.user._id,
          date: new Date(slotData.date),
          time: slotData.time,
          status: slotData.status || 'available',
          blockReason: slotData.blockReason,
          notes: slotData.notes,
          duration: slotData.duration || 60,
          isRecurring: slotData.isRecurring || false,
          recurringPattern: slotData.recurringPattern,
          recurringEndDate: slotData.recurringEndDate ? new Date(slotData.recurringEndDate) : undefined
        });

        updatedSlots.push(newSlot);
      }
    } catch (error) {
      errors.push({
        index: i,
        message: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Schedule updated successfully',
    data: {
      updatedSlots,
      errors: errors.length > 0 ? errors : undefined
    }
  });
});

// @desc    Get available slots for a teacher
// @route   GET /api/schedule/available/:teacherId
// @access  Private
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { date, week } = req.query;

  // Verify teacher exists
  const teacher = await User.findOne({
    _id: teacherId,
    role: 'teacher',
    status: 'active'
  });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: 'Teacher not found'
    });
  }

  // Build date filter
  let dateFilter = {};
  
  if (date) {
    const targetDate = new Date(date);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    dateFilter.date = {
      $gte: targetDate,
      $lt: nextDate
    };
  } else if (week) {
    // Get current week if no specific date provided
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    dateFilter.date = {
      $gte: startOfWeek,
      $lt: endOfWeek
    };
  } else {
    // Default to next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    dateFilter.date = {
      $gte: today,
      $lt: nextWeek
    };
  }

  const availableSlots = await Schedule.find({
    teacher: teacherId,
    status: 'available',
    isActive: true,
    ...dateFilter
  }).sort({ date: 1, time: 1 });

  res.status(200).json({
    success: true,
    data: {
      teacher: {
        id: teacher._id,
        name: teacher.name,
        department: teacher.department,
        subject: teacher.subject
      },
      availableSlots
    }
  });
});

// @desc    Block time slot
// @route   POST /api/schedule/block
// @access  Private (Teacher)
const blockSlot = asyncHandler(async (req, res) => {
  const { date, time, blockReason, isRecurring, recurringPattern, recurringEndDate } = req.body;

  // Check if slot exists and is not booked
  let existingSlot = await Schedule.findOne({
    teacher: req.user._id,
    date: new Date(date),
    time
  });

  if (existingSlot) {
    if (existingSlot.status === 'booked') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block a booked time slot'
      });
    }

    // Update existing slot
    existingSlot.status = 'blocked';
    existingSlot.blockReason = blockReason;
    await existingSlot.save();

    res.status(200).json({
      success: true,
      message: 'Time slot blocked successfully',
      data: { slot: existingSlot }
    });
  } else {
    // Create new blocked slot
    const newSlot = await Schedule.create({
      teacher: req.user._id,
      date: new Date(date),
      time,
      status: 'blocked',
      blockReason,
      isRecurring,
      recurringPattern,
      recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Time slot blocked successfully',
      data: { slot: newSlot }
    });
  }
});

// @desc    Unblock time slot
// @route   DELETE /api/schedule/block/:slotId
// @access  Private (Teacher)
const unblockSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;

  const slot = await Schedule.findOne({
    _id: slotId,
    teacher: req.user._id
  });

  if (!slot) {
    return res.status(404).json({
      success: false,
      message: 'Schedule slot not found'
    });
  }

  if (slot.status !== 'blocked') {
    return res.status(400).json({
      success: false,
      message: 'Only blocked slots can be unblocked'
    });
  }

  // Make slot available
  slot.status = 'available';
  slot.blockReason = undefined;
  await slot.save();

  res.status(200).json({
    success: true,
    message: 'Time slot unblocked successfully',
    data: { slot }
  });
});

// @desc    Delete schedule slot
// @route   DELETE /api/schedule/:slotId
// @access  Private (Teacher)
const deleteSlot = asyncHandler(async (req, res) => {
  const { slotId } = req.params;

  const slot = await Schedule.findOne({
    _id: slotId,
    teacher: req.user._id
  });

  if (!slot) {
    return res.status(404).json({
      success: false,
      message: 'Schedule slot not found'
    });
  }

  if (slot.status === 'booked') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete a booked time slot'
    });
  }

  await Schedule.findByIdAndDelete(slotId);

  res.status(200).json({
    success: true,
    message: 'Schedule slot deleted successfully'
  });
});

// @desc    Get schedule statistics
// @route   GET /api/schedule/stats
// @access  Private (Teacher)
const getScheduleStats = asyncHandler(async (req, res) => {
  const { period = 'week' } = req.query;

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
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      dateFilter = { $gte: today, $lt: endOfWeek };
      break;
    
    case 'month':
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      dateFilter = { $gte: today, $lte: endOfMonth };
      break;
    
    default:
      dateFilter = { $gte: today };
  }

  // Get schedule statistics
  const stats = await Schedule.aggregate([
    {
      $match: {
        teacher: req.user._id,
        date: dateFilter,
        isActive: true
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get appointment statistics
  const appointmentStats = await Appointment.aggregate([
    {
      $match: {
        teacher: req.user._id,
        date: dateFilter
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Format response
  const scheduleStats = {
    available: 0,
    booked: 0,
    blocked: 0,
    unavailable: 0
  };

  const appointmentCounts = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0
  };

  stats.forEach(stat => {
    scheduleStats[stat._id] = stat.count;
  });

  appointmentStats.forEach(stat => {
    appointmentCounts[stat._id] = stat.count;
  });

  res.status(200).json({
    success: true,
    data: {
      period,
      schedule: scheduleStats,
      appointments: appointmentCounts,
      totalSlots: Object.values(scheduleStats).reduce((sum, count) => sum + count, 0),
      totalAppointments: Object.values(appointmentCounts).reduce((sum, count) => sum + count, 0)
    }
  });
});

module.exports = {
  getSchedule,
  updateSchedule,
  getAvailableSlots,
  blockSlot,
  unblockSlot,
  deleteSlot,
  getScheduleStats
};

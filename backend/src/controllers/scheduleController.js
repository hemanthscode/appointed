const Schedule = require('../models/Schedule');
const User = require('../models/User');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Get schedule slots for teacher by date with pagination
 */
exports.getSchedule = async (req, res, next) => {
  try {
    const { date, page = constants.PAGINATION.DEFAULT_PAGE, limit = constants.PAGINATION.DEFAULT_LIMIT } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date query parameter is required'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const query = { teacher: req.user._id, date: normalizedDate, isActive: true };

    const total = await Schedule.countDocuments(query);
    let scheduleSlots = await Schedule.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    // Sorting slots by time ascending
    scheduleSlots = scheduleSlots.sort((a, b) => {
      const timeToNum = (time) => {
        const [t, mer] = time.split(' ');
        let [h, m] = t.split(':').map(Number);
        if (mer === 'PM' && h !== 12) h += 12;
        if (mer === 'AM' && h === 12) h = 0;
        return h * 100 + m;
      };
      return timeToNum(a.time) - timeToNum(b.time);
    });

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      scheduleSlots,
      pagination: helpers.calculatePagination(total, page, limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Update multiple schedule slots (teacher only)
 */
exports.updateSchedule = async (req, res, next) => {
  try {
    const { scheduleSlots } = req.body;
    if (!Array.isArray(scheduleSlots) || scheduleSlots.length === 0) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Schedule slots array is required'));
    }

    const updatedSlots = [];
    const errors = [];

    for (let i = 0; i < scheduleSlots.length; i++) {
      const slotData = scheduleSlots[i];
      try {
        const slot = await Schedule.findOne({ teacher: req.user._id, date: new Date(slotData.date), time: slotData.time, isActive: true });
        if (!slot) {
          errors.push({ index: i, message: 'Slot does not exist' });
          continue;
        }
        if (slot.status === constants.SCHEDULE_STATUS.BOOKED && slotData.status !== constants.SCHEDULE_STATUS.BOOKED) {
          errors.push({ index: i, message: 'Cannot modify a booked slot' });
          continue;
        }
        slot.status = slotData.status || slot.status;
        slot.blockReason = slot.status === constants.SCHEDULE_STATUS.BLOCKED ? slotData.blockReason : undefined;
        slot.notes = slotData.notes || slot.notes;
        await slot.save();
        updatedSlots.push(slot);
      } catch (error) {
        errors.push({ index: i, message: error.message });
      }
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(
      { updatedSlots, errors: errors.length > 0 ? errors : undefined },
      'Schedule updated successfully'
    ));
  } catch (err) {
    next(err);
  }
};

/**
 * Get available slots for a teacher on given date
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date query parameter is required'));

    const teacher = await User.findOne({ _id: teacherId, role: constants.USER_ROLES.TEACHER, status: constants.USER_STATUS.ACTIVE });
    if (!teacher) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Teacher not found'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const availableSlots = await Schedule.find({
      teacher: teacherId,
      date: normalizedDate,
      status: constants.SCHEDULE_STATUS.AVAILABLE,
      isActive: true
    }).sort({ time: 1 });

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      teacher: {
        id: teacher._id,
        name: teacher.name,
        department: teacher.department,
        subject: teacher.subject
      },
      availableSlots
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Block a specific slot (teacher only)
 */
exports.blockSlot = async (req, res, next) => {
  try {
    const { date, time, blockReason } = req.body;
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    let slot = await Schedule.findOne({ teacher: req.user._id, date: normalizedDate, time });
    if (!slot) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Cannot block non-existing slot'));
    }
    if (slot.status === constants.SCHEDULE_STATUS.BOOKED) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Cannot block a booked slot'));
    }

    slot.status = constants.SCHEDULE_STATUS.BLOCKED;
    slot.blockReason = blockReason;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(slot, 'Time slot blocked'));
  } catch (err) {
    next(err);
  }
};

/**
 * Unblock a slot (teacher only)
 */
exports.unblockSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id });
    if (!slot) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Schedule slot not found'));
    if (slot.status !== constants.SCHEDULE_STATUS.BLOCKED) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Only blocked slots can be unblocked'));
    }

    slot.status = constants.SCHEDULE_STATUS.AVAILABLE;
    slot.blockReason = undefined;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(slot, 'Time slot unblocked'));
  } catch (err) {
    next(err);
  }
};

/**
 * Delete (soft) a slot (teacher only)
 */
exports.deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id });
    if (!slot) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Schedule slot not found'));
    if (slot.status === constants.SCHEDULE_STATUS.BOOKED) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Cannot delete a booked slot'));
    }

    slot.isActive = false;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Schedule slot deactivated'));
  } catch (err) {
    next(err);
  }
};

/**
 * Get aggregated stats for slots on a date (teacher only)
 */
exports.getScheduleStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date query parameter is required'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const query = { teacher: req.user._id, date: normalizedDate, isActive: true };

    const totalSlots = constants.TIME_SLOTS.length;

    const statsRaw = await Schedule.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      available: 0,
      booked: 0,
      blocked: 0,
      unavailable: 0
    };
    statsRaw.forEach(({ _id, count }) => {
      statusCounts[_id] = count;
    });

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      date: normalizedDate,
      totalSlots,
      statusCounts,
      remainingSlots: totalSlots - (statusCounts.booked + statusCounts.blocked)
    }));
  } catch (err) {
    next(err);
  }
};

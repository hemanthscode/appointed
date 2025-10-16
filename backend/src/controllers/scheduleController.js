const Schedule = require('../models/Schedule');
const User = require('../models/User');
const constants = require('../utils/constants');
const helpers = require('../utils/helpers');

/**
 * Lazy seed daily standard slots for teacher on date if not existing, then fetch paginated schedule
 */
async function seedSlotsIfMissing(teacherId, date) {
  const count = await Schedule.countDocuments({ teacher: teacherId, date, isActive: true });
  if (count > 0) return; // Already seeded

  const seedSlots = constants.TIME_SLOTS.map(time => ({
    teacher: teacherId,
    date,
    time,
    status: constants.SCHEDULE_STATUS.AVAILABLE,
    isActive: true
  }));
  await Schedule.insertMany(seedSlots);
}

/**
 * Get teacher’s schedule for date with pagination; lazy create slots if missing
 */
exports.getSchedule = async (req, res, next) => {
  try {
    const { date, page = 1, limit = 10 } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date is required'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    await seedSlotsIfMissing(req.user._id, normalizedDate);

    const query = { teacher: req.user._id, date: normalizedDate, isActive: true };

    const total = await Schedule.countDocuments(query);
    const scheduleSlots = await Schedule.find(query)
      .sort({ time: 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse({
      scheduleSlots,
      pagination: helpers.calculatePagination(total, page, limit)
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Update multiple slots; no deletion, only status/status notes change;
 * Block/unblock are statuses with reasons.
 * Booked slots cannot be modified.
 */
exports.updateSchedule = async (req, res, next) => {
  try {
    const { scheduleSlots } = req.body;
    if (!Array.isArray(scheduleSlots) || scheduleSlots.length === 0) {
      return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Slots array is required'));
    }

    const updatedSlots = [];
    const errors = [];

    for (let i = 0; i < scheduleSlots.length; i++) {
      const slotData = scheduleSlots[i];
      try {
        const normalizedDate = new Date(slotData.date);
        normalizedDate.setUTCHours(0, 0, 0, 0);

        const slot = await Schedule.findOne({
          teacher: req.user._id,
          date: normalizedDate,
          time: slotData.time,
          isActive: true
        });

        if (!slot) {
          errors.push({ index: i, message: 'Slot does not exist' });
          continue;
        }

        if (slot.status === constants.SCHEDULE_STATUS.BOOKED && slotData.status !== constants.SCHEDULE_STATUS.BOOKED) {
          errors.push({ index: i, message: 'Cannot modify a booked slot' });
          continue;
        }

        // Update status and notes
        slot.status = slotData.status || slot.status;
        slot.blockReason = slot.status === constants.SCHEDULE_STATUS.BLOCKED ? slotData.blockReason : undefined;
        slot.notes = slotData.notes || slot.notes;
        await slot.save();
        updatedSlots.push(slot);
      } catch (e) {
        errors.push({ index: i, message: e.message });
      }
    }

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(
      { updatedSlots, errors: errors.length ? errors : undefined },
      'Schedule updated'
    ));
  } catch (err) {
    next(err);
  }
};

/**
 * Get available slots for teacher on given date; returns seeded or existing slots marked AVAILABLE.
 */
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { date } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date is required'));

    const teacher = await User.findOne({ _id: teacherId, role: constants.USER_ROLES.TEACHER, status: constants.USER_STATUS.ACTIVE });
    if (!teacher) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Teacher not found'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    await seedSlotsIfMissing(teacherId, normalizedDate);

    const slots = await Schedule.find({
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
      availableSlots: slots
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * Block a slot by setting status to BLOCKED with a reason; booked slots cannot be blocked.
 */
exports.blockSlot = async (req, res, next) => {
  try {
    const { date, time, blockReason } = req.body;
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const slot = await Schedule.findOne({ teacher: req.user._id, date: normalizedDate, time, isActive: true });
    if (!slot) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Slot does not exist'));
    if (slot.status === constants.SCHEDULE_STATUS.BOOKED) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Cannot block booked slot'));

    slot.status = constants.SCHEDULE_STATUS.BLOCKED;
    slot.blockReason = blockReason;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(slot, 'Slot blocked'));
  } catch (err) {
    next(err);
  }
};

/**
 * Unblock a blocked slot by setting status back to AVAILABLE.
 */
exports.unblockSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id, isActive: true });
    if (!slot) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Slot not found'));
    if (slot.status !== constants.SCHEDULE_STATUS.BLOCKED) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Slot is not blocked'));

    slot.status = constants.SCHEDULE_STATUS.AVAILABLE;
    slot.blockReason = undefined;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(slot, 'Slot unblocked'));
  } catch (err) {
    next(err);
  }
};

/**
 * Deactivate a slot (soft delete by setting active=false); only if not booked.
 */
exports.deleteSlot = async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id, isActive: true });
    if (!slot) return res.status(constants.HTTP_STATUS.NOT_FOUND).json(helpers.errorResponse('Slot not found'));
    if (slot.status === constants.SCHEDULE_STATUS.BOOKED) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Cannot delete booked slot'));

    slot.isActive = false;
    await slot.save();

    res.status(constants.HTTP_STATUS.OK).json(helpers.successResponse(null, 'Slot deactivated'));
  } catch (err) {
    next(err);
  }
};

/**
 * Aggregate stats about slots by status for a date.
 */
exports.getScheduleStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(constants.HTTP_STATUS.BAD_REQUEST).json(helpers.errorResponse('Date is required'));

    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const query = { teacher: req.user._id, date: normalizedDate, isActive: true };

    const totalSlots = constants.TIME_SLOTS.length;

    const agg = await Schedule.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      available: 0,
      booked: 0,
      blocked: 0,
      unavailable: 0
    };
    agg.forEach(({ _id, count }) => {
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

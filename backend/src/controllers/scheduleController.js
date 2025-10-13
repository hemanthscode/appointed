const Schedule = require('../models/Schedule');
const Appointment = require('../models/Appointment');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');
const constants = require('../utils/constants');

// Normalize date to midnight UTC
function normalizeDateOnly(dateInput) {
  const d = new Date(dateInput);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Return start and end of day range
function getDateRange(dateStr) {
  const start = normalizeDateOnly(dateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

// Convert time string like "9:00 AM" into a sortable number (900)
function timeToNumber(timeStr) {
  const [timePart, meridian] = timeStr.split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);
  if (meridian === "PM" && hours !== 12) hours += 12;
  else if (meridian === "AM" && hours === 12) hours = 0;
  return hours * 100 + minutes;
}

// Sort slots by date ascending then time ascending logically
function sortSlots(slots) {
  return slots.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return timeToNumber(a.time) - timeToNumber(b.time);
  });
}

// Ensure fixed TIME_SLOTS exist for teacher on given date, create missing only
async function ensureFixedSlots(teacherId, date) {
  const normalizedDate = normalizeDateOnly(date);

  const existingSlots = await Schedule.find({ teacher: teacherId, date: normalizedDate });

  const existingTimes = new Set(existingSlots.map(s => s.time));

  const missingTimes = constants.TIME_SLOTS.filter(t => !existingTimes.has(t));

  const slotsToInsert = missingTimes.map(time => ({
    teacher: teacherId,
    date: normalizedDate,
    time,
    duration: 60,
    status: 'available',
    isRecurring: false,
    isActive: true
  }));

  if (slotsToInsert.length > 0) {
    try {
      await Schedule.insertMany(slotsToInsert, { ordered: false });
    } catch (e) {
      // Ignore duplicate key errors to avoid crashing
      if (e.code !== 11000) throw e;
    }
  }
}

exports.getSchedule = asyncHandler(async (req, res) => {
  const { date, page = 1, limit = 50 } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date query parameter is required' });

  const teacherId = req.user._id;
  const normalizedDate = normalizeDateOnly(date);

  await ensureFixedSlots(teacherId, normalizedDate);

  const query = { teacher: teacherId, date: normalizedDate, isActive: true };

  const total = await Schedule.countDocuments(query);

  let scheduleSlots = await Schedule.find(query)
    .populate('student', 'name email department year')
    .populate('appointment', 'purpose message status')
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  scheduleSlots = sortSlots(scheduleSlots);

  // Daily statistics
  const stats = await Schedule.aggregate([
    { $match: { teacher: teacherId, date: normalizedDate, isActive: true } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const statusCounts = { available: 0, booked: 0, blocked: 0, unavailable: 0 };
  stats.forEach(({ _id, count }) => { statusCounts[_id] = count; });

  res.status(200).json({
    success: true,
    data: {
      scheduleSlots,
      statistics: statusCounts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    }
  });
});

exports.updateSchedule = asyncHandler(async (req, res) => {
  const { scheduleSlots } = req.body;

  if (!Array.isArray(scheduleSlots) || scheduleSlots.length === 0) {
    return res.status(400).json({ success: false, message: 'Schedule slots array is required' });
  }

  const updatedSlots = [];
  const errors = [];

  function normalizeTime(timeStr) {
    return timeStr.trim().toUpperCase();
  }

  for (let i = 0; i < scheduleSlots.length; i++) {
    const slotData = scheduleSlots[i];
    try {
      const normalizedDate = normalizeDateOnly(slotData.date);
      const normalizedTime = normalizeTime(slotData.time);
      let existingSlot = await Schedule.findOne({
        teacher: req.user._id,
        date: normalizedDate,
        time: normalizedTime,
        isActive: true
      });

      if (!existingSlot) {
        errors.push({ index: i, message: 'Slot does not exist; cannot create new slot outside fixed slots' });
        continue;
      }

      if (existingSlot.status === 'booked' && slotData.status !== 'booked') {
        errors.push({ index: i, message: 'Cannot modify booked time slot' });
        continue;
      }

      existingSlot.status = slotData.status || existingSlot.status;
      existingSlot.blockReason = existingSlot.status === 'blocked' ? slotData.blockReason : undefined;
      existingSlot.notes = slotData.notes;
      existingSlot.duration = slotData.duration || 60;
      existingSlot.isRecurring = slotData.isRecurring || false;
      existingSlot.recurringPattern = slotData.recurringPattern;
      existingSlot.recurringEndDate = slotData.recurringEndDate ? new Date(slotData.recurringEndDate) : undefined;

      await existingSlot.save();
      updatedSlots.push(existingSlot);
    } catch (error) {
      errors.push({ index: i, message: error.message });
    }
  }

  updatedSlots.sort((a, b) => {
    if (a.date < b.date) return -1;
    if (a.date > b.date) return 1;
    return timeToNumber(a.time) - timeToNumber(b.time);
  });

  res.status(200).json({
    success: true,
    message: 'Schedule updated successfully',
    data: { updatedSlots, errors: errors.length > 0 ? errors : undefined }
  });
});

exports.getAvailableSlots = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { date } = req.query;

  if (!date) return res.status(400).json({ success: false, message: 'Date query parameter is required' });

  const teacher = await User.findOne({ _id: teacherId, role: 'teacher', status: 'active' });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const normalizedDate = normalizeDateOnly(date);
  await ensureFixedSlots(teacherId, normalizedDate);

  let availableSlots = await Schedule.find({
    teacher: teacherId,
    date: normalizedDate,
    status: 'available',
    isActive: true
  });

  availableSlots = availableSlots.sort((a, b) => timeToNumber(a.time) - timeToNumber(b.time));

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

exports.blockSlot = asyncHandler(async (req, res) => {
  const { date, time, blockReason, isRecurring, recurringPattern, recurringEndDate } = req.body;
  const normalizedDate = normalizeDateOnly(date);

  let existingSlot = await Schedule.findOne({ teacher: req.user._id, date: normalizedDate, time });

  if (!existingSlot) {
    return res.status(400).json({ success: false, message: 'Cannot block non-existing slot' });
  }

  if (existingSlot.status === 'booked') {
    return res.status(400).json({ success: false, message: 'Cannot block a booked time slot' });
  }

  existingSlot.status = 'blocked';
  existingSlot.blockReason = blockReason;
  existingSlot.isRecurring = isRecurring || false;
  existingSlot.recurringPattern = recurringPattern;
  existingSlot.recurringEndDate = recurringEndDate ? new Date(recurringEndDate) : undefined;
  await existingSlot.save();

  res.status(200).json({ success: true, message: 'Time slot blocked', data: { slot: existingSlot } });
});

exports.unblockSlot = asyncHandler(async (req, res) => {
  const {slotId} = req.params;

  const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id });
  if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

  if (slot.status !== 'blocked') {
    return res.status(400).json({ success: false, message: 'Only blocked slots can be unblocked' });
  }

  slot.status = 'available';
  slot.blockReason = undefined;
  await slot.save();

  res.status(200).json({ success: true, message: 'Time slot unblocked', data: { slot } });
});

exports.deleteSlot = asyncHandler(async (req, res) => {
  const {slotId} = req.params;

  const slot = await Schedule.findOne({ _id: slotId, teacher: req.user._id });
  if (!slot) return res.status(404).json({ success: false, message: 'Schedule slot not found' });

  if (slot.status === 'booked') {
    return res.status(400).json({ success: false, message: 'Cannot delete a booked time slot' });
  }

  // Soft delete preferred
  slot.isActive = false;
  await slot.save();

  res.status(200).json({ success: true, message: 'Schedule slot deactivated' });
});

exports.getScheduleStats = asyncHandler(async (req, res) => {
  const {date} = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date query param is required' });

  const teacherId = req.user._id;
  const normalizedDate = normalizeDateOnly(date);

  const query = { teacher: teacherId, date: normalizedDate, isActive: true };

  // The fixed number of slots depends on your constants
  const totalSlots = constants.TIME_SLOTS.length;

  const slotStatsRaw = await Schedule.aggregate([
    { $match: query },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  const statusCounts = { available: 0, booked: 0, blocked: 0, unavailable: 0 };
  slotStatsRaw.forEach(({_id, count}) => { statusCounts[_id] = count; });

  res.status(200).json({
    success: true,
    data: {
      date: normalizedDate,
      totalSlots,
      statusCounts,
      remainingSlots: totalSlots - (statusCounts.booked + statusCounts.blocked),
    }
  });
});

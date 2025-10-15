const mongoose = require('mongoose');
const constants = require('../utils/constants');

const scheduleSlotSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time format']
  },
  duration: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: Object.values(constants.SCHEDULE_STATUS),
    default: constants.SCHEDULE_STATUS.AVAILABLE
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.APPOINTMENTS
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS
  },
  blockReason: {
    type: String,
    maxlength: [100, 'Block reason max 100 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function () { return this.isRecurring; }
  },
  recurringEndDate: Date,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Normalize date on save to UTC midnight
scheduleSlotSchema.pre('save', function(next) {
  if (this.isModified('date')) {
    this.date.setUTCHours(0, 0, 0, 0);
  }
  if (this.status !== constants.SCHEDULE_STATUS.BLOCKED) {
    this.blockReason = undefined;
  }
  next();
});

// Unique index to prevent duplicate slots for teacher/date/time
scheduleSlotSchema.index({ teacher: 1, date: 1, time: 1 }, { unique: true });
scheduleSlotSchema.index({ teacher: 1, status: 1 });
scheduleSlotSchema.index({ date: 1, status: 1 });

// Virtual dateTime getter combining date and time for easier sorting
scheduleSlotSchema.virtual('dateTime').get(function () {
  return new Date(`${this.date.toDateString()} ${this.time}`);
});

scheduleSlotSchema.virtual('isPast').get(function () {
  return this.dateTime < new Date();
});

module.exports = mongoose.model(constants.COLLECTIONS.SCHEDULES, scheduleSlotSchema);

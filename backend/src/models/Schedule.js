const mongoose = require('mongoose');

const scheduleSlotSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
    default: 60 // minutes
  },
  status: {
    type: String,
    enum: ['available', 'booked', 'blocked', 'unavailable'],
    default: 'available'
  },
  // When booked
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // When blocked
  blockReason: {
    type: String,
    maxlength: [100, 'Block reason cannot be more than 100 characters']
  },
  // Recurring settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  recurringEndDate: Date,
  // Metadata
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for performance
scheduleSlotSchema.index({ teacher: 1, date: 1, time: 1 }, { unique: true });
scheduleSlotSchema.index({ teacher: 1, status: 1 });
scheduleSlotSchema.index({ date: 1, status: 1 });

// Virtual for datetime
scheduleSlotSchema.virtual('dateTime').get(function() {
  return new Date(`${this.date.toDateString()} ${this.time}`);
});

// Virtual for is past
scheduleSlotSchema.virtual('isPast').get(function() {
  return this.dateTime < new Date();
});

module.exports = mongoose.model('Schedule', scheduleSlotSchema);

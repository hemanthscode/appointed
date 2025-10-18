const mongoose = require('mongoose');
const constants = require('../utils/constants');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: [true, 'Student is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: constants.COLLECTIONS.USERS,
    required: [true, 'Teacher is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  time: {
    type: String,
    required: [true, 'Time is required']
  },
  duration: {
    type: Number,
    default: 60 // minutes
  },
  purpose: {
    type: String,
    enum: Object.values(constants.APPOINTMENT_PURPOSES).map(p => p.value),
    required: [true, 'Purpose is required']
  },
  subject: {
    type: String,
    required: false
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: Object.values(constants.APPOINTMENT_STATUS),
    default: constants.APPOINTMENT_STATUS.PENDING
  },
  teacherResponse: {
    message: String,
    respondedAt: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  meetingLink: String,
  meetingNotes: String,
  studentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  studentFeedback: String,
  teacherFeedback: String,
  confirmedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  department: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexing for frequent queries
appointmentSchema.index({ student: 1, date: 1 });
appointmentSchema.index({ teacher: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

// Virtual for formattedDate for front-end convenience
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
});

// Virtual to check if appointment is upcoming (for UX)
appointmentSchema.virtual('isUpcoming').get(function() {
  const dateTime = new Date(`${this.date.toDateString()} ${this.time}`);
  return dateTime > new Date();
});

// Pre-save to populate department/subject based on teacher
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const User = require('./User');
      const teacher = await User.findById(this.teacher).select('department subject');
      if (teacher) {
        this.department = teacher.department;
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Post save hook to increment appointments count for student & teacher
appointmentSchema.post('save', async function() {
  try {
    const User = require('./User');
    await User.findByIdAndUpdate(this.student, { $inc: { appointmentsCount: 1 } });
    await User.findByIdAndUpdate(this.teacher, { $inc: { appointmentsCount: 1 } });
  } catch (error) {
    console.error('Error updating appointment counts:', error);
  }
});

module.exports = mongoose.model(constants.COLLECTIONS.APPOINTMENTS, appointmentSchema);

const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Student is required'] },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Teacher is required'] },
  date: { type: Date, required: [true, 'Date is required'] },
  time: { type: String, required: [true, 'Time is required'] },
  duration: { type: Number, default: 60 }, // minutes
  purpose: {
    type: String,
    enum: ['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'],
    required: [true, 'Purpose is required']
  },
  subject: { type: String, required: [true, 'Subject is required'] },
  message: { type: String, maxlength: [500, 'Message cannot exceed 500 characters'] },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  teacherResponse: {
    message: String,
    respondedAt: Date
  },
  rejectionReason: { type: String, maxlength: [200, 'Rejection reason cannot exceed 200 characters'] },
  meetingLink: String,
  meetingNotes: String,
  studentRating: { type: Number, min: 1, max: 5 },
  studentFeedback: String,
  teacherFeedback: String,
  confirmedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  reminderSent: { type: Boolean, default: false },
  reminderSentAt: Date,
  department: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

appointmentSchema.index({ student: 1, date: 1 });
appointmentSchema.index({ teacher: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
});

appointmentSchema.virtual('isUpcoming').get(function() {
  const dateTime = new Date(`${this.date.toDateString()} ${this.time}`);
  return dateTime > new Date();
});

// Pre-save middleware to set department and subject from teacher on new appointment
appointmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const teacher = await this.model('User').findById(this.teacher).select('department subject');
      if (teacher) {
        this.department = teacher.department;
        this.subject = teacher.subject;
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Post-save middleware to update appointment counts for student and teacher
appointmentSchema.post('save', async function() {
  try {
    await this.model('User').findByIdAndUpdate(this.student, { $inc: { appointmentsCount: 1 } });
    await this.model('User').findByIdAndUpdate(this.teacher, { $inc: { appointmentsCount: 1 } });
  } catch (error) {
    console.error('Error updating appointment counts:', error);
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

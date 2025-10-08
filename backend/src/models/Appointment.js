const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Core References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  
  // Appointment Details
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
  
  // Purpose & Content
  purpose: {
    type: String,
    enum: ['academic-help', 'project-discussion', 'career-guidance', 'exam-preparation', 'research-guidance', 'other'],
    required: [true, 'Purpose is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required']
  },
  message: {
    type: String,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  
  // Status Management
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Teacher Response
  teacherResponse: {
    message: String,
    respondedAt: Date
  },
  
  // Rejection Details
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot be more than 200 characters']
  },
  
  // Meeting Details
  meetingLink: String,
  meetingNotes: String,
  
  // Ratings & Feedback
  studentRating: {
    type: Number,
    min: 1,
    max: 5
  },
  studentFeedback: String,
  teacherFeedback: String,
  
  // Timestamps for status changes
  confirmedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  
  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Academic Info
  department: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
appointmentSchema.index({ student: 1, date: 1 });
appointmentSchema.index({ teacher: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });

// Virtual for formatted date
appointmentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for is upcoming
appointmentSchema.virtual('isUpcoming').get(function() {
  const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.time}`);
  return appointmentDateTime > new Date();
});

// Pre-save middleware to set department
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

// Update appointment counts after save
appointmentSchema.post('save', async function() {
  try {
    // Update student appointment count
    await this.model('User').findByIdAndUpdate(this.student, {
      $inc: { appointmentsCount: 1 }
    });
    
    // Update teacher appointment count
    await this.model('User').findByIdAndUpdate(this.teacher, {
      $inc: { appointmentsCount: 1 }
    });
  } catch (error) {
    console.error('Error updating appointment counts:', error);
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

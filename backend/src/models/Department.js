const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: { type: String, maxlength: [500, 'Description cannot exceed 500 characters'] },
  head: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ name: String, code: String, credits: Number }],
  isActive: { type: Boolean, default: true },
  teacherCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });

module.exports = mongoose.model('Department', departmentSchema);

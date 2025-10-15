const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const constants = require('../utils/constants');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: Object.values(constants.USER_ROLES),
    required: [true, 'Role is required']
  },
  department: {
    type: String,
    required: function() {
      return this.role === constants.USER_ROLES.STUDENT || this.role === constants.USER_ROLES.TEACHER;
    }
  },
  year: {
    type: String,
    required: function() {
      return this.role === constants.USER_ROLES.STUDENT;
    }
  },
  subject: {
    type: String,
    required: function() {
      return this.role === constants.USER_ROLES.TEACHER;
    }
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  office: String,
  phone: {
    type: String,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(constants.USER_STATUS),
    default: constants.USER_STATUS.PENDING
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  appointmentsCount: {
    type: Number,
    default: 0
  },
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  joinedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient lookups
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });

// Virtual appointments based on role
userSchema.virtual('studentAppointments', {
  ref: constants.COLLECTIONS.APPOINTMENTS,
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

userSchema.virtual('teacherAppointments', {
  ref: constants.COLLECTIONS.APPOINTMENTS,
  localField: '_id',
  foreignField: 'teacher',
  justOne: false
});



// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password for authentication
userSchema.methods.comparePassword = async function(plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

// Generate JWT auth token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id: this._id, email: this.email, role: this.role, status: this.status },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE });
};

// Hide sensitive info on toJSON
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

module.exports = mongoose.model(constants.COLLECTIONS.USERS, userSchema);

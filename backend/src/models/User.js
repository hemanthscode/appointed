const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
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
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    required: [true, 'Role is required']
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student' || this.role === 'teacher';
    },
    default: function() {
      return this.role === 'admin' ? 'Administration' : undefined;
    }
  },
  year: { type: String, required: function() { return this.role === 'student'; } },
  subject: { type: String, required: function() { return this.role === 'teacher'; } },
  bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
  office: String,
  phone: { type: String, match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'] },
  address: String,
  avatar: { type: String, default: null },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },
  isVerified: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  totalRatings: { type: Number, default: 0 },
  appointmentsCount: { type: Number, default: 0 },
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  joinedDate: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });

// Appointment virtual field conditionally referencing student or teacher appointments
userSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: function() {
    return this.role === 'student' ? 'student' : 'teacher';
  }
});

// Hash password before save if modified
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role, status: this.status },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
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

module.exports = mongoose.model('User', userSchema);


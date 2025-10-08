// ADD THIS AT THE VERY TOP
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression and parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static('uploads'));

// Health check - MOVED TO /api/health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});
app.get('/debug/admin-check', async (req, res) => {
  try {
    const User = require('../src/models/User');
    
    // Check if admin exists
    const admin = await User.findOne({ email: 'admin@university.edu' }).select('+password');
    
    if (admin) {
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const passwordTest = await bcrypt.compare('password123', admin.password);
      
      res.json({
        adminExists: true,
        adminData: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          status: admin.status,
          department: admin.department,
          isVerified: admin.isVerified,
          hasPassword: !!admin.password
        },
        passwordTest: passwordTest,
        passwordLength: admin.password ? admin.password.length : 0
      });
    } else {
      res.json({
        adminExists: false,
        message: 'Admin not found in database'
      });
    }
  } catch (error) {
    res.json({
      error: true,
      message: error.message
    });
  }
});

// Import routes (ONLY AFTER middleware setup)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const scheduleRoutes = require('./routes/schedule');
const adminRoutes = require('./routes/admin');
const metadataRoutes = require('./routes/metadata');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/metadata', metadataRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const { notFound, errorHandler } = require('./middleware/errorHandler');
const corsOptions = require('./config/cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const appointmentRoutes = require('./routes/appointments');
const messageRoutes = require('./routes/messages');
const scheduleRoutes = require('./routes/schedule');
const adminRoutes = require('./routes/admin');
const metadataRoutes = require('./routes/metadata');

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(cors(corsOptions));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/metadata', metadataRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

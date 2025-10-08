// ADD THIS AT THE VERY TOP - BEFORE ANY OTHER REQUIRES
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { createServer } = require('http');
const { initializeSocket } = require('./config/socket');

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

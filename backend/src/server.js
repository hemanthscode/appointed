require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');
const { createServer } = require('http');
const { initializeSocket } = require('./config/socket');

const PORT = process.env.PORT || 3001;

connectDB();

const server = createServer(app);

const io = initializeSocket(server);

server.listen(PORT, () => {
  console.info(`🚀 Server running on port ${PORT}`);
  console.info(`📊 Environment: ${process.env.NODE_ENV}`);
});

process.on('SIGTERM', () => {
  console.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.info('Server terminated');
  });
});

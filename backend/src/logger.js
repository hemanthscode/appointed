const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack 
        ? `${timestamp} [${level.toUpperCase()}] - ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}] - ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    // Optionally add file transports
  ],
  exitOnError: false
});

module.exports = logger;

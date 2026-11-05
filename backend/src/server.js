import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`[Server] Health check: http://localhost:${PORT}/api/health`);
  logger.info(`[Server] Contact API:  http://localhost:${PORT}/api/contact`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`[UnhandledRejection] ${err.message}`, err.stack);
  server.close(() => process.exit(1));
});

// Graceful termination
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('[Server] Process terminated.');
  });
});

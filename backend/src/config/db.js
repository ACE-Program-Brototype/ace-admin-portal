import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ace';
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'ace'
    });
    logger.success(`[MongoDB] Connected to host: ${conn.connection.host}, database: "${conn.connection.name}"`);
    return conn;
  } catch (error) {
    logger.error(`[MongoDB Error] Failed to connect: ${error.message}`);
    logger.warn('[MongoDB Tip] Ensure MongoDB is running locally or check your MONGODB_URI in .env');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';

export const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ace.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'ACE Administrator';

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      logger.info(`[Seed Admin] Admin user already exists: ${adminEmail} (ID: ${admin._id})`);
    } else {
      admin = await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin'
      });
      logger.success(`[Seed Admin] Admin user created successfully: ${adminEmail} (ID: ${admin._id})`);
    }

    return admin;
  } catch (error) {
    logger.error(`[Seed Admin Error] Failed to seed admin user: ${error.message}`);
    throw error;
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedAdmin.js')) {
  seedAdmin()
    .then(() => {
      logger.success('[Seed Admin] Script execution finished.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`[Seed Admin] Failed: ${err.message}`);
      process.exit(1);
    });
}

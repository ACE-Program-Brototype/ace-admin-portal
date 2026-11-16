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
    const adminName = process.env.ADMIN_NAME || 'ACE Super Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '9847000001';

    let admin = await Admin.findOne({ email: adminEmail });

    if (admin) {
      let modified = false;
      if (!admin.isSuperAdmin) {
        admin.isSuperAdmin = true;
        modified = true;
      }
      if (admin.role !== 'Super Administrator') {
        admin.role = 'Super Administrator';
        modified = true;
      }
      if (!admin.phone) {
        admin.phone = adminPhone;
        modified = true;
      }
      if (modified) {
        await admin.save();
        logger.info(`[Seed Admin] Updated ${adminEmail} to superadmin with phone.`);
      } else {
        logger.info(`[Seed Admin] Super admin user verified: ${adminEmail} (ID: ${admin._id})`);
      }
    } else {
      admin = await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        phone: adminPhone,
        role: 'Super Administrator',
        isSuperAdmin: true
      });
      logger.success(`[Seed Admin] Super admin created successfully: ${adminEmail} (ID: ${admin._id})`);
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

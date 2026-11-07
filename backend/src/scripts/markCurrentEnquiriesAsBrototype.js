import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ContactSubmission } from '../models/ContactSubmission.js';
import { logger } from '../utils/logger.js';

export const markCurrentEnquiriesAsBrototype = async () => {
  try {
    await connectDB();

    const totalBefore = await ContactSubmission.countDocuments();
    const nonBrototypeBefore = await ContactSubmission.countDocuments({
      isBrototypeStudent: { $ne: 'yes' }
    });

    logger.info(`[Update Enquiries] Total enquiries in database: ${totalBefore}`);
    logger.info(`[Update Enquiries] Non-Brototype enquiries to update: ${nonBrototypeBefore}`);

    if (nonBrototypeBefore > 0) {
      const result = await ContactSubmission.updateMany(
        { isBrototypeStudent: { $ne: 'yes' } },
        { $set: { isBrototypeStudent: 'yes' } }
      );
      logger.success(`[Update Enquiries] Successfully updated ${result.modifiedCount} enquiry/enquiries to isBrototypeStudent: 'yes'`);
    } else {
      logger.info('[Update Enquiries] All current enquiries are already marked as Brototype students.');
    }

    const nonBrototypeAfter = await ContactSubmission.countDocuments({
      isBrototypeStudent: { $ne: 'yes' }
    });
    const brototypeAfter = await ContactSubmission.countDocuments({
      isBrototypeStudent: 'yes'
    });

    logger.info(`[Update Enquiries] Final status -> Total: ${totalBefore}, Brototype: ${brototypeAfter}, Non-Brototype: ${nonBrototypeAfter}`);

    return { total: totalBefore, updated: nonBrototypeBefore, brototype: brototypeAfter };
  } catch (error) {
    logger.error(`[Update Enquiries Error] Failed: ${error.message}`);
    throw error;
  }
};

if (process.argv[1] && process.argv[1].endsWith('markCurrentEnquiriesAsBrototype.js')) {
  markCurrentEnquiriesAsBrototype()
    .then(() => {
      logger.success('[Update Enquiries] Script completed.');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`[Update Enquiries] Failed: ${err.message}`);
      process.exit(1);
    });
}

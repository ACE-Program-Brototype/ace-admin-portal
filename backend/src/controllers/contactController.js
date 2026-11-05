import { ContactSubmission } from '../models/ContactSubmission.js';
import { syncToGoogleSheets } from '../services/googleSheetService.js';
import { logger } from '../utils/logger.js';

// @desc    Submit contact / inquiry form (Validated & Sanitized via validateContactForm)
// @route   POST /api/contact
// @access  Public
export const submitContactForm = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      isBrototypeStudent,
      batchNumber,
      counsellorName,
      message
    } = req.body;

    logger.info(`[Contact] Processing validated submission from: ${email}`);

    // Insert into MongoDB database ('ace')
    const submission = await ContactSubmission.create({
      name,
      email,
      phone,
      isBrototypeStudent,
      batchNumber,
      counsellorName,
      message
    });

    logger.success(
      `[Contact] Stored submission in MongoDB (DB: ${submission.db.name}, ID: ${submission._id})`
    );

    // 1. Send immediate success response to client
    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: submission._id,
        name: submission.name,
        email: submission.email,
        isBrototypeStudent: submission.isBrototypeStudent,
        createdAt: submission.createdAt
      }
    });

    // 2. Trigger Google Sheets insertion in background without blocking response
    setImmediate(async () => {
      try {
        await syncToGoogleSheets(submission);
      } catch (backgroundError) {
        logger.error(
          `[Background Worker Error] Unhandled error in Google Sheets sync: ${backgroundError.message}`
        );
      }
    });
  } catch (error) {
    next(error);
  }
};

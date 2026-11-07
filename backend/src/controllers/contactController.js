import mongoose from 'mongoose';
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
      domain,
      message
    } = req.body;

    logger.info(`[Contact] Processing validated submission from: ${email}`);

    // Duplicate check — reject if same email OR phone already exists in the database
    const existingSubmission = await ContactSubmission.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { phone: phone.trim() }
      ]
    });

    if (existingSubmission) {
      const matchedOn =
        existingSubmission.email === email.trim().toLowerCase() ? 'email address' : 'phone number';
      logger.info(
        `[Contact] Duplicate submission blocked — matched on ${matchedOn}: ${email} / ${phone} (existing ID: ${existingSubmission._id})`
      );
      return res.status(200).json({
        success: true,
        duplicate: true,
        message:
          "Thank you for reaching out to us! It appears we have already received an enquiry " +
          "from you, and our team is actively reviewing your submission. We truly appreciate " +
          "your enthusiasm and patience — we will be in touch with you very soon."
      });
    }

    // Insert into MongoDB database ('ace')
    const submission = await ContactSubmission.create({
      name,
      email,
      phone,
      isBrototypeStudent,
      batchNumber,
      domain,
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
        domain: submission.domain || undefined,
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

// @desc    Get all contact submissions with pagination, sorting, and filtering
// @route   GET /api/contact
// @access  Private (Admin JWT required)
export const getContactSubmissions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const query = {};

    // Filter by sheetSyncStatus (pending, synced, failed)
    if (req.query.status) {
      query.sheetSyncStatus = req.query.status.toLowerCase();
    }

    // Filter by isBrototypeStudent (yes, no)
    if (req.query.isBrototypeStudent) {
      query.isBrototypeStudent = req.query.isBrototypeStudent.toLowerCase();
    }

    // Filter by domain
    if (req.query.domain) {
      query.domain = req.query.domain.trim();
    }

    // Keyword search across name, email, phone, batchNumber, domain
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { batchNumber: searchRegex },
        { domain: searchRegex }
      ];
    }

    const sort = req.query.sort || '-createdAt';

    const [total, submissions] = await Promise.all([
      ContactSubmission.countDocuments(query),
      ContactSubmission.find(query).sort(sort).skip(skip).limit(limit)
    ]);

    const pages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      page,
      pages,
      data: submissions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact submission by ID
// @route   GET /api/contact/:id
// @access  Private (Admin JWT required)
export const getContactSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format'
      });
    }

    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.status(200).json({
      success: true,
      data: submission
    });
  } catch (error) {
    next(error);
  }
};

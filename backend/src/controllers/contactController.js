import mongoose from 'mongoose';
import {
  ContactSubmission,
  ENQUIRY_STATUSES,
  VALID_STATUS_TRANSITIONS
} from '../models/ContactSubmission.js';
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

    // 2. Trigger Google Sheets insertion in background without blocking response (commented for time being)
    // setImmediate(async () => {
    //   try {
    //     await syncToGoogleSheets(submission);
    //   } catch (backgroundError) {
    //     logger.error(
    //       `[Background Worker Error] Unhandled error in Google Sheets sync: ${backgroundError.message}`
    //     );
    //   }
    // });
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

    // Filter by enquiry lifecycle status (ENQUIRED, CONNECTED, PREPARATION, SCHEDULED, REJECTED, SELECTED, ONBOARDED)
    if (req.query.lifecycleStatus && req.query.lifecycleStatus !== 'all') {
      query.status = req.query.lifecycleStatus.toUpperCase();
    } else if (
      req.query.status &&
      ENQUIRY_STATUSES.includes(req.query.status.toUpperCase())
    ) {
      query.status = req.query.status.toUpperCase();
    }

    // Filter by sheetSyncStatus (pending, synced, failed)
    if (req.query.sheetSyncStatus && req.query.sheetSyncStatus !== 'all') {
      query.sheetSyncStatus = req.query.sheetSyncStatus.toLowerCase();
    } else if (
      req.query.status &&
      ['pending', 'synced', 'failed'].includes(req.query.status.toLowerCase())
    ) {
      query.sheetSyncStatus = req.query.status.toLowerCase();
    }

    // Filter by isBrototypeStudent ('yes' / 'brototype' vs 'no' / 'general')
    if (req.query.isBrototypeStudent && req.query.isBrototypeStudent !== 'all') {
      const studentVal = req.query.isBrototypeStudent.toLowerCase();
      if (studentVal === 'yes' || studentVal === 'brototype') {
        query.isBrototypeStudent = 'yes';
      } else if (studentVal === 'no' || studentVal === 'general') {
        query.isBrototypeStudent = 'no';
      }
    }

    // Date range filter for submitted date (createdAt)
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          query.createdAt.$gte = start;
        }
      }
      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
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

    // Ensure statusHistory is always present with at least initial status
    const formattedSubmissions = submissions.map((sub) => {
      const doc = sub.toObject();
      if (!doc.statusHistory || doc.statusHistory.length === 0) {
        doc.statusHistory = [
          {
            status: doc.status || 'ENQUIRED',
            previousStatus: null,
            changedByName: 'Candidate (Form Submission)',
            changedAt: doc.createdAt,
            notes: doc.message || 'Initial contact enquiry'
          }
        ];
      }
      return doc;
    });

    res.status(200).json({
      success: true,
      count: formattedSubmissions.length,
      total,
      page,
      pages,
      data: formattedSubmissions
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

    const doc = submission.toObject();
    if (!doc.statusHistory || doc.statusHistory.length === 0) {
      doc.statusHistory = [
        {
          status: doc.status || 'ENQUIRED',
          previousStatus: null,
          changedByName: 'Candidate (Form Submission)',
          changedAt: doc.createdAt,
          notes: doc.message || 'Initial contact enquiry'
        }
      ];
    }

    res.status(200).json({
      success: true,
      data: doc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lifecycle status of an enquiry with history tracking
// @route   PATCH /api/contact/:id/status
// @access  Private (Admin JWT required)
export const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status: targetStatus, scheduledAt, meetLink, feedback, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid submission ID format'
      });
    }

    if (!targetStatus || !ENQUIRY_STATUSES.includes(targetStatus.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${ENQUIRY_STATUSES.join(', ')}`
      });
    }

    const newStatus = targetStatus.toUpperCase();
    const submission = await ContactSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found'
      });
    }

    const currentStatus = submission.status || 'ENQUIRED';

    // Disallow updating to the exact same status
    if (newStatus === currentStatus) {
      return res.status(400).json({
        success: false,
        message: `Enquiry is already in "${currentStatus}" status`
      });
    }

    // Validate transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions from "${currentStatus}" are: ${
          allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'None (Terminal status)'
        }`
      });
    }

    // Specific validation: ON SCHEDULING -> date and time required
    let parsedScheduledAt = null;
    if (newStatus === 'SCHEDULED') {
      if (!scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'Date and time are required when scheduling an enquiry'
        });
      }
      parsedScheduledAt = new Date(scheduledAt);
      if (isNaN(parsedScheduledAt.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date and time for scheduling'
        });
      }
    }

    // Specific validation: ON SELECTED / REJECTED -> feedback required
    if (newStatus === 'SELECTED' || newStatus === 'REJECTED') {
      if (!feedback || !feedback.trim()) {
        return res.status(400).json({
          success: false,
          message: `Feedback is required when marking an enquiry as ${newStatus}`
        });
      }
    }

    // Apply status and fields
    submission.status = newStatus;
    if (newStatus === 'SCHEDULED') {
      submission.scheduledAt = parsedScheduledAt;
      if (meetLink !== undefined) {
        submission.meetLink = meetLink ? meetLink.trim() : '';
      }
    }
    if (feedback && feedback.trim()) {
      submission.feedback = feedback.trim();
    }

    // Record history
    const historyItem = {
      status: newStatus,
      previousStatus: currentStatus,
      changedBy: req.user?._id || req.user?.id || null,
      changedByName: req.user?.name || req.user?.email || 'Admin',
      changedByEmail: req.user?.email || '',
      changedAt: new Date(),
      feedback: feedback ? feedback.trim() : '',
      notes: notes ? notes.trim() : '',
      scheduledAt: parsedScheduledAt,
      meetLink: meetLink ? meetLink.trim() : ''
    };

    if (!submission.statusHistory || submission.statusHistory.length === 0) {
      submission.statusHistory = [
        {
          status: currentStatus,
          previousStatus: null,
          changedByName: 'Candidate (Form Submission)',
          changedAt: submission.createdAt || new Date(),
          notes: submission.message || 'Initial contact enquiry'
        }
      ];
    }
    submission.statusHistory.push(historyItem);
    submission.markModified('statusHistory');

    await submission.save();

    logger.success(
      `[Contact] Status updated for ${submission.email}: ${currentStatus} -> ${newStatus} by ${historyItem.changedByName}`
    );

    res.status(200).json({
      success: true,
      message: `Enquiry status updated to ${newStatus} successfully`,
      data: submission
    });
  } catch (error) {
    logger.error(`[Contact Controller Error] updateEnquiryStatus: ${error.message}`);
    next(error);
  }
};

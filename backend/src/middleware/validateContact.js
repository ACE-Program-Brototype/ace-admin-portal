import { logger } from '../utils/logger.js';

/**
 * Validates and sanitizes contact form submissions:
 * - name: required, letters and standard name characters
 * - email: required, strictly validates email format
 * - phone: required, accepts numbers only (10 to 15 digits)
 * - isBrototypeStudent: required ('yes' or 'no')
 * - batchNumber: required only if isBrototypeStudent === 'yes'
 * - message: optional
 */
export const validateContactForm = (req, res, next) => {
  const errors = {};
  const body = req.body || {};

  // 1. Name validation
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  } else if (name.length > 70) {
    errors.name = 'Name cannot exceed 70 characters';
  } else if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    errors.name = 'Name can only contain letters, spaces, hyphens, and dots';
  }

  // 2. Email format validation
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email) {
    errors.email = 'Email address is required';
  } else if (email.length > 150) {
    errors.email = 'Email address is too long';
  } else if (!emailRegex.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  // 3. Phone validation (strictly numbers only)
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  if (!phone) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d+$/.test(phone)) {
    errors.phone = 'Phone number must contain numbers only';
  } else if (phone.length < 10 || phone.length > 15) {
    errors.phone = 'Phone number must be between 10 and 15 digits';
  }

  // 4. isBrototypeStudent validation ('yes' or 'no')
  let isBrototypeStudent = typeof body.isBrototypeStudent === 'string'
    ? body.isBrototypeStudent.trim().toLowerCase()
    : '';

  if (typeof body.isBrototypeStudent === 'boolean') {
    isBrototypeStudent = body.isBrototypeStudent ? 'yes' : 'no';
  }

  if (!isBrototypeStudent) {
    errors.isBrototypeStudent = 'Please specify whether you are a Brototype student';
  } else if (!['yes', 'no'].includes(isBrototypeStudent)) {
    errors.isBrototypeStudent = 'isBrototypeStudent must be either "yes" or "no"';
  }

  // 5. Conditional validation for Brototype students
  let batchNumber = '';

  if (isBrototypeStudent === 'yes') {
    batchNumber = typeof body.batchNumber === 'string' ? body.batchNumber.trim() : '';

    if (!batchNumber) {
      errors.batchNumber = 'Batch number is required for Brototype students';
    } else if (batchNumber.length < 2 || batchNumber.length > 30) {
      errors.batchNumber = 'Batch number must be between 2 and 30 characters';
    }
  }

  // 6. Message (OPTIONAL - not required)
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (message && message.length > 2000) {
    errors.message = 'Message cannot exceed 2000 characters';
  }

  // If validation errors exist, return 400 Bad Request
  if (Object.keys(errors).length > 0) {
    const firstErrorMessage = Object.values(errors)[0];
    logger.warn(`[Validation Failed] ${req.method} ${req.originalUrl} - ${firstErrorMessage}`, errors);

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors
    });
  }

  // Attach sanitized fields to req.body for downstream controller
  req.body.name = name;
  req.body.email = email;
  req.body.phone = phone;
  req.body.isBrototypeStudent = isBrototypeStudent;
  req.body.batchNumber = isBrototypeStudent === 'yes' ? batchNumber : '';
  req.body.message = message; // optional string, empty if not provided

  next();
};

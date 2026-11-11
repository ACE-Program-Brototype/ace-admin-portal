import { Router } from 'express';
import multer from 'multer';
import { validateContactForm } from '../middleware/validateContact.js';
import {
  submitContactForm,
  getContactSubmissions,
  getContactSubmissionById,
  updateEnquiryStatus
} from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const upload = multer();
const router = Router();

// GET /api/contact - List all submissions (Protected for Admin, supports pagination/filters/search)
router.get('/', protectAdmin, getContactSubmissions);

// GET /api/contact/:id - Get specific submission details (Protected for Admin)
router.get('/:id', protectAdmin, getContactSubmissionById);

// PATCH /api/contact/:id/status - Update enquiry lifecycle status & record audit history (Protected for Admin)
router.patch('/:id/status', protectAdmin, updateEnquiryStatus);

// POST /api/contact - Process multipart/FormData or JSON -> Validate input -> Submit & background forward
router.post('/', upload.none(), validateContactForm, submitContactForm);

export default router;

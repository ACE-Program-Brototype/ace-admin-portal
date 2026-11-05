import { Router } from 'express';
import multer from 'multer';
import { validateContactForm } from '../middleware/validateContact.js';
import { submitContactForm } from '../controllers/contactController.js';

const upload = multer();
const router = Router();

// Process multipart/FormData -> Validate input -> Submit & background forward
router.post('/', upload.none(), validateContactForm, submitContactForm);

export default router;

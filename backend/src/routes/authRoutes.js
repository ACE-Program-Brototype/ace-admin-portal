import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me (Protected route)
router.get('/me', protectAdmin, getMe);

export default router;

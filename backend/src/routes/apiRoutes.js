import { Router } from 'express';
import contactRoutes from './contactRoutes.js';
import authRoutes from './authRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes (POST /api/auth/login, GET /api/auth/me)
router.use('/auth', authRoutes);

// Contact form submission endpoint (POST /api/contact)
router.use('/contact', contactRoutes);
router.use('/contact-form', contactRoutes); // alias

export default router;

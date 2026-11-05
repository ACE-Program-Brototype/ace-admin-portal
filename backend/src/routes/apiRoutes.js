import { Router } from 'express';
import contactRoutes from './contactRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Contact form submission endpoint (POST /api/contact)
router.use('/contact', contactRoutes);
router.use('/contact-form', contactRoutes); // alias

export default router;

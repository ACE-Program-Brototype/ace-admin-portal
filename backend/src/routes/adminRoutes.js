import { Router } from 'express';
import { protectAdmin, requireSuperAdmin } from '../middleware/authMiddleware.js';
import {
  getAdmins,
  createAdmin,
  getAdminById,
  updateAdmin,
  toggleBlockAdmin,
  deleteAdmin
} from '../controllers/adminController.js';

const router = Router();

// Restrict all admin management routes to authenticated Super Admins
router.use(protectAdmin, requireSuperAdmin);

router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .get(getAdminById)
  .put(updateAdmin)
  .delete(deleteAdmin);

router.patch('/:id/toggle-block', toggleBlockAdmin);

export default router;


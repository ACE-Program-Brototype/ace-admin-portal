import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';

/**
 * Generates a signed JWT token for an admin user.
 */
const generateToken = (admin) => {
  const secret = process.env.JWT_SECRET || 'ace_admin_portal_default_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role
    },
    secret,
    { expiresIn }
  );
};

// @desc    Admin login with email & password
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query admin including hidden password field
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      logger.warn(`[Auth] Failed login attempt for non-existent email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      logger.warn(`[Auth] Failed login attempt (invalid password) for email: ${normalizedEmail}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT
    const token = generateToken(admin);

    logger.success(`[Auth] Admin login successful for email: ${normalizedEmail}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated admin user
// @route   GET /api/auth/me
// @access  Private (Requires Admin JWT)
export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

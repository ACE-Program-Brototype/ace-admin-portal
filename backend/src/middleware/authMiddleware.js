import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';

/**
 * Middleware to protect routes and verify admin JWT token.
 */
export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'ace_admin_portal_default_secret_key';
    const decoded = jwt.verify(token, secret);

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token: Admin account does not exist.'
      });
    }

    req.user = admin;
    next();
  } catch (error) {
    logger.warn(`[Auth Middleware] Token verification failed: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

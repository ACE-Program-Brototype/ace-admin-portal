import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { logger } from '../utils/logger.js';

// @desc    Get all organizational admins (Server-side pagination, search, sort, excluding Super Admin)
// @route   GET /api/admins
// @access  Private (Super Admin only)
export const getAdmins = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Exclude Super Admin from listing
    const rootAdminEmail = (process.env.ADMIN_EMAIL || 'admin@ace.com').toLowerCase().trim();
    const query = {
      isSuperAdmin: { $ne: true },
      email: { $ne: rootAdminEmail }
    };

    // Keyword search across name, email, phone, and role
    if (req.query.search && req.query.search.trim()) {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { role: searchRegex }
      ];
    }

    // Server-side sorting
    let sort = req.query.sort || '-createdAt';
    const allowedSortFields = [
      'createdAt', '-createdAt',
      'name', '-name',
      'email', '-email',
      'role', '-role'
    ];
    if (!allowedSortFields.includes(sort)) {
      sort = '-createdAt';
    }

    const [total, admins] = await Promise.all([
      Admin.countDocuments(query),
      Admin.find(query)
        .select('-password')
        .sort(sort)
        .skip(skip)
        .limit(limit)
    ]);

    const pages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      count: admins.length,
      total,
      page,
      pages,
      data: admins
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] getAdmins: ${error.message}`);
    next(error);
  }
};

// Password validation criteria:
// - At least 8 characters
// - At least one number
// - At least one lowercase letter
// - At least one uppercase letter
// - At least one special character
// - No empty spaces
export const validateAdminPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (/\s/.test(password)) {
    return { isValid: false, message: 'Password must not contain any spaces' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[^a-zA-Z0-9\s]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true };
};

// @desc    Create a new organizational administrator (Standard Access Control)
// @route   POST /api/admins
// @access  Private (Super Admin only)
export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // 1. Input validations
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const passwordValidation = validateAdminPassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    // Role is an internal organization role (e.g. "Community Manager", "Operations Lead")
    const assignedRole = (typeof role === 'string' && role.trim()) ? role.trim() : 'Admin';

    // 2. Uniqueness check
    const existingAdmin = await Admin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(409).json({
        success: false,
        message: `An administrator with email "${normalizedEmail}" already exists`
      });
    }

    // 3. Clean phone number
    const cleanedPhone = phone ? phone.trim() : '';

    // 4. Hash password with bcrypt
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create Admin with hashed password, standard access control and unblocked status
    const newAdmin = await Admin.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: cleanedPhone,
      role: assignedRole,
      isSuperAdmin: false,
      isBlocked: false
    });

    logger.success(`[Admin Controller] Created admin: ${normalizedEmail} (Role: ${assignedRole}, ID: ${newAdmin._id})`);

    res.status(201).json({
      success: true,
      message: 'Administrator created successfully',
      data: {
        id: newAdmin._id,
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
        role: newAdmin.role,
        isSuperAdmin: false,
        isBlocked: false,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] createAdmin: ${error.message}`);
    next(error);
  }
};

// @desc    Get single administrator details by ID
// @route   GET /api/admins/:id
// @access  Private (Super Admin only)
export const getAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid administrator ID format'
      });
    }

    const admin = await Admin.findById(id).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] getAdminById: ${error.message}`);
    next(error);
  }
};

// @desc    Update administrator details (including optional password update and block status)
// @route   PUT /api/admins/:id
// @access  Private (Super Admin only)
export const updateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, password, isBlocked } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid administrator ID format'
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    // Safety: Super admin cannot block their own account
    if (req.user.id.toString() === id && isBlocked === true) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own administrator account.'
      });
    }

    if (name && name.trim()) {
      admin.name = name.trim();
    }

    if (email && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== admin.email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(normalizedEmail)) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address'
          });
        }
        const duplicate = await Admin.findOne({ email: normalizedEmail, _id: { $ne: id } });
        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: `Email "${normalizedEmail}" is already in use by another account`
          });
        }
        admin.email = normalizedEmail;
      }
    }

    if (phone !== undefined) {
      admin.phone = phone.trim();
    }

    if (role && typeof role === 'string' && role.trim()) {
      admin.role = role.trim();
    }

    if (password && typeof password === 'string' && password.trim()) {
      const passwordValidation = validateAdminPassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
      }
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10) || 10;
      const salt = await bcrypt.genSalt(saltRounds);
      admin.password = await bcrypt.hash(password, salt);
    }

    if (isBlocked !== undefined && typeof isBlocked === 'boolean') {
      admin.isBlocked = isBlocked;
    }

    await admin.save();

    logger.success(`[Admin Controller] Updated admin: ${admin.email} (ID: ${admin._id})`);

    res.status(200).json({
      success: true,
      message: 'Administrator updated successfully',
      data: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isSuperAdmin: !!admin.isSuperAdmin,
        isBlocked: !!admin.isBlocked,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] updateAdmin: ${error.message}`);
    next(error);
  }
};

// @desc    Toggle block status of an administrator
// @route   PATCH /api/admins/:id/toggle-block
// @access  Private (Super Admin only)
export const toggleBlockAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid administrator ID format'
      });
    }

    // Safety: Super admin cannot block own account
    if (req.user.id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own administrator account.'
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    // Disallow blocking the root system administrator
    const rootAdminEmail = (process.env.ADMIN_EMAIL || 'admin@ace.com').toLowerCase().trim();
    if (admin.email.toLowerCase() === rootAdminEmail || admin.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'The root system administrator cannot be blocked.'
      });
    }

    // Toggle or set explicitly from body if provided
    if (req.body && typeof req.body.isBlocked === 'boolean') {
      admin.isBlocked = req.body.isBlocked;
    } else {
      admin.isBlocked = !admin.isBlocked;
    }

    await admin.save();

    const actionText = admin.isBlocked ? 'blocked' : 'unblocked';
    logger.info(`[Admin Controller] Admin "${admin.email}" has been ${actionText} by Super Admin ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Administrator "${admin.name}" has been ${actionText} successfully.`,
      data: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isBlocked: admin.isBlocked
      }
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] toggleBlockAdmin: ${error.message}`);
    next(error);
  }
};

// @desc    Delete an administrator permanently
// @route   DELETE /api/admins/:id
// @access  Private (Super Admin only)
export const deleteAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid administrator ID format'
      });
    }

    // Safety: Super admin cannot delete own account
    if (req.user.id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own administrator account.'
      });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator not found'
      });
    }

    // Disallow deleting the root system administrator
    const rootAdminEmail = (process.env.ADMIN_EMAIL || 'admin@ace.com').toLowerCase().trim();
    if (admin.email.toLowerCase() === rootAdminEmail || admin.isSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'The root system administrator cannot be deleted.'
      });
    }

    await Admin.deleteOne({ _id: id });

    logger.info(`[Admin Controller] Admin "${admin.email}" deleted by Super Admin ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Administrator "${admin.name}" deleted successfully.`
    });
  } catch (error) {
    logger.error(`[Admin Controller Error] deleteAdmin: ${error.message}`);
    next(error);
  }
};

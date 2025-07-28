// backend/src/routes/userRoutes.js
import express from 'express';
import { body, param } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js'; // Middleware autentikasi & otorisasi

const router = express.Router();

// Validasi untuk update profil
const updateProfileValidationRules = [
  body('name').optional().trim().escape(),
  body('email').optional().isEmail().withMessage('Please include a valid email.').normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long if provided.'),
  // Tambahkan validasi untuk field lain jika ada
];

// Validasi parameter ID
const idParamValidationRule = param('id').isMongoId().withMessage('Invalid user ID format.');

// --- Rute untuk Profil Pengguna (yang sedang login) ---
// @route   GET /api/users/profile/me
// @desc    Get logged in user profile
// @access  Private
router.get('/profile/me', protect, (req, res, next) => {
    // Mengarahkan ke getUserProfile dengan ID dari token
    req.params.id = req.user.id;
    return getUserProfile(req, res, next);
});

// @route   PUT /api/users/profile/me
// @desc    Update logged in user profile
// @access  Private
router.put('/profile/me', protect, updateProfileValidationRules, (req, res, next) => {
    // Mengarahkan ke updateUserProfile dengan ID dari token
    req.params.id = req.user.id;
    return updateUserProfile(req, res, next);
});


// --- Rute untuk Manajemen Pengguna oleh Admin ---

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize(['admin']), getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user profile by ID (Admin or owner)
// @access  Private
router.get('/:id', protect, idParamValidationRule, getUserProfile); // Otorisasi lebih detail di controller

// @route   PUT /api/users/:id
// @desc    Update user profile by ID (Admin or owner)
// @access  Private
router.put('/:id', protect, idParamValidationRule, updateProfileValidationRules, updateUserProfile); // Otorisasi lebih detail di controller

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize(['admin']), idParamValidationRule, deleteUser);

export default router;
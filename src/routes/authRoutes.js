// backend/src/routes/authRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js'; // Middleware untuk melindungi rute getMe

const router = express.Router();

// Validasi untuk registrasi
const registerValidationRules = [
  body('name').notEmpty().withMessage('Name is required.').trim().escape(),
  body('email').isEmail().withMessage('Please include a valid email.').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

// Validasi untuk login
const loginValidationRules = [
  body('email').isEmail().withMessage('Please include a valid email.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.'),
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidationRules, registerUser);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginValidationRules, loginUser);

// @route   GET /api/auth/me
// @desc    Get current logged in user's profile
// @access  Private
router.get('/me', protect, getMe);


export default router;
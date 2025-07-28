// backend/src/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { validationResult } from 'express-validator';

// Fungsi untuk generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiration || '1h',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      const error = new Error('User with this email already exists.');
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.create({
      name,
      email,
      password, // Password akan di-hash oleh pre-save hook di model User
    });

    if (user) {
      // Tidak mengirim password kembali, bahkan yang di-hash
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };
      res.status(201).json({
        message: 'User registered successfully.',
        data: userResponse,
        token: generateToken(user._id, user.role),
      });
    } else {
      const error = new Error('Invalid user data. Registration failed.');
      error.statusCode = 400;
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password'); // Pilih password untuk perbandingan

    if (user && (await user.matchPassword(password))) {
      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      res.json({
        message: 'Login successful.',
        data: userResponse,
        token: generateToken(user._id, user.role),
      });
    } else {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401; // Unauthorized
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile (jika menggunakan token)
 * @route   GET /api/auth/me
 * @access  Private (memerlukan token)
 */
export const getMe = async (req, res, next) => {
    // req.user akan di-set oleh middleware authMiddleware
    if (!req.user) {
        const error = new Error('Not authorized, no token found or token invalid.');
        error.statusCode = 401;
        return next(error);
    }
  try {
    // Ambil user dari database berdasarkan ID di token, tanpa password
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
        message: "User profile fetched successfully.",
        data: user
    });
  } catch (error) {
    next(error);
  }
};
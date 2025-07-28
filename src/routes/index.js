// backend/src/routes/index.js
import express from 'express';
import emotionRoutes from './emotionRoutes.js';
import authRoutes from './authRoutes.js'; // Impor rute auth
import userRoutes from './userRoutes.js'; // Impor rute user

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'E-MOTION API is healthy and running!',
    timestamp: new Date().toISOString(),
  });
});

// Rute untuk autentikasi
router.use('/auth', authRoutes);

// Rute untuk pengguna
router.use('/users', userRoutes);

// Rute untuk emosi
router.use('/emotions', emotionRoutes);

export default router;
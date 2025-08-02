// backend/src/routes/index.js
const express = require('express');
const emotionRoutes = require('./emotionRoutes.js'); // Impor rute emosi
const authRoutes = require('./authRoutes.js'); // Impor rute autentikasi
const userRoutes = require('./userRoutes.js'); // Impor rute pengguna

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


module.exports = router;
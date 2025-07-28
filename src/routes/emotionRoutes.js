// backend/src/routes/emotionRoutes.js
import express from 'express';
import { body, param } from 'express-validator';
import {
  logEmotionDetection,
  getAllEmotionLogs,
  getEmotionLogById,
  updateEmotionLogFeedback,
} from '../controllers/emotionController.js';
// import apiKeyAuth from '../middlewares/apiKeyAuth.js'; // Bisa tetap digunakan jika ada endpoint khusus API key
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Validasi untuk logEmotionDetection
const logEmotionValidationRules = [
  body('detectedEmotion').notEmpty().withMessage('Detected emotion is required.').isString().trim(),
  body('confidence').optional({ checkFalsy: true }).isFloat({ min: 0, max: 1 }).withMessage('Confidence must be a number between 0 and 1.'),
  body('audioFileUri').optional({ checkFalsy: true }).isURL().withMessage('Audio file URI must be a valid URL.'), // Atau isString() jika path lokal
  body('feedback').optional().isIn(['accurate', 'inaccurate', 'neutral', 'not_provided']).withMessage('Invalid feedback value.'),
  body('notes').optional({ checkFalsy: true }).isString().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
  body('modelVersi').optional({ checkFalsy: true }).isString().trim(),
  body('perangkatInfo').optional({ checkFalsy: true }).isString().trim(),
  body('bahasaInput').optional({ checkFalsy: true }).isString().trim().isLength({ min: 2, max: 10 }),
  // userId akan diambil dari token, jadi tidak perlu divalidasi di body kecuali untuk kasus anonymous_api_key_user
  body('userId').optional({ checkFalsy: true }).isString().trim(),
];

// Validasi untuk updateEmotionLogFeedback
const updateFeedbackValidationRules = [
  body('feedback').optional().isIn(['accurate', 'inaccurate', 'neutral', 'not_provided']).withMessage('Invalid feedback value.'),
  body('notes').optional({ checkFalsy: true }).isString().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
];

// Validasi parameter ID
const idParamValidationRule = param('id').isMongoId().withMessage('Invalid log ID format.');


// --- Rute untuk Log Emosi ---

// POST /api/emotions/log - Menyimpan log deteksi emosi baru
// Endpoint ini sekarang dilindungi, pengguna harus login.
// Jika ingin mengizinkan log anonim melalui API key, perlu logika tambahan atau endpoint berbeda.
router.post('/log', protect, logEmotionValidationRules, logEmotionDetection);

// GET /api/emotions/logs - Mendapatkan semua log emosi (dengan paginasi)
// Dilindungi, dan otorisasi (admin atau pemilik) ada di controller.
router.get('/logs', protect, getAllEmotionLogs);

// GET /api/emotions/logs/:id - Mendapatkan detail satu log emosi
// Dilindungi, dan otorisasi (admin atau pemilik) ada di controller.
router.get('/logs/:id', protect, idParamValidationRule, getEmotionLogById);

// PATCH /api/emotions/logs/:id/feedback - Memperbarui feedback pengguna pada log
// Dilindungi, dan otorisasi (admin atau pemilik) ada di controller.
router.patch('/logs/:id/feedback', protect, idParamValidationRule, updateFeedbackValidationRules, updateEmotionLogFeedback);


export default router;
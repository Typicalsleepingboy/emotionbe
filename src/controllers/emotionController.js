// backend/src/controllers/emotionController.js
import EmotionLog from '../models/EmotionLog.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Log a new emotion detection entry
 * @route   POST /api/emotions/log
 * @access  Private (memerlukan token pengguna atau API Key)
 */
export const logEmotionDetection = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      // userId, // Dihapus karena akan diambil dari req.user jika ada
      detectedEmotion,
      confidence,
      audioFileUri,
      feedback,
      notes,
      modelVersi,
      perangkatInfo,
      bahasaInput,
    } = req.body;

    // Ambil userId dari pengguna yang terautentikasi jika ada
    const userIdFromAuth = req.user ? req.user.id : (req.body.userId || 'anonymous_api_key_user');

    const newLog = new EmotionLog({
      userId: userIdFromAuth,
      detectedEmotion,
      confidence,
      audioFileUri,
      feedback,
      notes,
      modelVersi,
      perangkatInfo,
      bahasaInput,
    });

    const savedLog = await newLog.save();
    res.status(201).json({
      message: 'Emotion detection logged successfully.',
      data: savedLog,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: 'Validation Error',
        errors: messages,
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all emotion logs (dengan paginasi)
 * @route   GET /api/emotions/logs
 * @access  Private (Admin atau pemilik data)
 */
export const getAllEmotionLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    // Jika bukan admin, hanya tampilkan log milik pengguna yang login
    if (req.user && req.user.role !== 'admin') {
      filter.userId = req.user.id;
    } else if (req.query.userId) {
      // Jika admin dan ada query userId, filter berdasarkan itu
      filter.userId = req.query.userId;
    }


    const logs = await EmotionLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalLogs = await EmotionLog.countDocuments(filter);
    const totalPages = Math.ceil(totalLogs / limit);

    res.status(200).json({
      message: 'Emotion logs retrieved successfully.',
      data: logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single emotion log by ID
 * @route   GET /api/emotions/logs/:id
 * @access  Private (Admin atau pemilik log)
 */
export const getEmotionLogById = async (req, res, next) => {
  try {
    const log = await EmotionLog.findById(req.params.id);

    if (!log) {
      const error = new Error('Emotion log not found.');
      error.statusCode = 404;
      return next(error);
    }

    // Periksa kepemilikan jika bukan admin
    if (req.user && req.user.role !== 'admin' && log.userId.toString() !== req.user.id) {
      const error = new Error('Not authorized to view this log.');
      error.statusCode = 403;
      return next(error);
    }

    res.status(200).json({
      message: 'Emotion log retrieved successfully.',
      data: log,
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        const customError = new Error('Invalid log ID format.');
        customError.statusCode = 400;
        return next(customError);
      }
    next(error);
  }
};

/**
 * @desc    Update user feedback on an emotion log
 * @route   PATCH /api/emotions/logs/:id/feedback
 * @access  Private (pemilik log atau admin)
 */
export const updateEmotionLogFeedback = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { feedback, notes } = req.body;
    const logId = req.params.id;

    const log = await EmotionLog.findById(logId);

    if (!log) {
      const error = new Error('Emotion log not found.');
      error.statusCode = 404;
      return next(error);
    }

    // Periksa apakah pengguna yang terautentikasi berhak mengubah feedback ini
    if (req.user && log.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      const error = new Error('Not authorized to update this log.');
      error.statusCode = 403;
      return next(error);
    }

    if (feedback) {
      log.feedback = feedback;
    }
    if (notes !== undefined) {
      log.notes = notes;
    }

    const updatedLog = await log.save();

    res.status(200).json({
      message: 'Emotion log feedback updated successfully.',
      data: updatedLog,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        message: 'Validation Error for feedback/notes',
        errors: messages,
      });
    }
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        const customError = new Error('Invalid log ID format.');
        customError.statusCode = 400;
        return next(customError);
      }
    next(error);
  }
};
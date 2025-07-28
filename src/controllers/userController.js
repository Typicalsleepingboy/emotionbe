// backend/src/controllers/userController.js
import User from '../models/User.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile/:id  (atau /api/users/profile/me jika untuk user yang login)
 * @access  Private (atau Public jika profil publik)
 */
export const getUserProfile = async (req, res, next) => {
  try {
    // Jika :id adalah 'me', gunakan req.user.id dari token
    const userId = req.params.id === 'me' && req.user ? req.user.id : req.params.id;

    const user = await User.findById(userId).select('-password'); // Jangan kirim password

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      return next(error);
    }

    // Cek otorisasi jika perlu (misalnya, user hanya bisa lihat profil sendiri kecuali admin)
    // if (req.user && req.user.id !== user._id.toString() && req.user.role !== 'admin') {
    //   const error = new Error('Not authorized to view this profile.');
    //   error.statusCode = 403;
    //   return next(error);
    // }

    res.status(200).json({
      message: 'User profile retrieved successfully.',
      data: user,
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        const customError = new Error('Invalid user ID format.');
        customError.statusCode = 400;
        return next(customError);
      }
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile/:id (atau /api/users/profile/me)
 * @access  Private (hanya pemilik profil)
 */
export const updateUserProfile = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userIdToUpdate = req.params.id === 'me' && req.user ? req.user.id : req.params.id;

    // Pastikan pengguna yang login adalah pemilik profil yang akan diupdate, atau admin
    if (req.user && req.user.id !== userIdToUpdate && req.user.role !== 'admin') {
        const error = new Error('Not authorized to update this profile.');
        error.statusCode = 403;
        return next(error);
    }

    const user = await User.findById(userIdToUpdate);

    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      return next(error);
    }

    // Update field yang diizinkan
    const { name, email /* , other fields */ } = req.body;

    if (name) user.name = name;

    // Hati-hati saat mengizinkan update email, pastikan tidak duplikat
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        const error = new Error('Email is already in use by another account.');
        error.statusCode = 400;
        return next(error);
      }
      user.email = email.toLowerCase();
    }

    // Jika ada field password dalam request body, hash dan update
    if (req.body.password) {
        if (req.body.password.length < 6) {
            const error = new Error('Password must be at least 6 characters long.');
            error.statusCode = 400;
            return next(error);
        }
        user.password = req.body.password; // pre-save hook akan hash ini
    }

    const updatedUser = await user.save();

    // Kirim respons tanpa password
    const userResponse = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt
    };

    res.status(200).json({
      message: 'User profile updated successfully.',
      data: userResponse,
    });
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        const customError = new Error('Invalid user ID format.');
        customError.statusCode = 400;
        return next(customError);
      }
    next(error);
  }
};

// --- Operasi CRUD untuk Admin (Contoh) ---

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/users
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find({}).select('-password').skip(skip).limit(limit);
        const totalUsers = await User.countDocuments({});
        const totalPages = Math.ceil(totalUsers / limit);

        res.status(200).json({
            message: "Users retrieved successfully.",
            data: users,
            pagination: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/users/:id
 * @access  Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            return next(error);
        }

        // Tambahan: Admin tidak boleh menghapus dirinya sendiri melalui endpoint ini (opsional)
        // if (req.user && req.user.id === user._id.toString()) {
        //     const error = new Error('Admins cannot delete their own account through this endpoint.');
        //     error.statusCode = 400;
        //     return next(error);
        // }

        // Hapus juga log emosi yang terkait dengan pengguna ini (jika diperlukan)
        // await EmotionLog.deleteMany({ userId: user._id });

        await User.deleteOne({ _id: user._id }); // Atau user.remove() yang sudah deprecated

        res.status(200).json({ message: 'User removed successfully.' });
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            const customError = new Error('Invalid user ID format.');
            customError.statusCode = 400;
            return next(customError);
          }
        next(error);
    }
};
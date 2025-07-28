// backend/src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);

      // Tambahkan objek user ke request (tanpa password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        const error = new Error('Not authorized, user not found for this token.');
        error.statusCode = 401;
        return next(error);
      }
      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      const authError = new Error('Not authorized, token failed.');
      authError.statusCode = 401;
      return next(authError);
    }
  }

  if (!token) {
    const error = new Error('Not authorized, no token provided.');
    error.statusCode = 401;
    return next(error);
  }
};

// Middleware untuk otorisasi berdasarkan peran
export const authorize = (roles = []) => {
  // roles bisa berupa string tunggal (misalnya 'admin') atau array string (misalnya ['admin', 'editor'])
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('Not authorized, user not available for role check.');
      error.statusCode = 401;
      return next(error);
    }
    if (roles.length && !roles.includes(req.user.role)) {
      const error = new Error(
        `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}.`
      );
      error.statusCode = 403; // Forbidden
      return next(error);
    }
    next();
  };
};
// backend/src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address.',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
      select: false, // Agar password tidak ikut terkirim secara default saat query
    },
    // Tambahkan field lain jika perlu, misalnya:
    // dateOfBirth: Date,
    // gender: { type: String, enum: ['male', 'female', 'other'] },
    // profilePictureUrl: String,
    role: {
      type: String,
      enum: ['user', 'admin'], // Contoh peran
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware untuk hash password sebelum disimpan
UserSchema.pre('save', async function (next) {
  // Hanya hash password jika field password dimodifikasi (atau baru)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method untuk membandingkan password yang dimasukkan dengan password di database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
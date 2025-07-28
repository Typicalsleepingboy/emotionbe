// backend/src/models/EmotionLog.js
import mongoose from 'mongoose';

const EmotionLogSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Atau: mongoose.Schema.Types.ObjectId, ref: 'User' // Jika ada model User
      // required: true, // Aktifkan jika pengguna harus login untuk log
      index: true, // Indeks jika sering dicari berdasarkan userId
    },
    detectedEmotion: {
      type: String,
      required: [true, 'Detected emotion is a required field.'],
      trim: true,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be less than 0.'],
      max: [1, 'Confidence cannot be greater than 1.'],
    },
    audioFileUri: { // URI atau path ke file audio yang diproses (bisa internal atau eksternal)
      type: String,
      trim: true,
    },
    feedback: { // Feedback dari pengguna mengenai akurasi deteksi
      type: String,
      enum: {
        values: ['accurate', 'inaccurate', 'neutral', 'not_provided'],
        message: '{VALUE} is not a supported feedback type.',
      },
      default: 'not_provided',
    },
    notes: { // Catatan tambahan dari pengguna
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters.'],
    },
    modelVersi: { // Versi model ML yang digunakan untuk deteksi
      type: String,
      trim: true,
    },
    perangkatInfo: { // Informasi perangkat pengguna (misalnya, OS, versi aplikasi)
      type: String,
      trim: true,
    },
    bahasaInput: { // Bahasa dari audio yang dianalisis
      type: String,
      default: 'id', // Default ke Bahasa Indonesia
      trim: true,
    },
    // Anda bisa menambahkan field lain yang relevan, seperti:
    // inputFeaturesChecksum: String, // Untuk melacak uniknya input audio
    // processingDurationMs: Number, // Durasi pemrosesan di client
  },
  {
    timestamps: true, // Otomatis membuat createdAt dan updatedAt
    toJSON: { virtuals: true }, // Untuk menyertakan virtuals saat diubah ke JSON
    toObject: { virtuals: true },
  }
);

// Contoh Virtual (jika diperlukan)
// EmotionLogSchema.virtual('userFriendlyDate').get(function() {
//   return this.createdAt.toLocaleDateString('id-ID', {
//     year: 'numeric', month: 'long', day: 'numeric',
//   });
// });

const EmotionLog = mongoose.model('EmotionLog', EmotionLogSchema);

export default EmotionLog;
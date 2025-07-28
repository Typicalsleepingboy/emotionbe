// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/database.js';
import mainRouter from './routes/index.js';
import globalErrorHandler from './middlewares/errorHandler.js'; // Menggunakan nama yang lebih deskriptif
import config from './config/index.js'; // Untuk mengakses variabel lingkungan

const app = express();

// Koneksi ke Database
connectDB();

// Middleware Keamanan Dasar
app.use(helmet()); // Setel header HTTP yang aman (harus di awal)
app.use(cors({
  origin: '*', // Ganti dengan domain frontend Anda di produksi, misalnya: ['http://localhost:8081', 'https://your-app-domain.com']
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Middleware Parsing
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies

// HTTP request logger middleware (morgan)
if (config.nodeEnv === 'development' || process.env.NODE_ENV === 'development') { // Periksa kedua cara
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // Format logging yang lebih detail untuk produksi
}

// Rute API Utama
app.use('/api', mainRouter);

// Middleware untuk menangani rute tidak ditemukan (404)
app.use((req, res, next) => {
  const error = new Error(`Resource not found at ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler (harus menjadi middleware terakhir yang didefinisikan)
app.use(globalErrorHandler);

export default app;
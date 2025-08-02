// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/database.js';
import mainRouter from './src/routes/index.js';
import globalErrorHandler from './src/middlewares/errorHandler.js';
import config from './src/config/index.js';

const app = express();

// Koneksi ke Database
connectDB();

// Middleware Keamanan
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Middleware Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger HTTP
if (config.nodeEnv === 'development' || process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Routing Utama
app.use('/api', mainRouter);

// Handler 404
app.use((req, res, next) => {
  const error = new Error(`Resource not found at ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Handler Global Error
app.use(globalErrorHandler);

// ✅ Export default app untuk Vercel
export default app;

// ✅ Jalankan server jika di lokal
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`MongoDB: ${config.mongodbUri ? 'OK' : 'NOT LOADED'}`);
  });
}

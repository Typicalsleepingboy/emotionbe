import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './src/config/database.js';
import mainRouter from './src/routes/index.js';
import globalErrorHandler from './src/middlewares/errorHandler.js';
import config from './src/config/config.js';

const app = express();

// Koneksi ke database
connectDB();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routing
app.use('/api', mainRouter);

// 404 handler
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handler
app.use(globalErrorHandler);

// ✅ Export untuk Vercel
export default app;

// ✅ Untuk lokal (opsional)
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

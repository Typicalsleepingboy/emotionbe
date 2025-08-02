const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/database.js'); // Pastikan path ini sesuai dengan struktur proyek Anda
const mainRouter = require('./src/routes/index.js'); // Pastikan path ini sesuai dengan struktur proyek Anda
const globalErrorHandler = require('./src/middlewares/errorHandler.js'); // Pastikan path ini sesuai dengan struktur proyek Anda
const config = require('./src/config/config.js'); // Pastikan path ini sesuai dengan struktur proyek Anda

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
module.exports = app;

// ✅ Untuk lokal (opsional)
if (process.env.NODE_ENV !== 'production') {
  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

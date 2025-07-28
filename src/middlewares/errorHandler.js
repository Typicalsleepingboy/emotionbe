// backend/src/middlewares/errorHandler.js
import config from '../config/index.js';

const globalErrorHandler = (err, req, res, next) => {
  // Log error, misalnya ke console atau service logging eksternal
  console.error('-------------------- ERROR START --------------------');
  console.error(`Timestamp: ${new Date().toISOString()}`);
  console.error(`Route: ${req.method} ${req.originalUrl}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.error('Request Body:', JSON.stringify(req.body, null, 2)); // Hati-hati dengan data sensitif
  }
  console.error(`Error Message: ${err.message}`);
  console.error(`Error Status Code: ${err.statusCode || 500}`);
  if (config.nodeEnv === 'development') {
    console.error('Error Stack:', err.stack);
  }
  console.error('--------------------- ERROR END ---------------------');


  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Hanya kirim detail error stack ke client jika dalam mode development
  const errorResponse = {
    status: 'error',
    statusCode,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
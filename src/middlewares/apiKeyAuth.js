// backend/src/middlewares/apiKeyAuth.js
import config from '../config/index.js';

const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    const error = new Error('API Key is missing from headers.');
    error.statusCode = 401; // Unauthorized
    return next(error);
  }

  if (apiKey !== config.apiKeySecret) {
    const error = new Error('Invalid API Key.');
    error.statusCode = 403; // Forbidden
    return next(error);
  }

  // Jika API Key valid, lanjutkan ke handler berikutnya
  next();
};

export default apiKeyAuth;
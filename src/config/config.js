// backend/src/config/index.js
const dotenv = require('dotenv'); // Import dotenv untuk mengelola variabel lingkungan
dotenv.config();

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  apiKeySecret: process.env.API_KEY_SECRET,
  jwtExpiration: process.env.JWT_EXPIRATION || '1h',
};

const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'API_KEY_SECRET'];
// Perbaikan pada logika pengecekan variabel
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`FATAL ERROR: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please ensure they are defined in your .env file in the backend directory or system environment.');
  console.error(`Current MONGODB_URI: ${process.env.MONGODB_URI}`);
  console.error(`Current JWT_SECRET: ${process.env.JWT_SECRET}`);
  console.error(`Current API_KEY_SECRET: ${process.env.API_KEY_SECRET}`);
  process.exit(1);
}

module.exports = config;
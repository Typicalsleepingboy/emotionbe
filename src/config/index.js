// backend/src/config/index.js
import dotenv from 'dotenv';
import path from 'path'; // Untuk path yang lebih robust jika diperlukan
import { fileURLToPath } from 'url'; // Untuk path yang lebih robust jika diperlukan

// Cara standar dan paling umum: dotenv akan mencari .env di direktori kerja saat ini.
// Jika server.js dijalankan dari direktori 'backend/', maka ia akan mencari 'backend/.env'.
dotenv.config();

// // Alternatif: Jika Anda ingin lebih eksplisit dan file .env ada di root project (satu level di atas backend)
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // Sesuaikan jika .env ada di root project utama

// // Alternatif lain: Jika .env benar-benar ada di root DARI DIREKTORI BACKEND
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Ini yang Anda miliki sebelumnya, pastikan .env ada di D:\KERJA\Bantu Teman\E-MOTION\.env

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

export default config;
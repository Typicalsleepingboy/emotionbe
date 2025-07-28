// backend/src/config/database.js
import mongoose from 'mongoose';
import config from './index.js';

const connectDB = async () => {
  if (!config.mongodbUri) {
    console.error('MongoDB URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(config.mongodbUri); // useNewUrlParser, useUnifiedTopology, etc., tidak lagi diperlukan di Mongoose v6+
    console.log('MongoDB Connected successfully.');

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected.');
    });

  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.error('Attempting to exit application...');
    process.exit(1); // Keluar dari proses dengan kegagalan
  }
};

export default connectDB;
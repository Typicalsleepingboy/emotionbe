import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Disable authentication mechanisms yang butuh saslprep
    const options = {
      authSource: 'admin',
      // Hapus atau comment authMechanism
      // authMechanism: 'SCRAM-SHA-256'
    };
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
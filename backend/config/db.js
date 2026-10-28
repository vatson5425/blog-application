const mongoose = require('mongoose');

/**
 * Connect to MongoDB instance using Mongoose
 * Strictly validates MONGODB_URI and halts process if connection fails
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: MONGODB_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    // Listen for runtime connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB Runtime Error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Connection Lost. Reconnecting...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected Successfully.');
    });
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Terminate process with failure so server does not run without a database
    process.exit(1);
  }
};

module.exports = connectDB;

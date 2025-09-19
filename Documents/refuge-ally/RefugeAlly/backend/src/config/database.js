const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/refugee-health';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info('📦 MongoDB connected successfully');
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('📦 MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('📦 MongoDB error:', error.message);
});

module.exports = { connectDatabase };

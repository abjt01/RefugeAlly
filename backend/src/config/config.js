require('dotenv').config();

const config = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/refugeally',
  geminiApiKey: process.env.GEMINI_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
if (!config.geminiApiKey) {
  console.error('❌ GEMINI_API_KEY environment variable is required');
  console.error('💡 Get your API key from: https://aistudio.google.com/app/apikey');
}

module.exports = config;

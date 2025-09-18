require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/refugee-health',
  geminiApiKey: process.env.GEMINI_API_KEY || 'AIzaSyDavUxT1qgrybXOsrcF-q6Yq_MCBmJxnjc',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Triage thresholds
  triageThresholds: {
    high: ['difficulty breathing', 'severe chest pain', 'high fever', 'severe headache', 'blood'],
    medium: ['persistent cough', 'moderate fever', 'fatigue', 'body ache'],
    low: ['mild cough', 'slight headache', 'runny nose']
  },
  
  // Supported languages
  supportedLanguages: ['en', 'ar', 'dari']
};

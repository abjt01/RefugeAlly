require('dotenv').config();
const app = require('./src/app');
const { connectDatabase } = require('./src/config/database');
const geminiService = require('./src/services/geminiService');

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Test Gemini connection
    console.log('🧪 Testing Gemini API connection...');
    const geminiWorking = await geminiService.testConnection();
    
    if (geminiWorking) {
      console.log('✅ Gemini API is working correctly');
    } else {
      console.log('⚠️  Gemini API not working - will use fallback responses');
    }
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 RefugeAlly Server running on port ${PORT}`);
      console.log(`📱 Frontend URL: http://localhost:3000`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🔑 Gemini API: ${geminiWorking ? 'Connected ✅' : 'Disconnected ⚠️'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

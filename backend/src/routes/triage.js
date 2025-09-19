const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');
const rateLimit = require('express-rate-limit');

const triageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests' }
});

// Main triage endpoint (includes ML + Loom integration)
router.post('/', triageRateLimit, triageController.submitTriage.bind(triageController));

// Mental health endpoints
router.post('/mental-health/chat', triageController.mentalHealthChat.bind(triageController));
router.post('/mental-health/mood', triageController.logMood.bind(triageController));

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'RefugeAlly Complete Triage Service',
    status: 'OK',
    features: [
      'AI Health Consultation (Gemini)',
      'ML Outbreak Detection',
      'Mental Health Support (Loom)',
      'Doctor Video Calls',
      'NGO Integration'
    ],
    endpoints: {
      triage: 'POST /api/triage',
      mentalHealthChat: 'POST /api/triage/mental-health/chat',
      moodLogging: 'POST /api/triage/mental-health/mood'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

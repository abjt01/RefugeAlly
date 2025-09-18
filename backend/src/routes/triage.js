const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');
const rateLimit = require('express-rate-limit');

// Rate limiting for triage endpoint
const triageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased limit for development
  message: {
    success: false,
    message: 'Too many triage requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/triage - Submit symptoms for triage
router.post('/', triageRateLimit, triageController.submitTriage);

// GET /api/triage/health - Health check for triage service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Triage Service',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// GET /api/triage/stats - Get triage statistics (optional)
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    message: 'Stats endpoint coming soon',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

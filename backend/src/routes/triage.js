const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');
const rateLimit = require('express-rate-limit');

// Rate limiting for triage endpoint
const triageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: 'Too many triage requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/triage - Submit symptoms for triage
router.post('/', triageRateLimit, triageController.submitTriage);

// GET /api/triage/stats - Get triage statistics (for monitoring)
router.get('/stats', triageController.getTriageStats);

module.exports = router;

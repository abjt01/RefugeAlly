const express = require('express');
const router = express.Router();
const SymptomLog = require('../models/SymptomLog');
const geminiService = require('../services/geminiService');
const triageEngine = require('../services/triageEngine');
const logger = require('../utils/logger');
const { validateTriageInput } = require('../utils/validators');
const rateLimit = require('express-rate-limit');

const triageRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests' }
});

// Helper functions
function getFallbackAdvice(severity, language = 'en') {
  const advice = {
    'en': {
      'high': 'Your symptoms require immediate medical attention. Please seek emergency care.',
      'medium': 'Monitor your symptoms closely. Consider consulting a healthcare provider.',
      'low': 'Rest, stay hydrated, and monitor your symptoms. Seek care if they worsen.'
    },
    'ar': {
      'high': 'تتطلب أعراضك عناية طبية فورية. يرجى طلب الرعاية الطارئة.',
      'medium': 'راقب أعراضك عن كثب. فكر في استشارة مقدم الرعاية الصحية.',
      'low': 'استرح، اشرب الكثير من الماء، وراقب أعراضك.'
    }
  };
  return advice[language]?.[severity] || advice['en'][severity];
}

// Main triage endpoint
router.post('/', triageRateLimit, async (req, res) => {
  try {
    logger.info('📥 Received triage request:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = validateTriageInput(req.body);
    if (error) {
      logger.error('❌ Validation error:', error.details.map(d => d.message));
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: error.details.map(d => d.message)
      });
    }

    const { symptoms, duration, language, location } = value;
    logger.info('✅ Validated data:', { symptoms, duration, language });
    
    const userContext = { 
      duration, 
      location: location || 'unknown',
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Rule-based triage
    const ruleBasedResult = triageEngine.analyzeSymptoms(symptoms, duration);
    logger.info('🔧 Rule-based result:', ruleBasedResult);
    
    // AI consultation
    logger.info('🤖 Calling Gemini AI...');
    const aiResult = await geminiService.generateTriageAdvice(symptoms, language, userContext);
    logger.info('🤖 AI result:', aiResult);

    // Combine results
    const finalResult = {
      advice: aiResult.advice || getFallbackAdvice(ruleBasedResult.severity, language),
      severity: aiResult.severity || ruleBasedResult.severity,
      confidence: Math.max(aiResult.confidence || 0.5, ruleBasedResult.confidence || 0.5),
      recommendations: aiResult.recommendations || ruleBasedResult.recommendations || [],
      followUp: aiResult.followUp || 'Monitor symptoms and consult healthcare provider if needed'
    };

    // Mock doctor data
    const availableDoctors = [
      {
        id: 'dr_001',
        name: 'Dr. Sarah Ahmed',
        specialty: 'General Medicine',
        rating: 4.8,
        experience: '8 years',
        languages: ['English', 'Arabic', 'Dari'],
        availability: 'Available Now',
        subsidized: true,
        consultationFee: 'Free (NGO Sponsored)',
        avatar: '👩‍⚕️'
      },
      {
        id: 'dr_002', 
        name: 'Dr. Michael Chen',
        specialty: 'Internal Medicine',
        rating: 4.9,
        experience: '12 years',
        languages: ['English'],
        availability: 'Available in 15 mins',
        subsidized: false,
        consultationFee: '$25',
        avatar: '👨‍⚕️'
      }
    ];

    // Save to database
    try {
      const symptomLog = new SymptomLog({
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        duration,
        language,
        triageResult: finalResult,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      await symptomLog.save();
      logger.info('💾 Saved to database');
    } catch (dbError) {
      logger.error('❌ DB save failed:', dbError.message);
    }

    // Mock outbreak data
    const outbreakRisk = {
      location: userContext.location,
      riskLevel: 'Medium',
      similarCases: Math.floor(Math.random() * 20) + 5,
      recommendation: 'Monitor closely - increased respiratory cases detected'
    };

    logger.info('✅ Triage completed');

    res.json({
      success: true,
      data: {
        ...finalResult,
        availableDoctors,
        outbreakRisk
      },
      userInput: { symptoms, duration, language },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('❌ Triage error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'RefugeAlly Triage Service',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Stats endpoint
router.get('/stats', async (req, res) => {
  try {
    const totalLogs = await SymptomLog.countDocuments();
    res.json({
      success: true,
      data: { totalTriages: totalLogs },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to fetch stats'
    });
  }
});

module.exports = router;

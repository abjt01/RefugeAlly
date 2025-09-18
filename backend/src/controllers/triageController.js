const SymptomLog = require('../models/SymptomLog');
const geminiService = require('../services/geminiService');
const triageEngine = require('../services/triageEngine');
const logger = require('../utils/logger');
const { validateTriageInput } = require('../utils/validators');

class TriageController {
  // Main triage method
  async submitTriage(req, res) {
    try {
      logger.info('📥 Received triage request:', JSON.stringify(req.body, null, 2));
      
      // Validate input
      const { error, value } = validateTriageInput(req.body);
      if (error) {
        logger.error('❌ Validation error:', error.details.map(d => d.message));
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: error.details.map(d => d.message)
        });
      }

      const { symptoms, duration, language } = value;
      logger.info('✅ Validated data:', { symptoms, duration, language });
      
      // Get user context
      const userContext = { 
        duration, 
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      };

      // Perform rule-based triage first
      const ruleBasedResult = triageEngine.analyzeSymptoms(symptoms, duration);
      logger.info('🔧 Rule-based result:', ruleBasedResult);
      
      // Get AI-enhanced advice
      logger.info('🤖 Calling Gemini AI...');
      const aiResult = await geminiService.generateTriageAdvice(symptoms, language, userContext);
      logger.info('🤖 AI result:', aiResult);

      // Combine results
      const finalResult = {
        advice: aiResult.advice || this.getFallbackAdvice(ruleBasedResult.severity, language),
        severity: aiResult.severity || ruleBasedResult.severity,
        confidence: Math.max(aiResult.confidence || 0.5, ruleBasedResult.confidence || 0.5),
        recommendations: ruleBasedResult.recommendations || [],
        followUp: aiResult.followUp || 'Monitor symptoms and consult healthcare provider if needed'
      };

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
        logger.info('💾 Symptom log saved successfully');
      } catch (dbError) {
        logger.error('❌ Failed to save symptom log:', dbError.message);
      }

      logger.info(`✅ Triage completed: ${finalResult.severity} severity`);

      res.json({
        success: true,
        data: finalResult,
        userInput: { symptoms, duration, language },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('❌ Triage controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        advice: this.getEmergencyFallback(req.body.language || 'en')
      });
    }
  }

  // Helper method for fallback advice
  getFallbackAdvice(severity, language = 'en') {
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
      },
      'dari': {
        'high': 'ستاسو نښې سمدلاسه طبي پاملرنې ته اړتیا لري.',
        'medium': 'خپل نښې له نږدې څخه وګورئ.',
        'low': 'آرام شئ، ډیرې اوبه وښه، او خپل نښې وګورئ.'
      }
    };
    return advice[language]?.[severity] || advice['en'][severity];
  }

  // Emergency fallback method
  getEmergencyFallback(language = 'en') {
    const emergency = {
      'en': 'If you have a medical emergency, please seek immediate professional help.',
      'ar': 'إذا كانت لديك حالة طوارئ طبية، يرجى طلب المساعدة المهنية الفورية.',
      'dari': 'که تاسو د طبي بیړنۍ حالت لرئ، مهرباني وکړئ سمدلاسه د مسلکي مرستې غوښتنه وکړئ.'
    };
    return emergency[language] || emergency['en'];
  }

  // Stats method (if you have it in routes)
  async getTriageStats(req, res) {
    try {
      const totalLogs = await SymptomLog.countDocuments();
      
      res.json({
        success: true,
        data: {
          totalTriages: totalLogs,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Stats error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch statistics'
      });
    }
  }
}

module.exports = new TriageController();

const SymptomLog = require('../models/SymptomLog');
const geminiService = require('../services/geminiService');
const triageEngine = require('../services/triageEngine');
const logger = require('../utils/logger');
const { validateTriageInput } = require('../utils/validators');

class TriageController {
  async submitTriage(req, res) {
    try {
      logger.info('Received triage request:', JSON.stringify(req.body, null, 2));
      
      // Validate input
      const { error, value } = validateTriageInput(req.body);
      if (error) {
        logger.error('Validation error:', error.details);
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: error.details.map(d => d.message),
          received: req.body
        });
      }

      const { symptoms, duration, language } = value;
      logger.info('Validated data:', { symptoms, duration, language });
      
      // Get user context
      const userContext = {
        duration,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      };

      // Perform rule-based triage first
      const ruleBasedResult = triageEngine.analyzeSymptoms(symptoms, duration);
      logger.info('Rule-based result:', ruleBasedResult);
      
      // Get AI-enhanced advice
      const aiResult = await geminiService.generateTriageAdvice(
        symptoms, 
        language, 
        userContext
      );
      logger.info('AI result:', aiResult);

      // Combine results
      const finalResult = {
        advice: aiResult.advice || this.getFallbackAdvice(ruleBasedResult.severity, language),
        severity: aiResult.severity || ruleBasedResult.severity,
        confidence: Math.max(aiResult.confidence || 0.5, ruleBasedResult.confidence || 0.5),
        recommendations: aiResult.emergencyActions || ruleBasedResult.recommendations || [],
        followUp: aiResult.followUp || 'Monitor symptoms and consult healthcare provider if needed'
      };

      // Log the interaction
      try {
        const symptomLog = new SymptomLog({
          symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
          duration,
          language,
          triageResult: finalResult,
          ipAddress: userContext.ipAddress,
          userAgent: userContext.userAgent
        });

        await symptomLog.save();
        logger.info('Symptom log saved successfully');
      } catch (dbError) {
        logger.error('Failed to save symptom log:', dbError.message);
        // Continue without failing the request
      }

      // Log for monitoring
      logger.info(`Triage completed: ${finalResult.severity} severity for ${Array.isArray(symptoms) ? symptoms.length : 1} symptoms`);

      res.json({
        success: true,
        data: finalResult,
        userInput: { symptoms, duration, language },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Triage error:', error.message);
      logger.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        advice: this.getEmergencyFallback(req.body.language || 'en'),
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  getFallbackAdvice(severity, language = 'en') {
    const fallbackAdvice = {
      'en': {
        'high': 'Your symptoms require immediate medical attention. Please seek emergency care.',
        'medium': 'Monitor your symptoms closely. Consider consulting a healthcare provider.',
        'low': 'Rest, stay hydrated, and monitor your symptoms. Seek care if they worsen.'
      },
      'ar': {
        'high': 'تتطلب أعراضك عناية طبية فورية. يرجى طلب الرعاية الطارئة.',
        'medium': 'راقب أعراضك عن كثب. فكر في استشارة مقدم الرعاية الصحية.',
        'low': 'استرح، اشرب الكثير من الماء، وراقب أعراضك. اطلب الرعاية إذا تفاقمت.'
      },
      'dari': {
        'high': 'ستاسو نښې سمدلاسه طبي پاملرنې ته اړتیا لري. د بیړني مرستې غوښتنه وکړئ.',
        'medium': 'خپل نښې له نږدې څخه وګورئ. د روغتیا پاملرنې چمتو کونکي سره مشوره ورسره وکړئ.',
        'low': 'آرام شئ، ډیرې اوبه وښه، او خپل نښې وګورئ. که خراب شي نو د پاملرنې غوښتنه وکړئ.'
      }
    };

    return fallbackAdvice[language]?.[severity] || fallbackAdvice['en'][severity];
  }

  getEmergencyFallback(language = 'en') {
    const emergency = {
      'en': 'If you have a medical emergency, please seek immediate professional help.',
      'ar': 'إذا كانت لديك حالة طوارئ طبية، يرجى طلب المساعدة المهنية الفورية.',
      'dari': 'که تاسو د طبي بیړنۍ حالت لرئ، مهرباني وکړئ سمدلاسه د مسلکي مرستې غوښتنه وکړئ.'
    };

    return emergency[language] || emergency['en'];
  }

  async getTriageStats(req, res) {
    try {
      const stats = await SymptomLog.aggregate([
        {
          $group: {
            _id: '$triageResult.severity',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$triageResult.confidence' }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const totalLogs = await SymptomLog.countDocuments();
      
      res.json({
        success: true,
        data: {
          severityDistribution: stats,
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

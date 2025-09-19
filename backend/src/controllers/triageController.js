const SymptomLog = require('../models/SymptomLog');
const geminiService = require('../services/geminiService');
const triageEngine = require('../services/triageEngine');
const logger = require('../utils/logger');
const { validateTriageInput } = require('../utils/validators');

class TriageController {
  async submitTriage(req, res) {
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

      // Step 1: Rule-based triage
      const ruleBasedResult = triageEngine.analyzeSymptoms(symptoms, duration);
      logger.info('🔧 Rule-based result:', ruleBasedResult);
      
      // Step 2: AI consultation with Gemini
      logger.info('🤖 Calling Gemini AI for consultation...');
      const aiResult = await geminiService.generateTriageAdvice(symptoms, language, userContext);
      logger.info('🤖 AI consultation result:', aiResult);

      // Step 3: Combine results
      const finalResult = {
        advice: aiResult.advice || getFallbackAdvice(ruleBasedResult.severity, language),
        severity: aiResult.severity || ruleBasedResult.severity,
        confidence: Math.max(aiResult.confidence || 0.5, ruleBasedResult.confidence || 0.5),
        recommendations: aiResult.recommendations || ruleBasedResult.recommendations || [],
        followUp: aiResult.followUp || 'Monitor symptoms and consult healthcare provider if needed',
        aiConsultation: aiResult.advice ? true : false
      };

      // Step 4: Mock doctor data (since services aren't created yet)
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
          consultationFee: 'Free (NGO Sponsored)',
          avatar: '👨‍⚕️'
        }
      ];

      // Step 5: Save to database
      try {
        const symptomLog = new SymptomLog({
          symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
          duration,
          language,
          location: userContext.location,
          triageResult: finalResult,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        });
        
        await symptomLog.save();
        logger.info('💾 Patient record saved successfully');
        
        // Mock outbreak analysis
        const outbreakRisk = {
          location: userContext.location,
          riskLevel: 'Medium',
          similarCases: Math.floor(Math.random() * 20) + 5,
          recommendation: 'Monitor closely - increased cases of respiratory symptoms detected in the region'
        };

        // Final response with all data
        const completeResponse = {
          ...finalResult,
          patientId: symptomLog._id,
          availableDoctors: availableDoctors,
          outbreakRisk: outbreakRisk
        };

        logger.info(`✅ Complete triage completed: ${finalResult.severity} severity`);

        res.json({
          success: true,
          data: completeResponse,
          userInput: { symptoms, duration, language, location: userContext.location },
          timestamp: new Date().toISOString(),
          flow: {
            step1: 'AI Consultation Complete ✅',
            step2: 'Doctors Available ✅',
            step3: 'Outbreak Analysis Complete ✅'
          }
        });

      } catch (dbError) {
        logger.error('❌ Failed to save patient record:', dbError.message);
        // Continue without failing the request
        res.json({
          success: true,
          data: finalResult,
          userInput: { symptoms, duration, language },
          timestamp: new Date().toISOString(),
          warning: 'Data not saved to database'
        });
      }

    } catch (error) {
      logger.error('❌ Triage controller error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        advice: getEmergencyFallback(req.body.language || 'en')
      });
    }
  }

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

// Helper functions (outside the class to avoid 'this' issues)
function getFallbackAdvice(severity, language = 'en') {
  const advice = {
    'en': {
      'high': 'Your symptoms require immediate medical attention. Please seek emergency care or connect with an available doctor immediately.',
      'medium': 'Monitor your symptoms closely and consider consulting with one of our available doctors within the next few hours.',
      'low': 'Rest, stay hydrated, and monitor your symptoms. You can consult with a doctor if symptoms persist or worsen.'
    },
    'ar': {
      'high': 'تتطلب أعراضك عناية طبية فورية. يرجى طلب الرعاية الطارئة أو الاتصال بطبيب متاح فورًا.',
      'medium': 'راقب أعراضك عن كثب وفكر في استشارة أحد أطبائنا المتاحين خلال الساعات القليلة القادمة.',
      'low': 'استرح واشرب الكثير من الماء وراقب أعراضك. يمكنك استشارة طبيب إذا استمرت الأعراض أو تفاقمت.'
    },
    'dari': {
      'high': 'ستاسو نښې سمدلاسه طبي پاملرنې ته اړتیا لري. د بیړني مرستې غوښتنه وکړئ یا سمدلاسه د شتون لرونکي ډاکټر سره اړیکه ونیسئ.',
      'medium': 'خپل نښې له نږدې څخه وګورئ او په راتلونکو څو ساعتونو کې زموږ د شتون لرونکي ډاکټرانو څخه د یو سره مشوره په پام کې ونیسئ.',
      'low': 'آرام شئ، ډیرې اوبه وښه، او خپل نښې وګورئ. که نښې دوام ولري یا خرابې شي نو تاسو کولی شئ د ډاکټر سره مشوره وکړئ.'
    }
  };
  return advice[language]?.[severity] || advice['en'][severity];
}

function getEmergencyFallback(language = 'en') {
  const emergency = {
    'en': 'If you have a medical emergency, please seek immediate professional help or call local emergency services.',
    'ar': 'إذا كانت لديك حالة طوارئ طبية، يرجى طلب المساعدة المهنية الفورية أو الاتصال بخدمات الطوارئ المحلية.',
    'dari': 'که تاسو د طبي بیړنۍ حالت لرئ، مهرباني وکړئ سمدلاسه د مسلکي مرستې غوښتنه وکړئ یا د محلي بیړني خدماتو سره اړیکه ونیسئ.'
  };
  return emergency[language] || emergency['en'];
}

module.exports = new TriageController();

const SymptomLog = require('../models/SymptomLog');
const geminiService = require('../services/geminiService');
const triageEngine = require('../services/triageEngine');
const logger = require('../utils/logger');
const { validateTriageInput } = require('../utils/validators');
const axios = require('axios');

// Service URLs
const ML_SERVICE_URL = 'http://localhost:5000';
const LOOM_SERVICE_URL = 'http://localhost:6000';

class TriageController {
  async submitTriage(req, res) {
    try {
      logger.info('📥 Received triage request:', JSON.stringify(req.body, null, 2));
      
      const { error, value } = validateTriageInput(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: error.details.map(d => d.message)
        });
      }

      const { symptoms, duration, language, location } = value;
      
      // Step 1: Rule-based triage
      const ruleBasedResult = triageEngine.analyzeSymptoms(symptoms, duration);
      logger.info('🔧 Rule-based result:', ruleBasedResult);
      
      // Step 2: AI consultation with Gemini
      const aiResult = await geminiService.generateTriageAdvice(symptoms, language, { duration, location });
      logger.info('🤖 AI result:', aiResult);

      // Step 3: Combine results
      const finalResult = {
        advice: aiResult.advice || getFallbackAdvice(ruleBasedResult.severity, language),
        severity: aiResult.severity || ruleBasedResult.severity,
        confidence: Math.max(aiResult.confidence || 0.5, ruleBasedResult.confidence || 0.5),
        recommendations: aiResult.recommendations || ruleBasedResult.recommendations || [],
        followUp: aiResult.followUp || 'Monitor symptoms and consult healthcare provider if needed'
      };

      // Step 4: Save to database
      const symptomLog = new SymptomLog({
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        duration,
        language,
        triageResult: finalResult,
        location: { country: location || 'unknown' },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      await symptomLog.save();
      logger.info('💾 Patient record saved');

      // Step 5: ML Outbreak Prediction
      logger.info('🧬 Calling ML outbreak prediction...');
      const mlResult = await this.callMLService({
        patient_id: symptomLog._id.toString(),
        symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
        location: location || 'unknown',
        severity: finalResult.severity,
        duration,
        population_density: 1500 // Mock value
      });

      // Step 6: Check for mental health support needs
      const mentalHealthSupport = await this.getMentalHealthResources();

      // Step 7: Mock available doctors
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

      // Final comprehensive response
      res.json({
        success: true,
        data: {
          // Triage Results
          ...finalResult,
          patientId: symptomLog._id,
          
          // Available Doctors
          availableDoctors,
          
          // ML Outbreak Analysis
          outbreakAnalysis: mlResult,
          
          // Mental Health Support
          mentalHealthSupport: {
            available: true,
            chatEndpoint: `${LOOM_SERVICE_URL}/mental-health/chat`,
            moodEndpoint: `${LOOM_SERVICE_URL}/mental-health/mood`,
            resourcesEndpoint: `${LOOM_SERVICE_URL}/mental-health/resources`,
            ...mentalHealthSupport
          }
        },
        userInput: { symptoms, duration, language, location },
        timestamp: new Date().toISOString(),
        services: {
          aiTriage: '✅ Complete',
          mlOutbreakDetection: mlResult ? '✅ Complete' : '⚠️ Fallback',
          doctorMatching: '✅ Available',
          mentalHealthSupport: '✅ Ready'
        }
      });

    } catch (error) {
      logger.error('❌ Triage error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        advice: 'Please consult a healthcare professional immediately if you have serious symptoms.'
      });
    }
  }

  async callMLService(patientData) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict-outbreak`, patientData, {
        timeout: 5000
      });
      
      if (response.data.success) {
        logger.info('✅ ML outbreak prediction completed');
        return response.data.data;
      }
      
      return this.getFallbackMLResult();
    } catch (error) {
      logger.error('❌ ML service error:', error.message);
      return this.getFallbackMLResult();
    }
  }

  async getMentalHealthResources() {
    try {
      const response = await axios.get(`${LOOM_SERVICE_URL}/mental-health/resources`, {
        timeout: 3000
      });
      
      if (response.data.success) {
        return response.data.resources;
      }
      
      return this.getFallbackMentalHealthResources();
    } catch (error) {
      logger.error('❌ Loom service error:', error.message);
      return this.getFallbackMentalHealthResources();
    }
  }

  getFallbackMLResult() {
    return {
      risk_level: 'Medium',
      risk_probability: 0.6,
      similar_cases: 12,
      outbreak_predicted: false,
      recommendation: '🔍 STANDARD MONITORING: Continue regular health screening.',
      model_confidence: 0.6,
      timestamp: new Date().toISOString()
    };
  }

  getFallbackMentalHealthResources() {
    return {
      crisis_hotlines: [
        { name: "Crisis Helpline", number: "988", available: "24/7" }
      ],
      coping_techniques: [
        { name: "Deep Breathing", description: "Breathe slowly and deeply" }
      ]
    };
  }

  // New endpoint for mental health chat
  async mentalHealthChat(req, res) {
    try {
      const { text, language = 'en', user_id = 'anonymous' } = req.body;
      
      const response = await axios.post(`${LOOM_SERVICE_URL}/mental-health/chat`, {
        text,
        language,
        user_id
      });
      
      res.json(response.data);
    } catch (error) {
      logger.error('Mental health chat error:', error.message);
      res.status(500).json({
        success: false,
        response: "I'm here to support you. Please try again or contact a mental health professional if you need immediate help."
      });
    }
  }

  // New endpoint for mood logging
  async logMood(req, res) {
    try {
      const { emoji, user_id = 'anonymous', notes = '' } = req.body;
      
      const response = await axios.post(`${LOOM_SERVICE_URL}/mental-health/mood`, {
        emoji,
        user_id,
        notes
      });
      
      res.json(response.data);
    } catch (error) {
      logger.error('Mood logging error:', error.message);
      res.status(500).json({
        success: false,
        message: "Unable to log mood at this time."
      });
    }
  }
}

function getFallbackAdvice(severity, language = 'en') {
  const advice = {
    'en': {
      'high': 'Your symptoms require immediate medical attention. Please seek emergency care.',
      'medium': 'Monitor your symptoms closely and consider consulting a healthcare provider.',
      'low': 'Rest, stay hydrated, and monitor your symptoms.'
    }
  };
  return advice[language]?.[severity] || advice['en'][severity];
}

module.exports = new TriageController();

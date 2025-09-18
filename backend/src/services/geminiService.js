const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    try {
      if (!config.geminiApiKey || config.geminiApiKey === 'your_api_key_here') {
        throw new Error('Gemini API key is missing or placeholder');
      }
      
      this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
      // FIXED: Use the correct model name
      this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      logger.info('✅ Gemini AI service initialized successfully');
      logger.info(`🔑 Using API key: ${config.geminiApiKey.substring(0, 10)}...`);
    } catch (error) {
      logger.error('❌ Failed to initialize Gemini AI service:', error.message);
      this.genAI = null;
      this.model = null;
    }
  }

  async testConnection() {
    try {
      if (!this.model) {
        throw new Error('Gemini model not initialized');
      }

      const testPrompt = "Say 'Hello from RefugeAlly'";
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('✅ Gemini connection test successful:', text.trim());
      return true;
    } catch (error) {
      logger.error('❌ Gemini connection test failed:', error.message);
      if (error.message.includes('API_KEY_INVALID')) {
        logger.error('🔑 API Key is invalid. Please check your Gemini API key.');
      }
      if (error.message.includes('quota')) {
        logger.error('📊 API quota exceeded. Please check your usage limits.');
      }
      if (error.message.includes('not found')) {
        logger.error('🤖 Model not found. Using updated model name.');
      }
      return false;
    }
  }

  async generateTriageAdvice(symptoms, language = 'en', context = {}) {
    try {
      if (!this.genAI || !this.model) {
        logger.warn('⚠️ Gemini service not available, using fallback');
        return this.getFallbackResponse(symptoms, language);
      }

      logger.info('🤖 Calling Gemini API with symptoms:', symptoms);

      const prompt = this.buildTriagePrompt(symptoms, language, context);
      logger.info('📝 Generated prompt length:', prompt.length);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      logger.info('✅ Gemini API response received:', text.substring(0, 100) + '...');
      return this.parseTriageResponse(text, language);
    } catch (error) {
      logger.error('❌ Gemini API error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      
      return this.getFallbackResponse(symptoms, language);
    }
  }

  buildTriagePrompt(symptoms, language, context) {
    const languageInstructions = {
      'en': 'Respond in English',
      'ar': 'Respond in Arabic',
      'dari': 'Respond in Dari (Afghan Persian)'
    };

    const symptomsText = Array.isArray(symptoms) ? symptoms.join(', ') : symptoms;

    return `You are RefugeAlly, a medical triage AI assistant for refugees.

IMPORTANT: Provide brief, clear medical guidance. Never diagnose. Focus on when to seek care.

SYMPTOMS: ${symptomsText}
DURATION: ${context.duration || 'unknown'}
LANGUAGE: ${languageInstructions[language] || 'English'}

Respond with this exact JSON format:
{
  "advice": "Brief medical guidance in ${language}",
  "severity": "low|medium|high", 
  "confidence": 0.8,
  "followUp": "When to seek additional care"
}

Rules:
- High severity: emergency symptoms (chest pain, difficulty breathing, severe bleeding)
- Medium severity: concerning symptoms needing medical attention
- Low severity: minor symptoms, rest and monitor
- Be culturally sensitive for refugee population`;
  }

  parseTriageResponse(text, language) {
    try {
      const cleanText = text.replace(/``````/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        logger.info('✅ Successfully parsed Gemini JSON response');
        return {
          advice: parsed.advice || 'Monitor symptoms and seek care if needed',
          severity: parsed.severity || 'medium',
          confidence: parsed.confidence || 0.8,
          followUp: parsed.followUp || 'Consult healthcare provider if symptoms persist'
        };
      }
    } catch (error) {
      logger.warn('⚠️ Failed to parse Gemini JSON response, using text fallback');
    }

    const severity = this.detectSeverityFromText(text);
    return {
      advice: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      severity,
      confidence: 0.7,
      followUp: 'Monitor symptoms and seek care if they worsen'
    };
  }

  detectSeverityFromText(text) {
    const lowerText = text.toLowerCase();
    
    const highKeywords = ['emergency', 'immediate', 'urgent', 'hospital', 'call doctor', 'serious'];
    const mediumKeywords = ['monitor', 'concern', 'doctor', 'medical attention', 'consult'];
    
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  getFallbackResponse(symptoms, language) {
    logger.info('🔄 Using fallback response for language:', language);
    
    const responses = {
      'en': {
        advice: 'Based on your symptoms, please monitor your condition carefully. Seek medical care if symptoms worsen, persist, or you feel concerned.',
        severity: 'medium'
      },
      'ar': {
        advice: 'بناءً على أعراضك، يرجى مراقبة حالتك بعناية. اطلب الرعاية الطبية إذا ساءت الأعراض أو استمرت أو شعرت بالقلق.',
        severity: 'medium'
      },
      'dari': {
        advice: 'د تاسو د نښو په بنسټ، مهرباني وکړئ خپله حالت په پاملرنې سره وڅارئ. که نښې خرابې شي، دوام ولري یا اندیښنه یې ولرئ نو د طبي پاملرنې غوښتنه وکړئ.',
        severity: 'medium'
      }
    };

    return {
      ...responses[language] || responses['en'],
      confidence: 0.7,
      followUp: 'Consult healthcare provider if available'
    };
  }
}

module.exports = new GeminiService();

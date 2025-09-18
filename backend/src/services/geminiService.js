const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const logger = require('../utils/logger');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateTriageAdvice(symptoms, language = 'en', context = {}) {
    try {
      const prompt = this.buildTriagePrompt(symptoms, language, context);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseTriageResponse(text, language);
    } catch (error) {
      logger.error('Gemini API error:', error.message);
      return this.getFallbackResponse(symptoms, language);
    }
  }

  buildTriagePrompt(symptoms, language, context) {
    const languageInstructions = {
      'en': 'Respond in English',
      'ar': 'Respond in Arabic',
      'dari': 'Respond in Dari (Afghan Persian)'
    };

    return `
You are a medical triage AI assistant specifically designed for refugee healthcare.

CRITICAL INSTRUCTIONS:
- Provide brief, clear, culturally-sensitive medical guidance
- NEVER diagnose or replace professional medical care
- Focus on triage: emergency, urgent, or routine care needed
- Be empathetic to refugee trauma and stress
- ${languageInstructions[language] || 'Respond in English'}

SYMPTOMS: ${Array.isArray(symptoms) ? symptoms.join(', ') : symptoms}
DURATION: ${context.duration || 'unknown'}

RESPONSE FORMAT (JSON):
{
  "advice": "brief medical guidance in requested language",
  "severity": "low|medium|high",
  "confidence": 0.8,
  "emergencyActions": ["immediate actions if high severity"],
  "followUp": "when to seek additional care"
}

Context: User is in refugee setting with limited healthcare access. Prioritize safety and clear guidance.
    `;
  }

  parseTriageResponse(text, language) {
    try {
      // Try to parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to parse Gemini JSON response');
    }

    // Fallback: parse text response
    return {
      advice: text.slice(0, 200) + (text.length > 200 ? '...' : ''),
      severity: this.detectSeverityFromText(text),
      confidence: 0.6,
      followUp: 'Monitor symptoms and seek care if they worsen'
    };
  }

  detectSeverityFromText(text) {
    const highKeywords = ['emergency', 'immediate', 'urgent', 'hospital', 'dangerous', 'serious'];
    const mediumKeywords = ['monitor', 'concern', 'doctor', 'medical attention'];
    
    const lowerText = text.toLowerCase();
    
    if (highKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'medium';
    }
    return 'low';
  }

  getFallbackResponse(symptoms, language) {
    const responses = {
      'en': {
        advice: 'Based on your symptoms, please monitor your condition. Seek medical care if symptoms worsen or persist.',
        severity: 'medium'
      },
      'ar': {
        advice: 'بناءً على أعراضك، يرجى مراقبة حالتك. اطلب العناية الطبية إذا ساءت الأعراض أو استمرت.',
        severity: 'medium'
      },
      'dari': {
        advice: 'د تاسو د نښو په بنسټ، مهرباني وکړئ خپله حالت وڅارئ. که نښې خرابې شي یا دوام ولري نو د طبي پاملرنې غوښتنه وکړئ.',
        severity: 'medium'
      }
    };

    return {
      ...responses[language] || responses['en'],
      confidence: 0.4,
      followUp: 'Consult healthcare provider if available'
    };
  }
}

module.exports = new GeminiService();

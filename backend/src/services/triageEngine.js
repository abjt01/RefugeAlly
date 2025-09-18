const logger = require('../utils/logger');

class TriageEngine {
  constructor() {
    this.emergencyKeywords = [
      'difficulty breathing', 'chest pain', 'severe pain', 'bleeding', 
      'unconscious', 'seizure', 'high fever', 'severe headache',
      'vomiting blood', 'severe dehydration', 'allergic reaction'
    ];
    
    this.urgentKeywords = [
      'persistent fever', 'persistent cough', 'severe fatigue',
      'diarrhea', 'vomiting', 'moderate pain', 'infection signs'
    ];

    logger.info('🔧 Triage Engine initialized');
  }

  analyzeSymptoms(symptoms, duration = 'unknown') {
    try {
      const symptomsText = Array.isArray(symptoms) 
        ? symptoms.join(' ').toLowerCase()
        : symptoms.toLowerCase();

      logger.info('🔍 Analyzing symptoms:', symptomsText);

      const severity = this.determineSeverity(symptomsText, duration);
      const riskFactors = this.identifyRiskFactors(symptomsText);
      
      const result = {
        severity,
        riskFactors,
        recommendations: this.getRecommendations(severity, riskFactors),
        confidence: this.calculateConfidence(symptomsText, severity)
      };

      logger.info('🔍 Analysis result:', result);
      return result;
    } catch (error) {
      logger.error('❌ Triage engine error:', error.message);
      return {
        severity: 'medium',
        riskFactors: [],
        recommendations: ['Consult healthcare provider'],
        confidence: 0.3
      };
    }
  }

  determineSeverity(symptomsText, duration) {
    // Check for emergency symptoms
    const hasEmergency = this.emergencyKeywords.some(keyword => 
      symptomsText.includes(keyword)
    );
    
    if (hasEmergency) {
      logger.info('🚨 High severity detected: emergency symptoms');
      return 'high';
    }

    // Check for urgent symptoms
    const hasUrgent = this.urgentKeywords.some(keyword => 
      symptomsText.includes(keyword)
    );
    
    if (hasUrgent) {
      logger.info('⚠️ Medium severity detected: urgent symptoms');
      return 'medium';
    }

    // Consider duration
    if (duration === 'more-than-week' && symptomsText.includes('fever')) {
      logger.info('⚠️ Medium severity detected: prolonged fever');
      return 'medium';
    }

    logger.info('💚 Low severity detected');
    return 'low';
  }

  identifyRiskFactors(symptomsText) {
    const riskFactors = [];
    
    if (symptomsText.includes('fever') && symptomsText.includes('cough')) {
      riskFactors.push('respiratory_infection');
    }
    
    if (symptomsText.includes('diarrhea') && symptomsText.includes('vomiting')) {
      riskFactors.push('dehydration_risk');
    }
    
    if (symptomsText.includes('headache') && symptomsText.includes('fever')) {
      riskFactors.push('possible_infection');
    }
    
    return riskFactors;
  }

  getRecommendations(severity, riskFactors) {
    const recommendations = [];
    
    switch (severity) {
      case 'high':
        recommendations.push('Seek immediate medical attention');
        recommendations.push('Go to nearest emergency facility');
        break;
      case 'medium':
        recommendations.push('Consult healthcare provider within 24 hours');
        recommendations.push('Monitor symptoms closely');
        break;
      case 'low':
        recommendations.push('Rest and stay hydrated');
        recommendations.push('Monitor symptoms for changes');
        break;
    }
    
    // Add specific recommendations based on risk factors
    if (riskFactors.includes('dehydration_risk')) {
      recommendations.push('Increase fluid intake');
    }
    
    return recommendations;
  }

  calculateConfidence(symptomsText, severity) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for clear symptoms
    if (severity === 'high') {
      confidence = 0.9;
    } else if (severity === 'medium') {
      confidence = 0.7;
    }
    
    // Adjust based on symptom detail
    const words = symptomsText.split(/\s+/).length;
    if (words > 5) confidence += 0.1;
    if (words < 3) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }
}

module.exports = new TriageEngine();

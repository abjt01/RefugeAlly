const config = require('../config/config');
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
  }

  analyzeSymptoms(symptoms, duration = 'unknown') {
    const symptomsText = Array.isArray(symptoms) 
      ? symptoms.join(' ').toLowerCase()
      : symptoms.toLowerCase();

    const severity = this.determineSeverity(symptomsText, duration);
    const riskFactors = this.identifyRiskFactors(symptomsText);
    
    return {
      severity,
      riskFactors,
      recommendations: this.getRecommendations(severity, riskFactors),
      confidence: this.calculateConfidence(symptomsText, severity)
    };
  }

  determineSeverity(symptomsText, duration) {
    // Check for emergency symptoms
    const hasEmergency = this.emergencyKeywords.some(keyword => 
      symptomsText.includes(keyword)
    );
    
    if (hasEmergency) return 'high';

    // Check for urgent symptoms
    const hasUrgent = this.urgentKeywords.some(keyword => 
      symptomsText.includes(keyword)
    );
    
    if (hasUrgent) return 'medium';

    // Consider duration
    if (duration === 'more-than-week' && symptomsText.includes('fever')) {
      return 'medium';
    }

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
      riskFactors.push('possible_meningitis');
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
      recommendations.push('Consider oral rehydration solution');
    }
    
    return recommendations;
  }

  calculateConfidence(symptomsText, severity) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for clear emergency symptoms
    if (severity === 'high' && this.emergencyKeywords.some(k => symptomsText.includes(k))) {
      confidence = 0.9;
    }
    
    // Adjust confidence based on symptom clarity
    const symptomCount = symptomsText.split(/[,\s]+/).length;
    if (symptomCount > 3) confidence += 0.1;
    if (symptomCount < 2) confidence -= 0.1;
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }
}

module.exports = new TriageEngine();

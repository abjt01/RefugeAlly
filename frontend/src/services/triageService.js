import api from './api';

/**
 * Triage Service
 * Handles all triage-related API calls
 */

export const triageService = {
  /**
   * Submit symptoms for triage assessment
   * @param {Object} triageData - The triage data to submit
   * @param {Array} triageData.symptoms - List of symptoms
   * @param {string} triageData.description - Detailed symptom description
   * @param {string} triageData.duration - Duration of symptoms
   * @param {string} triageData.language - Language preference (en, ar, dari)
   * @returns {Promise} API response with triage advice
   */
  async submitTriage(triageData) {
    try {
      const response = await api.post('/api/triage', triageData);
      return response.data;
    } catch (error) {
      console.error('Triage submission failed:', error);
      throw error;
    }
  },

  /**
   * Get available symptom categories
   * @returns {Array} List of available symptoms
   */
  getSymptomCategories() {
    return [
      'fever',
      'cough',
      'headache',
      'fatigue',
      'nausea',
      'bodyAches',
      'difficultyBreathing',
      'soreThroat',
      'diarrhea',
      'vomiting'
    ];
  },

  /**
   * Validate triage input data
   * @param {Object} triageData - The triage data to validate
   * @returns {Object} Validation result
   */
  validateTriageData(triageData) {
    const errors = [];

    if (!triageData.symptoms || triageData.symptoms.length === 0) {
      if (!triageData.description || triageData.description.trim().length === 0) {
        errors.push('Please provide either symptoms or a description');
      }
    }

    if (!triageData.language || !['en', 'ar', 'dari'].includes(triageData.language)) {
      errors.push('Please select a valid language');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Format triage data for API submission
   * @param {Object} formData - Raw form data
   * @returns {Object} Formatted triage data
   */
  formatTriageData(formData) {
    return {
      symptoms: formData.symptoms || [],
      description: formData.description || '',
      duration: formData.duration || '',
      language: formData.language || 'en',
      timestamp: new Date().toISOString()
    };
  }
};

export default triageService;
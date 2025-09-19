import api from './api';

const triageService = {
  submitSymptoms: async (symptomsData) => {
    return await api.post('/api/triage', symptomsData);
  },
  
  // NEW: Add mental health chat
  sendMentalHealthMessage: async (message, language = 'en') => {
    try {
      const response = await api.post('/api/triage/mental-health/chat', {
        text: message,
        language: language,
        user_id: 'demo_user'
      });
      return response;
    } catch (error) {
      return {
        success: false,
        response: "I'm here to support you. Please try again.",
        error: error.message
      };
    }
  },
  
  // NEW: Add mood logging
  logMood: async (emoji, notes = '') => {
    try {
      const response = await api.post('/api/triage/mental-health/mood', {
        emoji: emoji,
        user_id: 'demo_user',
        notes: notes
      });
      return response;
    } catch (error) {
      return {
        success: false,
        message: "Unable to log mood at this time."
      };
    }
  },

  // NEW: Get outbreak data
  getOutbreakData: async (location = 'unknown') => {
    try {
      const response = await api.get(`/api/triage/outbreak?location=${location}`);
      return response;
    } catch (error) {
      return {
        success: false,
        data: {
          location: location,
          risk_level: 'Unknown',
          similar_cases: 0,
          recommendation: 'Unable to assess outbreak risk at this time.'
        }
      };
    }
  },

  // NEW: Health check for services
  checkServiceHealth: async () => {
    try {
      const response = await api.get('/api/triage/health');
      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Service unavailable'
      };
    }
  },

  // NEW: Get mental health resources
  getMentalHealthResources: async () => {
    try {
      const response = await fetch('http://localhost:6000/mental-health/resources');
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        success: false,
        resources: {
          crisis_hotlines: [
            { name: "Crisis Helpline", number: "988", available: "24/7" }
          ],
          coping_techniques: [
            { name: "Deep Breathing", description: "Breathe slowly and deeply" }
          ]
        }
      };
    }
  }
};

export default triageService;

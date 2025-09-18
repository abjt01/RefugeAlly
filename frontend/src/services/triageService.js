import api from './api';

const triageService = {
  submitSymptoms: async (symptomsData) => {
    try {
      const response = await api.post('/api/triage', symptomsData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getEmergencyContacts: async (location) => {
    try {
      const response = await api.get(`/api/emergency-contacts?location=${location}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default triageService;

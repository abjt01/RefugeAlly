import api from './api';

const triageService = {
  submitSymptoms: async (symptomsData) => {
    return await api.post('/api/triage', symptomsData);
  }
};

export default triageService;

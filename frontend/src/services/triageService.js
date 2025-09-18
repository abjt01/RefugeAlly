import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const triageService = {
  submitSymptoms: async (symptomsData) => {
    return axios.post(`${API_BASE_URL}/api/triage`, symptomsData)
      .then(res => res.data)
      .catch(err => { throw err; });
  }
};

export default triageService;

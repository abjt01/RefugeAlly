import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Making API request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`Server error ${status}:`, data);
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request data');
        case 404:
          throw new Error('Service not found');
        case 500:
          throw new Error('Internal server error');
        default:
          throw new Error(data.message || 'Server error occurred');
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.request);
      throw new Error('Unable to connect to server. Please check your internet connection.');
    } else {
      // Other error
      console.error('Request setup error:', error.message);
      throw new Error('Request failed');
    }
  }
);

export default api;
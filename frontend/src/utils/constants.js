// Language options
export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
    { code: 'dari', name: 'Dari', nativeName: 'دری' }
  ];
  
  // Severity levels
  export const SEVERITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    EMERGENCY: 'emergency'
  };
  
  // Severity colors
  export const SEVERITY_COLORS = {
    [SEVERITY_LEVELS.LOW]: '#4caf50',
    [SEVERITY_LEVELS.MEDIUM]: '#ff9800',
    [SEVERITY_LEVELS.HIGH]: '#f44336',
    [SEVERITY_LEVELS.EMERGENCY]: '#d32f2f'
  };
  
  // Common symptoms list
  export const COMMON_SYMPTOMS = [
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
  
  // API endpoints
  export const API_ENDPOINTS = {
    TRIAGE: '/api/triage'
  };
  
  // Voice recognition settings
  export const VOICE_CONFIG = {
    LANGUAGE_CODES: {
      en: 'en-US',
      ar: 'ar-SA',
      dari: 'fa-IR' // Using Persian as closest match for Dari
    },
    RECOGNITION_TIMEOUT: 5000,
    MAX_ALTERNATIVES: 1
  };
  
  // Chat message types
  export const MESSAGE_TYPES = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
  };
  
  // RTL Languages
  export const RTL_LANGUAGES = ['ar', 'dari'];
  
  // Default values
  export const DEFAULTS = {
    LANGUAGE: 'en',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  };
  
  export default {
    SUPPORTED_LANGUAGES,
    SEVERITY_LEVELS,
    SEVERITY_COLORS,
    COMMON_SYMPTOMS,
    API_ENDPOINTS,
    VOICE_CONFIG,
    MESSAGE_TYPES,
    RTL_LANGUAGES,
    DEFAULTS
  };
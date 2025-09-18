import { RTL_LANGUAGES } from './constants';

/**
 * Check if the language is right-to-left
 * @param {string} language - Language code
 * @returns {boolean} True if RTL
 */
export const isRTL = (language) => {
  return RTL_LANGUAGES.includes(language);
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {string} language - Language code for formatting
 * @returns {string} Formatted date string
 */
export const formatDate = (date, language = 'en') => {
  const dateObj = new Date(date);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  try {
    return dateObj.toLocaleDateString(language === 'dari' ? 'fa-AF' : language, options);
  } catch (error) {
    return dateObj.toLocaleDateString('en', options);
  }
};

/**
 * Sanitize text input
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '');
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if Web Speech API is supported
 * @returns {boolean} True if supported
 */
export const isVoiceSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

/**
 * Get browser language
 * @returns {string} Browser language code
 */
export const getBrowserLanguage = () => {
  const language = navigator.language || navigator.userLanguage;
  const langCode = language.split('-')[0].toLowerCase();
  
  // Map to supported languages
  const supportedLangs = ['en', 'ar', 'dari'];
  return supportedLangs.includes(langCode) ? langCode : 'en';
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format error message for display
 * @param {Error|string} error - Error object or message
 * @returns {string} Formatted error message
 */
export const formatError = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(deepClone);
  if (typeof obj === 'object') {
    const cloned = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone(obj[key]);
    });
    return cloned;
  }
};

/**
 * Capitalize first letter of string
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Check if device is mobile
 * @returns {boolean} True if mobile device
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export default {
  isRTL,
  formatDate,
  sanitizeText,
  debounce,
  generateId,
  isVoiceSupported,
  getBrowserLanguage,
  isValidEmail,
  formatError,
  deepClone,
  capitalize,
  isMobileDevice
};
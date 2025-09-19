// src/i18n/i18n.js - FIXED VERSION
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your translation files
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';
import dariTranslations from './locales/dari.json';

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
  dari: { translation: dariTranslations }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    // Add some debugging during development
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;
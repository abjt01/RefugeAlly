import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        title: "RefugeAlly",
        subtitle: "AI Health Assistant"
      },
      symptoms: {
        title: "How are you feeling today?",
        placeholder: "Describe your symptoms..."
      },
      buttons: {
        submit: "Get Health Advice",
        clear: "Clear"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

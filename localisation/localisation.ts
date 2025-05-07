import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import eng from './eng';
import sk from './sk';
import rus from './rus';


i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: Localization.locale.split('-')[0], // 'en', 'sk', 'rus'
  fallbackLng: 'en',
  resources: {
    en: { translation: eng },
    sk: { translation: sk },
    rus: { translation: rus },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

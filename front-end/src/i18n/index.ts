import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  locales,
  defaultLocale,
  messages,
  LOCALE_COOKIE_NAME,
} from '@ormeet/i18n';

const resources = Object.fromEntries(
  locales.map((loc) => [loc, messages[loc]])
);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLocale,
    supportedLngs: [...locales],
    ns: ['common', 'auth', 'attendee', 'organizer'],
    defaultNS: 'common',
    detection: {
      order: ['cookie', 'navigator', 'htmlTag'],
      lookupCookie: LOCALE_COOKIE_NAME,
      caches: ['cookie'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {
  locales,
  defaultLocale,
  messages,
  LOCALE_COOKIE_NAME,
  purgeShadowingLocaleCookie,
} from '@ormeet/i18n';

// Avant toute détection : retirer un ancien cookie propre à l'hôte qui
// masquerait le cookie partagé et figerait la langue sur une seule valeur.
purgeShadowingLocaleCookie();

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
      // Don't let the detector write its own cookie: it would create a
      // host-only cookie (no `domain`) that shadows the shared
      // `.ormeet.com` cookie set explicitly by setLocaleCookie() in
      // LanguageSwitcher, making language changes on the landing page
      // appear to not carry over to the app.
      caches: [],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;

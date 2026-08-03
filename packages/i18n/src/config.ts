export const locales = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const rtlLocales: readonly Locale[] = ['ar'] as const;

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  ar: 'العربية'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  ar: '🇩🇿'
};

// Code BCP 47 complet pour formatage (Intl API)
export const localeFullCodes: Record<Locale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-DZ'  // Algérie
};

export const currencyByLocale: Record<Locale, string> = {
  en: 'DZD',
  fr: 'DZD',
  ar: 'DZD'
};

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

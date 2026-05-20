import { localeFullCodes, currencyByLocale, type Locale } from './config';

export function formatDate(
  date: Date | string | number,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  return new Intl.DateTimeFormat(localeFullCodes[locale], options ?? {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
}

export function formatDateShort(date: Date | string | number, locale: Locale) {
  return formatDate(date, locale, { month: 'short', day: 'numeric' });
}

export function formatTime(date: Date | string | number, locale: Locale) {
  return formatDate(date, locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false  // 24h pour FR et AR-DZ
  });
}

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency?: string
): string {
  return new Intl.NumberFormat(localeFullCodes[locale], {
    style: 'currency',
    currency: currency ?? currencyByLocale[locale]
  }).format(amount);
}

export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(localeFullCodes[locale]).format(num);
}

export function formatRelativeTime(
  date: Date | string | number,
  locale: Locale
): string {
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
  const diff = (d.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(localeFullCodes[locale], {
    numeric: 'auto'
  });
  // Logique simple : choisir l'unité appropriée
  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (Math.abs(diff) < 2592000) return rtf.format(Math.round(diff / 86400), 'day');
  return formatDate(d, locale);
}

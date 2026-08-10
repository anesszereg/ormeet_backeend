import { type Locale, isValidLocale, defaultLocale } from './config';

export const LOCALE_COOKIE_NAME = 'ormeet_locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 an
const COOKIE_MAX_AGE = LOCALE_COOKIE_MAX_AGE;

/**
 * Domaine du cookie pour partage entre www.ormeet.com et app.ormeet.com
 * En prod : ".ormeet.com" (avec point pour inclure les sous-domaines)
 * En dev : undefined (utilise localhost par défaut)
 */
export function cookieDomainForHost(hostname: string): string | undefined {
  // Retire un éventuel port ("localhost:3001") — absent du hostname côté
  // navigateur, mais présent dans l'en-tête Host côté serveur.
  const host = hostname.split(':')[0];
  if (host === 'localhost' || host.startsWith('127.')) {
    return undefined;
  }
  // Extrait le domaine principal (ex: "ormeet.com" depuis "www.ormeet.com")
  const parts = host.split('.');
  if (parts.length >= 2) {
    return '.' + parts.slice(-2).join('.');
  }
  return undefined;
}

export function getCookieDomain(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return cookieDomainForHost(window.location.hostname);
}

export function getLocaleCookie(): Locale | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(^| )' + LOCALE_COOKIE_NAME + '=([^;]+)')
  );
  if (!match) return null;
  const value = decodeURIComponent(match[2]);
  return isValidLocale(value) ? value : null;
}

/**
 * Supprime un éventuel cookie de langue propre à l'hôte courant, qui masquerait
 * le cookie partagé du domaine parent. À appeler une fois au démarrage : sans
 * ça, un utilisateur ayant un ancien cookie host-only reste bloqué sur une
 * langue tant qu'il ne vide pas son navigateur.
 *
 * Une suppression sans `domain` ne vise que le cookie host-only : le cookie
 * partagé sur `.ormeet.com` n'est pas touché.
 */
export function purgeShadowingLocaleCookie(): void {
  if (typeof document === 'undefined') return;
  const domain = getCookieDomain();
  if (!domain) return; // en local, le cookie host-only est le bon
  const cookies = document.cookie.split('; ').filter((c) => c.startsWith(`${LOCALE_COOKIE_NAME}=`));
  if (cookies.length > 1) {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function setLocaleCookie(locale: Locale): void {
  if (typeof document === 'undefined') return;
  const domain = getCookieDomain();

  // Purge d'un éventuel cookie de même nom propre à l'hôte courant. Quand deux
  // cookies portent le même nom, le navigateur renvoie le plus spécifique en
  // premier : un ancien cookie host-only (écrit avant `caches: []`) masquait le
  // cookie partagé sur le domaine parent et figeait la langue. Sans cette
  // purge, seuls les utilisateurs vidant leurs cookies seraient débloqués.
  if (domain) {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }

  const domainPart = domain ? `; domain=${domain}` : '';
  document.cookie =
    `${LOCALE_COOKIE_NAME}=${locale}; ` +
    `path=/; ` +
    `max-age=${COOKIE_MAX_AGE}; ` +
    `SameSite=Lax` +
    domainPart;
}

/**
 * Résout la locale active selon priorité :
 * 1. Profil utilisateur (passé en argument)
 * 2. Cookie partagé
 * 3. Header Accept-Language (navigateur)
 * 4. Défaut
 */
export function resolveLocale(userPreference?: string | null): Locale {
  if (userPreference && isValidLocale(userPreference)) {
    return userPreference;
  }
  const cookieLocale = getLocaleCookie();
  if (cookieLocale) return cookieLocale;
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0];
    if (isValidLocale(browserLang)) return browserLang;
  }
  return defaultLocale;
}

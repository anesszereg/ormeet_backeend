import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import {
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  cookieDomainForHost
} from '@ormeet/i18n';

const handleI18nRouting = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
  // Par défaut next-intl lit/écrit son propre cookie (`NEXT_LOCALE`), alors que
  // le reste du projet (app Vite + packages/i18n) utilise `ormeet_locale`.
  // Sans cet alignement, la langue choisie ailleurs est ignorée au retour ici.
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: 'lax',
    path: '/'
  }
});

export default function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);

  // next-intl pose le cookie sur l'hôte courant uniquement. En production, la
  // landing (www.ormeet.com) et l'app (app.ormeet.com) doivent partager le même
  // cookie : on le repose sur le domaine parent, comme le fait setLocaleCookie()
  // côté navigateur. `set` est indexé par nom, donc ça remplace l'en-tête au
  // lieu d'en ajouter un second. En local, le domaine est vide et rien ne change.
  const localeCookie = response.cookies.get(LOCALE_COOKIE_NAME);
  const domain = cookieDomainForHost(request.headers.get('host') ?? '');
  if (localeCookie && domain) {
    response.cookies.set(LOCALE_COOKIE_NAME, localeCookie.value, {
      path: '/',
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: 'lax',
      domain
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

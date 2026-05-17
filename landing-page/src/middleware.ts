import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@ormeet/i18n';

export default createMiddleware({
  locales: [...locales],
  defaultLocale,
  localeDetection: true,
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

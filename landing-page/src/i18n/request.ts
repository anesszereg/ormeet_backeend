import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import {
  locales,
  messages as sharedMessages,
  type Locale
} from '@ormeet/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const loc = locale as Locale;
  return {
    locale: loc,
    messages: {
      common: sharedMessages[loc].common,
      landing: sharedMessages[loc].landing,
      auth: sharedMessages[loc].auth
    }
  };
});

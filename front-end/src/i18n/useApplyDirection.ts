import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRtl, type Locale } from '@ormeet/i18n';

export function useApplyDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const locale = i18n.language as Locale;
    const dir = isRtl(locale) ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.body.classList.toggle('font-arabic', dir === 'rtl');
  }, [i18n.language]);
}

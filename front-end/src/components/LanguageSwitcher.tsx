import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BsGlobe2, BsCheck2 } from 'react-icons/bs';
import { locales, localeNames, localeFlags, setLocaleCookie, type Locale } from '@ormeet/i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLocale = i18n.language as Locale;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (loc: Locale) => {
    if (loc === currentLocale) {
      setOpen(false);
      return;
    }
    setLocaleCookie(loc);
    i18n.changeLanguage(loc);
    setOpen(false);
    // Force a full re-render of the app to ensure all components
    // (dates, currencies, formats) use the new locale immediately
    window.location.reload();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary-light transition-colors cursor-pointer"
        aria-label="Change language"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <BsGlobe2 className="w-5 h-5 text-dark-gray" />
        <span className="text-sm font-medium text-dark-gray uppercase rtl:normal-case">
          {currentLocale}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 bg-white shadow-lg rounded-xl py-2 min-w-[180px] z-50 border border-light-gray"
        >
          {locales.map((loc) => {
            const isActive = loc === currentLocale;
            return (
              <button
                key={loc}
                role="menuitem"
                onClick={() => switchTo(loc)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors text-start ${
                  isActive
                    ? 'bg-primary-light text-primary font-semibold'
                    : 'text-dark-gray hover:bg-secondary-light'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                </span>
                {isActive && <BsCheck2 className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;

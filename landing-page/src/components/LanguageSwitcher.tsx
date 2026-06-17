"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  locales,
  localeNames,
  setLocaleCookie,
  type Locale,
} from "@ormeet/i18n";

interface LanguageSwitcherProps {
  /** "dropdown" (default): globe trigger + floating dropdown — desktop use.
   *  "inline": flat list of full-width buttons — for the mobile drawer. */
  variant?: "dropdown" | "inline";
  /** Called after a locale switch — useful for the drawer to close itself. */
  onSwitch?: () => void;
}

export function LanguageSwitcher({ variant = "dropdown", onSwitch }: LanguageSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("landing.languageSwitcher");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTo = (locale: Locale) => {
    setLocaleCookie(locale);
    const newPath = pathname.replace(/^\/(en|fr|ar)/, `/${locale}`);
    router.push(newPath);
    router.refresh();
    setOpen(false);
    onSwitch?.();
  };

  if (variant === "inline") {
    return (
      <div className="flex flex-col gap-1">
        {locales.map((loc) => {
          const isActive = loc === currentLocale;
          return (
            <button
              key={loc}
              onClick={() => switchTo(loc)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors text-start ${
                isActive
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-black hover:bg-secondary-light"
              }`}
            >
              <span>{localeNames[loc]}</span>
              {isActive && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8L7 12L13 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex items-center gap-1.5 text-sm font-medium text-black hover:text-primary transition-colors cursor-pointer"
        aria-label={t("label")}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <ellipse
            cx="10"
            cy="10"
            rx="4"
            ry="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M1 10H19"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3 5.5H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M3 14.5H17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="uppercase rtl:normal-case">{currentLocale}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full mt-2 bg-white border border-light-gray shadow-lg rounded-xl py-2 min-w-[180px] z-50"
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
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-black hover:bg-secondary-light"
                }`}
              >
                <span>{localeNames[loc]}</span>
                {isActive && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8L7 12L13 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;

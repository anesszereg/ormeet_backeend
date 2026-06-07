"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Main app URL - update this for production
const MAIN_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

const Navbar = () => {
  const t = useTranslations("common.nav");
  const locale = useLocale();
  const home = `/${locale}`;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState(`${MAIN_APP_URL}/dashboard-attendee`);

  useEffect(() => {
    const LS_KEY = 'ormeet_lp_auth';

    // 1. Check URL params — set when navigating cross-origin from the React app
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get('auth');
    const roleParam = params.get('role') || 'attendee';

    if (authParam === '1') {
      setIsLoggedIn(true);
      if (roleParam === 'organizer') {
        setDashboardUrl(`${MAIN_APP_URL}/dashboard-organizer`);
      }
      // Persist for subsequent landing page visits
      localStorage.setItem(LS_KEY, JSON.stringify({ loggedIn: true, role: roleParam }));
      // Clean params from URL without a page reload
      const clean = new URL(window.location.href);
      clean.searchParams.delete('auth');
      clean.searchParams.delete('role');
      window.history.replaceState({}, '', clean.toString());
      return;
    }

    // 2. Check landing-page-specific localStorage (set on a previous visit)
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.loggedIn) {
          setIsLoggedIn(true);
          if (parsed.role === 'organizer') {
            setDashboardUrl(`${MAIN_APP_URL}/dashboard-organizer`);
          }
          return;
        }
      }
    } catch { /* ignore */ }

    // 3. Same-origin fallback (dev: both apps on localhost)
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const userRaw = localStorage.getItem('user');
        if (userRaw) {
          const parsed = JSON.parse(userRaw);
          if (parsed?.role === 'organizer') {
            setDashboardUrl(`${MAIN_APP_URL}/dashboard-organizer`);
          }
        }
      } catch { /* ignore */ }
    }
  }, []);

  return (
    <nav className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-4 flex items-center justify-between bg-white">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-8">
        {/* Logo */}
        <Link href={home} className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/svgs/Logo.svg"
            alt="Ormeet Logo"
            width={28}
            height={38}
            priority
          />
          <span className="text-xl font-bold text-black">Ormeet</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href={`${MAIN_APP_URL}/host-events`}
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            {t("hostEvents")}
          </a>
          <a
            href={`${MAIN_APP_URL}/support`}
            className="text-sm font-medium text-black hover:text-primary transition-colors"
          >
            {t("support")}
          </a>
        </div>
      </div>

      {/* Right: Language + Auth Buttons */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <LanguageSwitcher />

        {isLoggedIn ? (
          /* Logged-in: show Dashboard button */
          <a
            href={dashboardUrl}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
          >
            {t("dashboard")}
          </a>
        ) : (
          <>
            {/* Log In Button */}
            <a
              href={`${MAIN_APP_URL}/onboarding-choice`}
              className="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
            >
              {t("login")}
            </a>

            {/* Sign Up Button */}
            <a
              href={`${MAIN_APP_URL}/onboarding-choice`}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
            >
              {t("signup")}
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

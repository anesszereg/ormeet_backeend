"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Main app URL - update this for production
const MAIN_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

const Navbar = () => {
  const t = useTranslations("common.nav");
  const locale = useLocale();
  const home = `/${locale}`;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  /** Body scroll lock */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  /** Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeDrawer]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardUrl, setDashboardUrl] = useState(
    `${MAIN_APP_URL}/dashboard-attendee`,
  );

  useEffect(() => {
    const LS_KEY = "ormeet_lp_auth";
    const params = new URLSearchParams(window.location.search);

    // Helper: apply role and persist to localStorage for back-button survival
    const applyAuth = (role: string) => {
      setIsLoggedIn(true);
      if (role === "organizer")
        setDashboardUrl(`${MAIN_APP_URL}/dashboard-organizer`);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ role, ts: Date.now() }));
      } catch {
        /* ignore */
      }
    };

    // 0. Logout signal — clear any persisted state and show login/signup
    if (params.get("logout") === "1") {
      try {
        localStorage.removeItem(LS_KEY);
      } catch {
        /* ignore */
      }
      const clean = new URL(window.location.href);
      clean.searchParams.delete("logout");
      window.history.replaceState({}, "", clean.toString());
      return;
    }

    // 1. Cookie (works on localhost and with proper subdomain setup in production)
    const cookieMatch = document.cookie.match(/(?:^|;\s*)ormeet_auth=([^;]+)/);
    if (cookieMatch) {
      applyAuth(cookieMatch[1]);
      return;
    }

    // 2. URL params (passed by handleLogoClick / redirectAfterLogin on cross-origin navigation)
    const authParam = params.get("auth");
    const roleParam = params.get("role") || "attendee";
    const redirectUrl = params.get("redirect");
    if (authParam === "1") {
      applyAuth(roleParam);
      if (redirectUrl) {
        // Login flow: bounce through landing page to set localStorage, then forward to dashboard
        window.location.href = redirectUrl;
        return;
      }
      const clean = new URL(window.location.href);
      clean.searchParams.delete("auth");
      clean.searchParams.delete("role");
      window.history.replaceState({}, "", clean.toString());
      return;
    }

    // 3. localStorage fallback (persists across back-button / direct URL visits)
    //    Expires after 7 days to avoid stale state after eventual logout.
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as { role: string; ts: number };
        const SEVEN_DAYS = 7 * 24 * 3600 * 1000;
        if (stored?.ts && Date.now() - stored.ts < SEVEN_DAYS) {
          applyAuth(stored.role);
        } else {
          localStorage.removeItem(LS_KEY); // expired — clean up
        }
      }
    } catch {
      try {
        localStorage.removeItem(LS_KEY);
      } catch {
        /* ignore */
      }
    }
  }, []);

  return (
    <>
      <nav className="w-full px-4 md:px-10 lg:px-16 xl:px-20 py-4 flex items-center justify-between bg-white">
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

          {/* Nav Links — desktop only */}
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

        {/* Right: desktop = Language + Auth Buttons / mobile = Hamburger */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <LanguageSwitcher />

          {isLoggedIn ? (
            /* Logged-in: show Dashboard button — desktop only */
            <a
              href={dashboardUrl}
              className="hidden md:inline-flex px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
            >
              {t("dashboard")}
            </a>
          ) : (
            <>
              {/* Log In — desktop only */}
              <a
                href={`${MAIN_APP_URL}/onboarding-choice`}
                className="hidden md:inline-flex px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
              >
                {t("login")}
              </a>

              {/* Sign Up — desktop only */}
              <a
                href={`${MAIN_APP_URL}/onboarding-choice`}
                className="hidden md:inline-flex px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
              >
                {t("signup")}
              </a>
            </>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={openDrawer}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary-light transition-colors cursor-pointer"
            aria-label={t("openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 6h16M3 11h16M3 16h16"
                stroke="#181818"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          aria-hidden="true"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={t("openMenu")}
        className={`fixed inset-y-0 end-0 z-50 w-[280px] max-w-[85vw] bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen
            ? "translate-x-0"
            : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
          <Link
            href={home}
            onClick={closeDrawer}
            className="flex items-center gap-2"
          >
            <Image
              src="/svgs/Logo.svg"
              alt="Ormeet Logo"
              width={24}
              height={32}
            />
            <span className="text-lg font-bold text-black">Ormeet</span>
          </Link>
          <button
            onClick={closeDrawer}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary-light transition-colors cursor-pointer"
            aria-label={t("closeMenu")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="#181818"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            <a
              href={`${MAIN_APP_URL}/host-events`}
              onClick={closeDrawer}
              className="flex items-center py-3 px-4 rounded-xl text-sm font-medium text-black hover:bg-secondary-light hover:text-primary transition-colors"
            >
              {t("hostEvents")}
            </a>
            <a
              href={`${MAIN_APP_URL}/support`}
              onClick={closeDrawer}
              className="flex items-center py-3 px-4 rounded-xl text-sm font-medium text-black hover:bg-secondary-light hover:text-primary transition-colors"
            >
              {t("support")}
            </a>
          </nav>

          {/* Language switcher — inline variant */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-medium-gray mb-2 px-4">
              Language
            </p>
            <LanguageSwitcher variant="inline" onSwitch={closeDrawer} />
          </div>
        </div>

        {/* Drawer footer — CTAs */}
        <div className="px-5 py-5 border-t border-light-gray flex flex-col gap-3">
          {isLoggedIn ? (
            <a
              href={dashboardUrl}
              onClick={closeDrawer}
              className="flex items-center justify-center h-12 w-full text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
            >
              {t("dashboard")}
            </a>
          ) : (
            <>
              <a
                href={`${MAIN_APP_URL}/onboarding-choice`}
                onClick={closeDrawer}
                className="flex items-center justify-center h-12 w-full text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
              >
                {t("login")}
              </a>
              <a
                href={`${MAIN_APP_URL}/onboarding-choice`}
                onClick={closeDrawer}
                className="flex items-center justify-center h-12 w-full text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
              >
                {t("signup")}
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;

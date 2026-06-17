"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  /** Close on Escape */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [closeDrawer]);

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
            <Link
              href="/browse"
              className="text-sm font-medium text-black hover:text-primary transition-colors"
            >
              {t("browseEvents")}
            </Link>
            <Link
              href="/host"
              className="text-sm font-medium text-black hover:text-primary transition-colors"
            >
              {t("hostEvents")}
            </Link>
            <Link
              href="/support"
              className="text-sm font-medium text-black hover:text-primary transition-colors"
            >
              {t("support")}
            </Link>
          </div>
        </div>

        {/* Right: desktop = Language + Auth Buttons / mobile = Hamburger */}
        <div className="flex items-center gap-4">
          {/* Language Selector — desktop only */}
          <LanguageSwitcher />

          {/* Log In — desktop only */}
          <Link
            href="/login"
            className="hidden md:inline-flex px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
          >
            {t("login")}
          </Link>

          {/* Sign Up — desktop only */}
          <Link
            href="/register"
            className="hidden md:inline-flex px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
          >
            {t("signup")}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={openDrawer}
            className="md:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary-light transition-colors cursor-pointer"
            aria-label={t("openMenu")}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M3 6h16M3 11h16M3 16h16" stroke="#181818" strokeWidth="1.8" strokeLinecap="round" />
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
          drawerOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-light-gray">
          <Link
            href={home}
            onClick={closeDrawer}
            className="flex items-center gap-2"
          >
            <Image src="/svgs/Logo.svg" alt="Ormeet Logo" width={24} height={32} />
            <span className="text-lg font-bold text-black">Ormeet</span>
          </Link>
          <button
            onClick={closeDrawer}
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-secondary-light transition-colors cursor-pointer"
            aria-label={t("closeMenu")}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" stroke="#181818" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          {/* Nav links */}
          <nav className="flex flex-col gap-1">
            <Link
              href="/browse"
              onClick={closeDrawer}
              className="flex items-center py-3 px-4 rounded-xl text-sm font-medium text-black hover:bg-secondary-light hover:text-primary transition-colors"
            >
              {t("browseEvents")}
            </Link>
            <Link
              href="/host"
              onClick={closeDrawer}
              className="flex items-center py-3 px-4 rounded-xl text-sm font-medium text-black hover:bg-secondary-light hover:text-primary transition-colors"
            >
              {t("hostEvents")}
            </Link>
            <Link
              href="/support"
              onClick={closeDrawer}
              className="flex items-center py-3 px-4 rounded-xl text-sm font-medium text-black hover:bg-secondary-light hover:text-primary transition-colors"
            >
              {t("support")}
            </Link>
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
          <Link
            href="/login"
            onClick={closeDrawer}
            className="flex items-center justify-center h-12 w-full text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            onClick={closeDrawer}
            className="flex items-center justify-center h-12 w-full text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
          >
            {t("signup")}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;

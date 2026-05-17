"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar = () => {
  const t = useTranslations("common.nav");
  const locale = useLocale();
  const home = `/${locale}`;

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

      {/* Right: Language + Auth Buttons */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <LanguageSwitcher />

        {/* Log In Button */}
        <Link
          href="/login"
          className="px-5 py-2 text-sm font-semibold text-primary border border-primary rounded-full hover:bg-primary-light transition-colors"
        >
          {t("login")}
        </Link>

        {/* Sign Up Button */}
        <Link
          href="/register"
          className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
        >
          {t("signup")}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;

"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  popularWilayas,
  searchWilayas,
  wilayaLabel,
  type Locale,
} from "@ormeet/i18n";

import { FRONTEND_ORIGIN } from "@/lib/constants";

/** Nombre de wilayas proposées à la fois, pour garder la liste lisible. */
const MAX_SUGGESTIONS = 10;

const HeroSection = () => {
  const tHero = useTranslations("landing.hero");
  const tSearch = useTranslations("landing.search");
  const locale = useLocale() as Locale;
  const [where, setWhere] = useState("");
  const [what, setWhat] = useState("");
  const [showWilayas, setShowWilayas] = useState(false);
  const whereRef = useRef<HTMLDivElement>(null);

  // Avant toute saisie : les 10 wilayas principales. Dès la première frappe :
  // recherche sur les 58, par numéro ou par nom dans les trois langues.
  const wilayaSuggestions = useMemo(
    () =>
      where.trim()
        ? searchWilayas(where, locale).slice(0, MAX_SUGGESTIONS)
        : popularWilayas,
    [where, locale]
  );

  /** Referme la liste au clic en dehors du champ */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (whereRef.current && !whereRef.current.contains(e.target as Node)) {
        setShowWilayas(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Build the search URL and redirect to the front-end search-results page */
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (where.trim()) params.set("location", where.trim());
    if (what.trim()) params.set("event", what.trim());

    const query = params.toString();
    const url = `${FRONTEND_ORIGIN}/search-results${query ? `?${query}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [where, what]);

  /** Allow pressing Enter in either input to trigger search */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setShowWilayas(false);
        handleSearch();
      } else if (e.key === "Escape") {
        setShowWilayas(false);
      }
    },
    [handleSearch]
  );

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Headline */}
      <h1 className="text-4xl md:text-5xl text-center text-black mb-4">
        {tHero.rich("title", {
          b: (chunks) => <span className="font-bold">{chunks}</span>,
        })}
      </h1>

      {/* Subtitle */}
      <p className="text-base text-muted text-center mb-8 max-w-[600px] px-4">
        {tHero("subtitle")}
      </p>

      {/* Search Bar */}
      <div className="w-full max-w-[560px] mx-auto px-4 mb-10">
        <div className="flex items-center bg-white border border-light-gray rounded-full shadow-sm hover:shadow-md transition-shadow h-[52px]">
          {/* Location Icon — flush left */}
          <div className="shrink-0 ps-1">
            <Image
              src="/svgs/landingPage/location.svg"
              alt={tSearch("locationAlt")}
              width={42}
              height={42}
            />
          </div>

          {/* Where Section */}
          <div className="relative flex flex-col flex-1 min-w-0 ps-2" ref={whereRef}>
            <span className="text-xs font-semibold text-black leading-tight">
              {tSearch("whereLabel")}
            </span>
            <input
              type="text"
              value={where}
              onChange={(e) => {
                setWhere(e.target.value);
                setShowWilayas(true);
              }}
              onFocus={() => setShowWilayas(true)}
              onKeyDown={handleKeyDown}
              placeholder={tSearch("wherePlaceholder")}
              className="text-sm font-medium text-black bg-transparent outline-none placeholder:text-input-gray placeholder:font-normal w-full"
              role="combobox"
              aria-expanded={showWilayas}
              aria-controls="wilaya-listbox"
              aria-autocomplete="list"
              autoComplete="off"
            />

            {showWilayas && wilayaSuggestions.length > 0 && (
              <ul
                id="wilaya-listbox"
                role="listbox"
                className="absolute start-0 top-full mt-3 w-[240px] max-w-[80vw] max-h-[380px] overflow-y-auto bg-white border border-light-gray rounded-2xl shadow-lg py-2 z-50"
              >
                {wilayaSuggestions.map((wilaya) => (
                  <li key={wilaya.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={where === wilaya[locale]}
                      onClick={() => {
                        setWhere(wilaya[locale]);
                        setShowWilayas(false);
                      }}
                      className="w-full px-4 py-2 text-start text-sm text-black hover:bg-secondary-light transition-colors cursor-pointer"
                    >
                      {wilayaLabel(wilaya, locale)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-light-gray shrink-0"></div>

          {/* What Section */}
          <div className="flex flex-col flex-1 min-w-0 ps-4">
            <span className="text-xs font-semibold text-black leading-tight">
              {tSearch("whatLabel")}
            </span>
            <input
              type="text"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tSearch("whatPlaceholder")}
              className="text-sm font-medium text-black bg-transparent outline-none placeholder:text-input-gray placeholder:font-normal w-full"
            />
          </div>

          {/* Search Button — flush right */}
          <button
            onClick={handleSearch}
            className="shrink-0 pe-1 cursor-pointer hover:scale-105 transition-transform"
            aria-label={tSearch("buttonAria")}
          >
            <Image
              src="/svgs/landingPage/search.svg"
              alt={tSearch("buttonAria")}
              width={46}
              height={46}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

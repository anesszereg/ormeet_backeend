"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { popularWilayas, type Locale, type Wilaya } from "@ormeet/i18n";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { key: "all", label: "All Categories" },
  { key: "music", label: "Music" },
  { key: "sports", label: "Sports" },
  { key: "foodDrink", label: "Food & Drink" },
  { key: "artPerformance", label: "Art & Performance" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];
type Category = (typeof CATEGORIES)[number]["label"];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop";

/* ------------------------------------------------------------------ */
/*  Component props                                                    */
/* ------------------------------------------------------------------ */

interface DiscoverSectionProps {
  /** Real events fetched from the backend. */
  events: LandingEvent[];
  /** True after the fetch settled. */
  hasLoaded: boolean;
  /** Callback when user selects a different wilaya */
  onWilayaChange?: (wilaya: Wilaya) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * Map a free-form backend category (e.g. "Music", "music",
 * "Open-mic night") onto one of our pill buckets. Anything that doesn't
 * match a known bucket falls into "Art & Performance" so it still shows
 * up under at least one filter.
 */
const bucketFor = (raw: string): Category => {
  const c = raw.trim().toLowerCase();
  if (!c) return "Art & Performance";
  if (
    c.includes("music") ||
    c.includes("concert") ||
    c.includes("dj") ||
    c.includes("party")
  ) return "Music";
  if (
    c.includes("sport") ||
    c.includes("marathon") ||
    c.includes("game") ||
    c.includes("football") ||
    c.includes("soccer")
  ) return "Sports";
  if (
    c.includes("food") ||
    c.includes("drink") ||
    c.includes("wine") ||
    c.includes("dine") ||
    c.includes("tasting")
  ) return "Food & Drink";
  return "Art & Performance";
};

const DiscoverSection = ({
  events,
  hasLoaded,
  onWilayaChange,
}: DiscoverSectionProps) => {
  const t = useTranslations("landing.discover");
  const locale = useLocale() as Locale;
  const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };
  // Alger par défaut : marché principal de la plateforme.
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya>(popularWilayas[0]);
  const [activeCategoryKey, setActiveCategoryKey] = useState<CategoryKey>("all");
  const activeCategory = useMemo<Category>(
    () => CATEGORIES.find((c) => c.key === activeCategoryKey)!.label,
    [activeCategoryKey]
  );
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWilayaSelect = useCallback(
    (wilaya: Wilaya) => {
      setSelectedWilaya(wilaya);
      setIsCityDropdownOpen(false);
      onWilayaChange?.(wilaya);
    },
    [onWilayaChange]
  );

  /**
   * "All Categories" shows up to 6 most-recent real events; selecting
   * a specific bucket filters by its mapped category.
   */
  const filteredEvents = useMemo(() => {
    if (activeCategory === "All Categories") {
      return events.slice(0, 6);
    }
    return events.filter((e) => bucketFor(e.category) === activeCategory);
  }, [events, activeCategory]);

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Heading — city name is dynamic */}
      <h2 className="text-2xl md:text-3xl text-center text-black mb-8">
        <span className="font-bold">{t("headingPrefix")}</span> {t("headingMiddle")}{" "}
        <span className="font-bold">{selectedWilaya[locale]}</span>
      </h2>

      {/* Location + Categories Row */}
      <div className="flex flex-wrap items-center justify-center gap-4 px-4">
        {/* Location Selector (dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCityDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 px-4 py-2.5 border border-light-gray rounded-full bg-white min-w-[220px] cursor-pointer hover:border-primary transition-colors"
            aria-haspopup="listbox"
            aria-expanded={isCityDropdownOpen}
          >
            {/* Location icon — moved to far left, slightly larger */}
            <Image
              src="/svgs/landingPage/location.svg"
              alt={t("locationAlt")}
              width={38}
              height={38}
              className="shrink-0 -ms-1"
            />
            <span className="text-sm font-medium text-black flex-1 text-start">
              {selectedWilaya[locale]}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`shrink-0 transition-transform duration-200 ${
                isCityDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#181818"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isCityDropdownOpen && (
            <ul
              role="listbox"
              className="absolute top-full start-0 mt-2 w-full bg-white border border-light-gray rounded-xl shadow-lg z-30 py-1 max-h-[280px] overflow-y-auto"
            >
              {popularWilayas.map((wilaya) => (
                <li
                  key={wilaya.code}
                  role="option"
                  aria-selected={wilaya.code === selectedWilaya.code}
                  onClick={() => handleWilayaSelect(wilaya)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    wilaya.code === selectedWilaya.code
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-black hover:bg-secondary-light"
                  }`}
                >
                  {wilaya[locale]}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-light-gray hidden md:block" />

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategoryKey(category.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer ${
                activeCategoryKey === category.key
                  ? "bg-black text-white"
                  : "bg-white text-black border border-light-gray hover:bg-secondary-light"
              }`}
            >
              {t(`categories.${category.key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid — filtered by category */}
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="group cursor-pointer"
              onClick={() => window.open(`${FRONTEND_ORIGIN}/event/${event.id}`, "_blank", "noopener,noreferrer")}
            >
              {/* Image */}
              <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] rounded-2xl overflow-hidden mb-3">
                <Image
                  src={event.image || FALLBACK_IMAGE}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {/* Category badge overlay */}
                {event.category && (
                  <span className="absolute top-3 start-3 px-3 py-1 text-xs font-medium bg-black/60 text-white rounded-full backdrop-blur-sm">
                    {event.category}
                  </span>
                )}
              </div>

              {/* Info */}
              <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">
                {event.title}
              </h3>
              <p className="text-sm text-medium-gray mb-1.5">
                {event.date && (
                  <><bdi>{new Date(event.date).toLocaleDateString(
                    localeMap[locale] || 'en-US',
                    { month: 'short', day: 'numeric' }
                  )}</bdi> • </>
                )}
                {event.venue}
              </p>
              {event.price && (
                <span className="text-sm font-semibold text-black">
                  {t.rich("fromPrice", {
                    price: event.price,
                    bdi: (chunks) => <bdi>{chunks}</bdi>
                  })}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Empty state */}
        {hasLoaded && filteredEvents.length === 0 && (
          <p className="text-center text-medium-gray py-12 text-sm">
            {t("empty")}
          </p>
        )}
      </div>
    </section>
  );
};

export default DiscoverSection;

"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { eventCategories, popularWilayas, type Locale, type Wilaya } from "@ormeet/i18n";
import { matchesCategory, matchesWilaya, upcomingOnly, bySoonest } from "@/lib/eventFilters";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

/** Nombre d'événements affichés sans filtre de catégorie. */
const MAX_EVENTS = 6;

/**
 * Catégories mises en avant dans cette section, dans l'ordre voulu. Le
 * référentiel complet (15 catégories) reste disponible via la recherche et la
 * section « Trouvez des événements qui vous ressemblent ».
 */
const DISCOVER_CATEGORY_KEYS = [
  "business",
  "tech",
  "conference",
  "comedy",
  "workshop",
] as const;

const DISCOVER_CATEGORIES = DISCOVER_CATEGORY_KEYS.map(
  (key) => eventCategories.find((c) => c.key === key),
).filter((c): c is (typeof eventCategories)[number] => Boolean(c));

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
  /** Wilaya sélectionnée, ou null pour « toutes les wilayas ». */
  onWilayaChange?: (wilaya: Wilaya | null) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DiscoverSection = ({
  events,
  hasLoaded,
  onWilayaChange,
}: DiscoverSectionProps) => {
  const t = useTranslations("landing.discover");
  const tCategories = useTranslations("common.eventCategories");
  const locale = useLocale() as Locale;
  const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };
  // null = toutes les wilayas, valeur par défaut : on montre tout le catalogue
  // avant que l'utilisateur ne restreigne à une wilaya.
  const [selectedWilaya, setSelectedWilaya] = useState<Wilaya | null>(null);
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>("all");
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
    (wilaya: Wilaya | null) => {
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
  /**
   * La section annonce « les événements à {wilaya} » : elle doit donc filtrer
   * sur le lieu, ce qu'elle ne faisait pas — seul le titre changeait. On croise
   * maintenant wilaya ET catégorie, en écartant les événements passés.
   */
  const filteredEvents = useMemo(() => {
    const inWilaya = upcomingOnly(events)
      .filter((e) => (selectedWilaya ? matchesWilaya(e, selectedWilaya) : true))
      .sort(bySoonest);
    if (activeCategoryKey === "all") return inWilaya.slice(0, MAX_EVENTS);
    const category = eventCategories.find((c) => c.key === activeCategoryKey);
    if (!category) return [];
    return inWilaya
      .filter((e) => matchesCategory(e, category.key, category.searchTerm))
      .slice(0, MAX_EVENTS);
  }, [events, activeCategoryKey, selectedWilaya]);

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Heading — city name is dynamic */}
      <h2 className="text-2xl md:text-3xl text-center text-black mb-8">
        {/* Sans wilaya, on emploie la variante sans préposition : « les
            événements à » ne se dit pas devant « partout en Algérie ». */}
        <span className="font-bold">{t("headingPrefix")}</span>{" "}
        {selectedWilaya ? t("headingMiddle") : t("headingMiddleEverywhere")}{" "}
        <span className="font-bold">
          {selectedWilaya ? selectedWilaya[locale] : t("headingEverywhere")}
        </span>
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
              {selectedWilaya ? selectedWilaya[locale] : t("allWilayas")}
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
              {/* Choix par défaut : tout le catalogue, sans restriction de lieu */}
              <li
                role="option"
                aria-selected={selectedWilaya === null}
                onClick={() => handleWilayaSelect(null)}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-light-gray ${
                  selectedWilaya === null
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-black hover:bg-secondary-light"
                }`}
              >
                {t("allWilayas")}
              </li>
              {popularWilayas.map((wilaya) => (
                <li
                  key={wilaya.code}
                  role="option"
                  aria-selected={wilaya.code === selectedWilaya?.code}
                  onClick={() => handleWilayaSelect(wilaya)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    wilaya.code === selectedWilaya?.code
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

        {/* Pastilles de catégories — issues du référentiel partagé, pour que le
            filtre corresponde à ce que l'organisateur a réellement choisi. */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            onClick={() => setActiveCategoryKey("all")}
            className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer ${
              activeCategoryKey === "all"
                ? "bg-black text-white"
                : "bg-white text-black border border-light-gray hover:bg-secondary-light"
            }`}
          >
            {t("categories.all")}
          </button>
          {DISCOVER_CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategoryKey(category.key)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer ${
                activeCategoryKey === category.key
                  ? "bg-black text-white"
                  : "bg-white text-black border border-light-gray hover:bg-secondary-light"
              }`}
            >
              {tCategories(category.key)}
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
            {selectedWilaya
              ? t("empty", { wilaya: selectedWilaya[locale] })
              : t("emptyEverywhere")}
          </p>
        )}
      </div>
    </section>
  );
};

export default DiscoverSection;

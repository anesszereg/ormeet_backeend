"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { type Locale, type Wilaya } from "@ormeet/i18n";
import { matchesWilaya, upcomingOnly, bySoonest } from "@/lib/eventFilters";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const FALLBACK_IMAGE = "/images/landingPage/event-myticket-2.jpg";

const CARDS_PER_PAGE = 3;

interface EventsInCaliforniaProps {
  /** Real events fetched from the backend. */
  events: LandingEvent[];
  /** True after the fetch settled. */
  hasLoaded: boolean;
  /** Wilaya sélectionnée, ou null pour « toutes les wilayas ». */
  selectedWilaya: Wilaya | null;
}

const EventsInCalifornia = ({
  events,
  hasLoaded,
  selectedWilaya,
}: EventsInCaliforniaProps) => {
  const t = useTranslations("landing.city");
  const locale = useLocale() as Locale;
  const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };
  // Événements à venir de la wilaya choisie, les plus proches en premier.
  // Sans wilaya sélectionnée, tout le catalogue à venir.
  const filtered = useMemo(() => {
    const upcoming = upcomingOnly(events);
    const scoped = selectedWilaya
      ? upcoming.filter((e) => matchesWilaya(e, selectedWilaya))
      : upcoming;
    return [...scoped].sort(bySoonest);
  }, [events, selectedWilaya]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE));
  const { page, handlePrev, handleNext } = usePagination({ totalPages });

  if (!hasLoaded) return null;
  if (filtered.length === 0) return null;
  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = filtered.slice(startIndex, startIndex + CARDS_PER_PAGE);

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          {selectedWilaya ? (
            <>
              {t("headingPrefix")} <span className="font-bold">{selectedWilaya[locale]}</span>
            </>
          ) : (
            <span className="font-bold">{t("headingEverywhere")}</span>
          )}
        </h2>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
          size="sm"
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentEvents.map((event) => (
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
            <div className="flex items-center gap-2 flex-wrap">
              {event.price && (
                <span className="text-sm font-semibold text-black">
                  {t.rich("fromPrice", {
                    price: event.price,
                    bdi: (chunks) => <bdi>{chunks}</bdi>
                  })}
                </span>
              )}
              {event.category && (
                <span className="text-xs font-medium px-2 py-1 rounded text-primary bg-primary-light">
                  {event.category}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};


export default EventsInCalifornia;

"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop";

const CARDS_PER_PAGE = 5;

interface TrendingEventsProps {
  events: LandingEvent[];
  /** True after the backend fetch settled — used to skip rendering
   *  while we wait, so we don't flash an empty grid. */
  hasLoaded: boolean;
}

const TrendingEvents = ({ events, hasLoaded }: TrendingEventsProps) => {
  const t = useTranslations("landing.trending");
  const totalPages = Math.max(1, Math.ceil(events.length / CARDS_PER_PAGE));
  const { page, handlePrev, handleNext } = usePagination({ totalPages });

  if (!hasLoaded) return null;
  if (events.length === 0) return null;

  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = events.slice(startIndex, startIndex + CARDS_PER_PAGE);

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          <span className="font-bold">{t("titlePrefix")}</span> {t("titleSuffix")}
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentEvents.map((event, index) => {
          const displayNumber = startIndex + index + 1;
          return (
            <div
              key={event.id}
              className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => window.open(`${FRONTEND_ORIGIN}/event/${event.id}`, "_blank", "noopener,noreferrer")}
            >
              {/* Image + Number */}
              <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px]">
                  <Image
                    src={event.image || FALLBACK_IMAGE}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <div className="absolute bottom-2 start-2 transition-transform duration-300 group-hover:scale-110">
                  <span
                    className="text-7xl font-bold text-black"
                    style={{ WebkitTextStroke: "3px white" }}
                  >
                    {displayNumber}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-3">
                <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {event.price && (
                    <span className="text-sm text-black">
                      {t("fromPrice", { price: event.price })}
                    </span>
                  )}
                </div>
                {event.category && (
                  <span className="inline-block mt-1.5 text-xs font-medium px-2 py-1 rounded text-primary bg-primary-light">
                    {event.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default TrendingEvents;

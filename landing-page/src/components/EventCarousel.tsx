"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";

interface EventCarouselProps {
  events: LandingEvent[];
  isLoading: boolean;
}

/** Skeleton card shown while the backend fetch is in flight */
const SkeletonCard = ({ size }: { size: "sm" | "lg" }) => (
  <div
    className={`relative shrink-0 rounded-2xl overflow-hidden bg-gray-200 animate-pulse ${
      size === "lg"
        ? "w-[calc(100%-360px)] md:w-[calc(100%-440px)] lg:w-[calc(100%-530px)] max-w-[680px] h-[280px] md:h-[340px] lg:h-[380px]"
        : "w-[160px] md:w-[200px] lg:w-[240px] h-[260px] md:h-[320px] lg:h-[360px]"
    }`}
  />
);

const EventCarousel = ({ events, isLoading }: EventCarouselProps) => {
  const t = useTranslations("landing.carousel");
  const locale = useLocale();
  const localeMap: Record<string, string> = { en: 'en-US', fr: 'fr-FR', ar: 'ar-DZ' };

  const [currentIndex, setCurrentIndex] = useState(events.length > 1 ? 1 : 0);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  }, [events.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  }, [events.length]);

  /** Navigate to event detail page - frontend route */
  const handleEventClick = useCallback((eventId: string) => {
    window.location.href = `${FRONTEND_ORIGIN}/event/${eventId}`;
  }, []);

  const { prev, current, next } = useMemo(() => {
    const safeIndex = Math.min(currentIndex, events.length - 1);
    const prevIndex = safeIndex === 0 ? events.length - 1 : safeIndex - 1;
    const nextIndex = safeIndex === events.length - 1 ? 0 : safeIndex + 1;
    return {
      prev: events[prevIndex],
      current: events[safeIndex],
      next: events[nextIndex],
    };
  }, [currentIndex, events]);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <section className="w-full overflow-hidden py-2 mb-8">
        <div className="relative flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-0">
          <SkeletonCard size="sm" />
          <SkeletonCard size="lg" />
          <SkeletonCard size="sm" />
        </div>
      </section>
    );
  }

  // No real events — hide the section entirely
  if (events.length === 0) return null;

  if (!current) return null;

  return (
    <section className="w-full overflow-hidden py-2 mb-8">
      <div className="relative flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-4 md:px-0">
        {/* Previous (Left) Card */}
        <div
          onClick={handlePrev}
          className="relative shrink-0 hidden md:block w-[200px] lg:w-[240px] h-[320px] lg:h-[360px] rounded-2xl overflow-hidden md:-ms-6 lg:-ms-2 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] opacity-70 hover:opacity-90"
          style={{ willChange: 'transform, opacity' }}
        >
          <Image
            src={prev.image || "/images/landingPage/event-myticket-2.jpg"}
            alt={prev.title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 start-4 end-4">
            <h3 className="text-white text-sm font-semibold leading-tight truncate">
              {prev.title}
            </h3>
            <p className="text-white/70 text-xs mt-1">
              <bdi>{new Date(prev.date).toLocaleDateString(
                localeMap[locale] || 'en-US',
                { month: 'short', day: 'numeric' }
              )}</bdi> &bull; {prev.venue}
            </p>
          </div>
        </div>

        {/* Navigation Arrow — Left */}
        <button
          onClick={handlePrev}
          className="absolute start-6 md:start-[165px] lg:start-[210px] z-20 cursor-pointer hover:scale-110 transition-transform"
          aria-label={t("previousAria")}
        >
          <span className="rtl:scale-x-[-1] block">
            <Image
              src="/svgs/landingPage/pastEvent.svg"
              alt={t("previousAria")}
              width={50}
              height={50}
            />
          </span>
        </button>

        {/* Center (Active) Card - Clickable */}
        <div 
          onClick={() => handleEventClick(current.id)}
          className="relative shrink-0 w-full md:w-[calc(100%-440px)] lg:w-[calc(100%-530px)] max-w-[680px] h-[280px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
          style={{ willChange: 'transform, box-shadow' }}
        >
          <Image
            src={current.image || "/images/landingPage/event-myticket-3.jpg"}
            alt={current.title}
            fill
            className="object-cover"
            sizes="700px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          <div className="absolute bottom-6 start-6 end-6">
            <h3 className="text-white text-lg md:text-xl font-semibold leading-tight">
              {current.title}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              <bdi>{new Date(current.date).toLocaleDateString(
                localeMap[locale] || 'en-US',
                { month: 'short', day: 'numeric' }
              )}</bdi> &bull; {current.venue}
            </p>
          </div>
        </div>

        {/* Navigation Arrow — Right */}
        <button
          onClick={handleNext}
          className="absolute end-6 md:end-[165px] lg:end-[210px] z-20 cursor-pointer hover:scale-110 transition-transform"
          aria-label={t("nextAria")}
        >
          <span className="rtl:scale-x-[-1] block">
            <Image
              src="/svgs/landingPage/nextEvent.svg"
              alt={t("nextAria")}
              width={50}
              height={50}
            />
          </span>
        </button>

        {/* Next (Right) Card */}
        <div
          onClick={handleNext}
          className="relative shrink-0 hidden md:block w-[200px] lg:w-[240px] h-[320px] lg:h-[360px] rounded-2xl overflow-hidden md:-me-6 lg:-me-2 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] opacity-70 hover:opacity-90"
          style={{ willChange: 'transform, opacity' }}
        >
          <Image
            src={next.image || "/images/landingPage/event-myticket-6.jpg"}
            alt={next.title}
            fill
            className="object-cover transition-transform duration-300"
            sizes="240px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-4 start-4 end-4">
            <h3 className="text-white text-sm font-semibold leading-tight truncate">
              {next.title}
            </h3>
            <p className="text-white/70 text-xs mt-1">
              <bdi>{new Date(next.date).toLocaleDateString(
                localeMap[locale] || 'en-US',
                { month: 'short', day: 'numeric' }
              )}</bdi> &bull; {next.venue}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCarousel;

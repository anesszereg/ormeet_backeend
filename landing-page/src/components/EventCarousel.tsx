"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import type { LandingEvent } from "@/lib/api";

const FALLBACK_EVENTS: LandingEvent[] = [
  {
    id: "fallback-1",
    image: "/images/landingPage/event-myticket-6.jpg",
    title: "Neon Nights DJ Party",
    date: "Apr 20",
    venue: "Skyline Lounge",
    city: "",
    category: "",
    price: "",
  },
  {
    id: "fallback-2",
    image: "/images/landingPage/event-myticket-3.jpg",
    title: "Rhythm & Beats Music Festival",
    date: "Apr 20",
    venue: "Hyde Park",
    city: "",
    category: "",
    price: "",
  },
  {
    id: "fallback-3",
    image: "/images/landingPage/event-myticket-2.jpg",
    title: "Global Tech Innovators Summit",
    date: "Apr 20",
    venue: "Marina Convention Center",
    city: "",
    category: "",
    price: "",
  },
];

interface EventCarouselProps {
  events: LandingEvent[];
  isLoading: boolean;
}

const EventCarousel = ({ events, isLoading }: EventCarouselProps) => {
  // While the fetch is in flight, show evergreen marketing imagery so
  // the hero area never looks empty.
  const list = events.length >= 3
    ? events
    : isLoading
      ? FALLBACK_EVENTS
      : events.length > 0
        ? events
        : FALLBACK_EVENTS;

  const [currentIndex, setCurrentIndex] = useState(
    list.length > 1 ? 1 : 0,
  );

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? list.length - 1 : prev - 1));
  }, [list.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === list.length - 1 ? 0 : prev + 1));
  }, [list.length]);

  /** Navigate to event detail page - frontend route */
  const handleEventClick = useCallback((eventId: string) => {
    window.location.href = `${FRONTEND_ORIGIN}/event/${eventId}`;
  }, []);

  const { prev, current, next } = useMemo(() => {
    const safeIndex = Math.min(currentIndex, list.length - 1);
    const prevIndex = safeIndex === 0 ? list.length - 1 : safeIndex - 1;
    const nextIndex = safeIndex === list.length - 1 ? 0 : safeIndex + 1;
    return {
      prev: list[prevIndex],
      current: list[safeIndex],
      next: list[nextIndex],
    };
  }, [currentIndex, list]);

  if (!current) return null;

  return (
    <section className="w-full overflow-hidden py-2 mb-8">
      <div className="relative flex items-center justify-center gap-3 md:gap-4 lg:gap-5 px-0">
        {/* Previous (Left) Card */}
        <div
          onClick={handlePrev}
          className="relative shrink-0 w-[160px] md:w-[200px] lg:w-[240px] h-[260px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden -ml-10 md:-ml-6 lg:-ml-2 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] opacity-70 hover:opacity-90"
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
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-sm font-semibold leading-tight truncate">
              {prev.title}
            </h3>
            <p className="text-white/70 text-xs mt-1">
              {prev.date} &bull; {prev.venue}
            </p>
          </div>
        </div>

        {/* Navigation Arrow — Left */}
        <button
          onClick={handlePrev}
          className="absolute left-[120px] md:left-[165px] lg:left-[210px] z-20 cursor-pointer hover:scale-110 transition-transform"
          aria-label="Previous event"
        >
          <Image
            src="/svgs/landingPage/pastEvent.svg"
            alt="Previous"
            width={50}
            height={50}
          />
        </button>

        {/* Center (Active) Card - Clickable */}
        <div 
          onClick={() => current.id.startsWith("fallback-") ? null : handleEventClick(current.id)}
          className="relative shrink-0 w-[calc(100%-360px)] md:w-[calc(100%-440px)] lg:w-[calc(100%-530px)] max-w-[680px] h-[280px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
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
          <div className="absolute bottom-6 left-6 right-6">
            <h3 className="text-white text-lg md:text-xl font-semibold leading-tight">
              {current.title}
            </h3>
            <p className="text-white/80 text-sm mt-1">
              {current.date} &bull; {current.venue}
            </p>
          </div>
        </div>

        {/* Navigation Arrow — Right */}
        <button
          onClick={handleNext}
          className="absolute right-[120px] md:right-[165px] lg:right-[210px] z-20 cursor-pointer hover:scale-110 transition-transform"
          aria-label="Next event"
        >
          <Image
            src="/svgs/landingPage/nextEvent.svg"
            alt="Next"
            width={50}
            height={50}
          />
        </button>

        {/* Next (Right) Card */}
        <div
          onClick={handleNext}
          className="relative shrink-0 w-[160px] md:w-[200px] lg:w-[240px] h-[260px] md:h-[320px] lg:h-[360px] rounded-2xl overflow-hidden -mr-10 md:-mr-6 lg:-mr-2 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.03] opacity-70 hover:opacity-90"
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
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white text-sm font-semibold leading-tight truncate">
              {next.title}
            </h3>
            <p className="text-white/70 text-xs mt-1">
              {next.date} &bull; {next.venue}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventCarousel;

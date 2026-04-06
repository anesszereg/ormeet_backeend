"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CarouselEvent } from "@/types";
import { FRONTEND_ORIGIN } from "@/lib/constants";

const events: CarouselEvent[] = [
  {
    id: 1,
    image: "/images/landingPage/event-myticket-6.jpg",
    title: "Neon Nights DJ Party",
    date: "Apr 20",
    venue: "Skyline Lounge",
  },
  {
    id: 2,
    image: "/images/landingPage/event-myticket-3.jpg",
    title: "Rhythm & Beats Music Festival",
    date: "Apr 20",
    venue: "Hyde Park",
  },
  {
    id: 3,
    image: "/images/landingPage/event-myticket-2.jpg",
    title: "Global Tech Innovators Summit",
    date: "Apr 20",
    venue: "Marina Convention Center",
  },
  {
    id: 4,
    image: "/images/landingPage/event-myticket-8.png",
    title: "Summer Jazz & Blues Festival",
    date: "May 15",
    venue: "Riverside Amphitheater",
  },
  {
    id: 5,
    image: "/images/landingPage/event-myticket-7.png",
    title: "Street Food Festival",
    date: "Jun 5",
    venue: "Downtown Plaza",
  },
];

const EventCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(1);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? events.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === events.length - 1 ? 0 : prev + 1));
  }, []);

  /** Navigate to event detail page - frontend route */
  const handleEventClick = useCallback((eventId: number) => {
    window.location.href = `${FRONTEND_ORIGIN}/event/${eventId}`;
  }, []);

  const { prev, current, next } = useMemo(() => {
    const prevIndex =
      currentIndex === 0 ? events.length - 1 : currentIndex - 1;
    const nextIndex =
      currentIndex === events.length - 1 ? 0 : currentIndex + 1;
    return {
      prev: events[prevIndex],
      current: events[currentIndex],
      next: events[nextIndex],
    };
  }, [currentIndex]);

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
            src={prev.image}
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
          onClick={() => handleEventClick(current.id)}
          className="relative shrink-0 w-[calc(100%-360px)] md:w-[calc(100%-440px)] lg:w-[calc(100%-530px)] max-w-[680px] h-[280px] md:h-[340px] lg:h-[380px] rounded-2xl overflow-hidden shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.02]"
          style={{ willChange: 'transform, box-shadow' }}
        >
          <Image
            src={current.image}
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
            src={next.image}
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

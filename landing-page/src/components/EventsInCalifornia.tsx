"use client";

import { useState } from "react";
import Image from "next/image";

interface CaliforniaEvent {
  id: number;
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge: string | null;
  badgeColor: "green" | "red" | null;
}

const californiaEvents: CaliforniaEvent[] = [
  { id: 1, image: "/images/landingPage/event-myticket-7.png", title: "Laugh Out Loud Live!", date: "Nov 3", venue: "The Spotlight Theatre", price: "$53.99", badge: null, badgeColor: null },
  { id: 2, image: "/images/landingPage/event-myticket-8.png", title: "Colors of Modernity", date: "Jan 10", venue: "Grandview Art Gallery", price: "$49.99", badge: "Trending", badgeColor: "green" },
  { id: 3, image: "/images/landingPage/event-myticket-2.jpg", title: "Taste of the Valley", date: "Oct 18", venue: "Greenleaf Pavilion", price: "$65.99", badge: null, badgeColor: null },
  { id: 4, image: "/images/landingPage/event-myticket-3.jpg", title: "Sunset Acoustic Sessions", date: "Dec 5", venue: "Bayview Terrace", price: "$39.99", badge: "Almost full", badgeColor: "red" },
  { id: 5, image: "/images/landingPage/event-myticket-6.jpg", title: "Neon Nights DJ Party", date: "Feb 14", venue: "Skyline Lounge", price: "$59.99", badge: null, badgeColor: null },
];

const CARDS_PER_PAGE = 3;

const EventsInCalifornia = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(californiaEvents.length / CARDS_PER_PAGE);
  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = californiaEvents.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          Events in <span className="font-bold">California</span>
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#757575]">
            {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className={`w-8 h-8 flex items-center justify-center rounded-full border border-[#EEEEEE] transition-colors ${
                page === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-[#F8F8F8] cursor-pointer"
              }`}
              aria-label="Previous page"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                page === totalPages
                  ? "bg-gray-400 opacity-50 cursor-not-allowed"
                  : "bg-black hover:bg-[#333333] cursor-pointer"
              }`}
              aria-label="Next page"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentEvents.map((event) => (
          <div
            key={event.id}
            className="group cursor-pointer"
          >
            {/* Image */}
            <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px] rounded-2xl overflow-hidden mb-3">
              <Image
                src={event.image}
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
            <p className="text-sm text-[#757575] mb-1.5">
              {event.date} • {event.venue}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-black">from {event.price}</span>
              {event.badge && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    event.badgeColor === "green"
                      ? "text-[#34A853] bg-[#E8F5E9]"
                      : "text-[#FF4000] bg-[#FFF4F3]"
                  }`}
                >
                  {event.badge}
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

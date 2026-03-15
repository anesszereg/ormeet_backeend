"use client";

import { useState } from "react";
import Image from "next/image";

interface TrendingEvent {
  id: number;
  image: string;
  title: string;
  price: string;
  badge: string | null;
  badgeColor: "blue" | "red" | null;
}

const trendingEvents: TrendingEvent[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop", title: "Golden Beats Music Fest", price: "$53.99", badge: "Almost full", badgeColor: "blue" },
  { id: 2, image: "https://images.unsplash.com/photo-1571266028243-d220c6a8b0e5?w=600&h=800&fit=crop", title: "Rooftop DJ Nights", price: "$53.99", badge: null, badgeColor: null },
  { id: 3, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=800&fit=crop", title: "SoCal Street Bites", price: "$53.99", badge: "Sales end soon", badgeColor: "red" },
  { id: 4, image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop", title: "Local Artists Showcase", price: "$53.99", badge: "Only few left", badgeColor: "red" },
  { id: 5, image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=800&fit=crop", title: "Golden Beats Music Fest", price: "$53.99", badge: null, badgeColor: null },
  { id: 6, image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=800&fit=crop", title: "Urban Art Exhibition", price: "$53.99", badge: "Almost full", badgeColor: "blue" },
  { id: 7, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop", title: "Wine Tasting Evening", price: "$53.99", badge: null, badgeColor: null },
  { id: 8, image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=800&fit=crop", title: "Comedy Night Special", price: "$53.99", badge: "Sales end soon", badgeColor: "red" },
];

const CARDS_PER_PAGE = 5;

const TrendingEvents = () => {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(trendingEvents.length / CARDS_PER_PAGE);
  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = trendingEvents.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : p));
  const handleNext = () => setPage((p) => (p < totalPages ? p + 1 : p));

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          <span className="font-bold">Trending</span> events
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentEvents.map((event, index) => {
          const displayNumber = startIndex + index + 1;
          return (
            <div
              key={event.id}
              className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              {/* Image + Number */}
              <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-[280px] sm:h-[300px] lg:h-[320px]">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </div>
                <div className="absolute bottom-2 left-2 transition-transform duration-300 group-hover:scale-110">
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
                  <span className="text-sm text-black">from {event.price}</span>
                </div>
                {event.badge && (
                  <span
                    className={`inline-block mt-1.5 text-xs font-medium px-2 py-1 rounded ${
                      event.badgeColor === "blue"
                        ? "text-[#00A3FF] bg-[#E6F7FF]"
                        : "text-[#FF4000] bg-[#FFF4F3]"
                    }`}
                  >
                    {event.badge}
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

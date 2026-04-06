"use client";

import Image from "next/image";
import type { TrendingEvent } from "@/types";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const trendingEvents: TrendingEvent[] = [
  { id: 1, image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=800&fit=crop", title: "Golden Beats Music Fest", price: "$53.99", badge: "Almost full", badgeColor: "blue" },
  { id: 2, image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=800&fit=crop", title: "Rooftop DJ Nights", price: "$53.99", badge: null, badgeColor: null },
  { id: 3, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=800&fit=crop", title: "SoCal Street Bites", price: "$53.99", badge: "Sales end soon", badgeColor: "red" },
  { id: 4, image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop", title: "Local Artists Showcase", price: "$53.99", badge: "Only few left", badgeColor: "red" },
  { id: 5, image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=800&fit=crop", title: "Golden Beats Music Fest", price: "$53.99", badge: null, badgeColor: null },
  { id: 6, image: "https://images.unsplash.com/photo-1531243269054-5ebf6f34081e?w=600&h=800&fit=crop", title: "Urban Art Exhibition", price: "$53.99", badge: "Almost full", badgeColor: "blue" },
  { id: 7, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=800&fit=crop", title: "Wine Tasting Evening", price: "$53.99", badge: null, badgeColor: null },
  { id: 8, image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=600&h=800&fit=crop", title: "Comedy Night Special", price: "$53.99", badge: "Sales end soon", badgeColor: "red" },
];

const CARDS_PER_PAGE = 5;

const TrendingEvents = () => {
  const totalPages = Math.ceil(trendingEvents.length / CARDS_PER_PAGE);
  const { page, handlePrev, handleNext } = usePagination({ totalPages });
  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = trendingEvents.slice(startIndex, startIndex + CARDS_PER_PAGE);

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          <span className="font-bold">Trending</span> events
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
                        : "text-primary bg-primary-light"
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

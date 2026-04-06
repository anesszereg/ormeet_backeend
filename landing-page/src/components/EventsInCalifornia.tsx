"use client";

import Image from "next/image";
import type { CaliforniaEvent } from "@/types";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const californiaEvents: CaliforniaEvent[] = [
  { id: 1, image: "/images/landingPage/event-myticket-7.png", title: "Laugh Out Loud Live!", date: "Nov 3", venue: "The Spotlight Theatre", price: "$53.99", badge: null, badgeColor: null },
  { id: 2, image: "/images/landingPage/event-myticket-8.png", title: "Colors of Modernity", date: "Jan 10", venue: "Grandview Art Gallery", price: "$49.99", badge: "Trending", badgeColor: "green" },
  { id: 3, image: "/images/landingPage/event-myticket-2.jpg", title: "Taste of the Valley", date: "Oct 18", venue: "Greenleaf Pavilion", price: "$65.99", badge: null, badgeColor: null },
  { id: 4, image: "/images/landingPage/event-myticket-3.jpg", title: "Sunset Acoustic Sessions", date: "Dec 5", venue: "Bayview Terrace", price: "$39.99", badge: "Almost full", badgeColor: "red" },
  { id: 5, image: "/images/landingPage/event-myticket-6.jpg", title: "Neon Nights DJ Party", date: "Feb 14", venue: "Skyline Lounge", price: "$59.99", badge: null, badgeColor: null },
];

const CARDS_PER_PAGE = 3;

interface EventsInCaliforniaProps {
  /** City selected in the DiscoverSection dropdown */
  selectedCity?: string;
}

const EventsInCalifornia = ({ selectedCity = "California" }: EventsInCaliforniaProps) => {
  const totalPages = Math.ceil(californiaEvents.length / CARDS_PER_PAGE);
  const { page, handlePrev, handleNext } = usePagination({ totalPages });
  const startIndex = (page - 1) * CARDS_PER_PAGE;
  const currentEvents = californiaEvents.slice(startIndex, startIndex + CARDS_PER_PAGE);

  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 pt-10 pb-8 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-black">
          Events in <span className="font-bold">{selectedCity}</span>
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
            <p className="text-sm text-medium-gray mb-1.5">
              {event.date} • {event.venue}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-black">from {event.price}</span>
              {event.badge && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    event.badgeColor === "green"
                      ? "text-[#34A853] bg-[#E8F5E9]"
                      : "text-primary bg-primary-light"
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

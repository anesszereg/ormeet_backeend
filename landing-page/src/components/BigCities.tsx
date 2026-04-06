"use client";

import Image from "next/image";
import type { CityCard } from "@/types";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const allCityPages: CityCard[][] = [
  [
    { id: 1, name: "California", price: "$49.99", image: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop" },
    { id: 2, name: "Tehran", price: "$49.99", image: "https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&h=900&fit=crop" },
    { id: 3, name: "Los Angeles", price: "$49.99", image: "https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=600&h=900&fit=crop" },
    { id: 4, name: "Oran", price: "$49.99", image: "https://images.unsplash.com/photo-1597953601374-1ff2d5640c85?w=600&h=900&fit=crop" },
  ],
  [
    { id: 5, name: "New York", price: "$49.99", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=900&fit=crop" },
    { id: 6, name: "Paris", price: "$49.99", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=900&fit=crop" },
    { id: 7, name: "London", price: "$49.99", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=900&fit=crop" },
    { id: 8, name: "Dubai", price: "$49.99", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=900&fit=crop" },
  ],
  [
    { id: 9, name: "Tokyo", price: "$49.99", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=900&fit=crop" },
    { id: 10, name: "Barcelona", price: "$49.99", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=900&fit=crop" },
    { id: 11, name: "Istanbul", price: "$49.99", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=900&fit=crop" },
    { id: 12, name: "Sydney", price: "$49.99", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=900&fit=crop" },
  ],
];

const TOTAL_PAGES = allCityPages.length;

const BigCities = () => {
  const { page, handlePrev, handleNext } = usePagination({ totalPages: TOTAL_PAGES });
  const currentCities = allCityPages[page - 1];

  return (
    <section className="w-full bg-white py-16 px-6 md:px-10 lg:px-16 xl:px-20">
      {/* Header area */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
        {/* Left: Title */}
        <h2 className="text-3xl md:text-4xl text-black leading-tight max-w-md">
          Big cities. bigger events.{" "}
          <span className="font-bold">find yours.</span>
        </h2>

        {/* Right: Description + Pagination */}
        <div className="flex flex-col items-start lg:items-end gap-4">
          <p className="text-sm md:text-base text-muted leading-relaxed max-w-md lg:text-right">
            Where&apos;s the fun happening? Just pick a city and find
            out! Discover events, meetups, and unforgettable
            experiences.
          </p>
          <PaginationControls
            page={page}
            totalPages={TOTAL_PAGES}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>

      {/* City Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {currentCities.map((city) => (
          <div
            key={city.id}
            className="relative group cursor-pointer rounded-2xl overflow-hidden"
            onClick={() => window.open(`${FRONTEND_ORIGIN}/search-results?location=${encodeURIComponent(city.name)}`, "_blank", "noopener,noreferrer")}
          >
            {/* Image */}
            <div className="relative w-full h-[320px] sm:h-[360px] lg:h-[400px]">
              <Image
                src={city.image}
                alt={city.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Price badge top-right */}
            <div className="absolute top-3 right-3 bg-white border border-light-gray rounded-full px-3 py-1.5 flex items-center gap-1">
              <span className="text-xs text-medium-gray">From</span>
              <span className="text-sm font-bold text-black">{city.price}</span>
            </div>

            {/* Bottom row: City name + Arrow */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="text-white text-lg font-semibold">
                {city.name}
              </span>
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 10L10 4" stroke="#181818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 4H10V10" stroke="#181818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BigCities;

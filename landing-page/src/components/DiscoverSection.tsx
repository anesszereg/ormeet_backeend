"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { FRONTEND_ORIGIN } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Static data                                                        */
/* ------------------------------------------------------------------ */

const CITIES = [
  "California",
  "New York",
  "London",
  "Paris",
  "Tokyo",
  "Dubai",
  "Sydney",
  "Toronto",
  "Berlin",
  "Barcelona",
] as const;

type City = (typeof CITIES)[number];

const CATEGORIES = [
  "All Categories",
  "Music",
  "Sports",
  "Food & Drink",
  "Art & Performance",
] as const;

type Category = (typeof CATEGORIES)[number];

interface DiscoverEvent {
  id: number;
  title: string;
  date: string;
  venue: string;
  price: string;
  image: string;
  category: Category;
}

/** Category-representative images from Unsplash */
const CATEGORY_IMAGES = {
  Music: [
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop",
  ],
  Sports: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop",
  ],
  "Food & Drink": [
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  ],
  "Art & Performance": [
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&h=400&fit=crop",
  ],
};

/** Mock event data — each event has a category for filtering */
const ALL_EVENTS: DiscoverEvent[] = [
  { id: 1,  title: "Golden Beats Music Fest",   date: "Apr 20", venue: "Sunset Arena",         price: "$53.99", image: CATEGORY_IMAGES.Music[0],                category: "Music" },
  { id: 2,  title: "Rooftop DJ Nights",         date: "May 5",  venue: "Skyline Lounge",       price: "$45.99", image: CATEGORY_IMAGES.Music[1],                category: "Music" },
  { id: 3,  title: "Acoustic Unplugged",        date: "Jun 12", venue: "Bayview Terrace",      price: "$29.99", image: CATEGORY_IMAGES.Music[2],                category: "Music" },
  { id: 4,  title: "Championship Finals",       date: "May 18", venue: "Grand Stadium",        price: "$89.99", image: CATEGORY_IMAGES.Sports[0],               category: "Sports" },
  { id: 5,  title: "City Marathon 2025",        date: "Jun 1",  venue: "Downtown Circuit",     price: "$35.00", image: CATEGORY_IMAGES.Sports[1],               category: "Sports" },
  { id: 6,  title: "Swim Invitational",         date: "Jul 8",  venue: "Aquatic Center",       price: "$25.00", image: CATEGORY_IMAGES.Sports[2],               category: "Sports" },
  { id: 7,  title: "SoCal Street Bites",        date: "Apr 28", venue: "Greenleaf Pavilion",   price: "$15.99", image: CATEGORY_IMAGES["Food & Drink"][0],      category: "Food & Drink" },
  { id: 8,  title: "Wine & Dine Evening",       date: "May 22", venue: "Vineyard Estate",      price: "$65.99", image: CATEGORY_IMAGES["Food & Drink"][1],      category: "Food & Drink" },
  { id: 9,  title: "Gourmet Food Festival",     date: "Jun 15", venue: "Central Park",         price: "$20.00", image: CATEGORY_IMAGES["Food & Drink"][2],      category: "Food & Drink" },
  { id: 10, title: "Street Art Walkthrough",    date: "Jun 3",  venue: "Arts District",        price: "$12.00", image: CATEGORY_IMAGES["Art & Performance"][1], category: "Art & Performance" },
  { id: 11, title: "Abstract Expressions",      date: "Jul 20", venue: "Modern Art Museum",    price: "$38.00", image: CATEGORY_IMAGES["Art & Performance"][2], category: "Art & Performance" },
  { id: 12, title: "Live Theater Night",        date: "Aug 5",  venue: "City Playhouse",       price: "$42.00", image: CATEGORY_IMAGES["Art & Performance"][0], category: "Art & Performance" },
];

/* ------------------------------------------------------------------ */
/*  Component props                                                    */
/* ------------------------------------------------------------------ */

interface DiscoverSectionProps {
  /** Callback when user selects a different city */
  onCityChange?: (city: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const DiscoverSection = ({ onCityChange }: DiscoverSectionProps) => {
  const [selectedCity, setSelectedCity] = useState<City>("California");
  const [activeCategory, setActiveCategory] = useState<Category>("All Categories");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCitySelect = useCallback(
    (city: City) => {
      setSelectedCity(city);
      setIsCityDropdownOpen(false);
      onCityChange?.(city);
    },
    [onCityChange]
  );

  /**
   * "All Categories" shows only the first 3 cards (one per category)
   * to keep the layout clean. Specific category shows all 3 of its cards.
   */
  const filteredEvents = useMemo(() => {
    if (activeCategory === "All Categories") {
      const seen = new Set<string>();
      const firstPerCategory = ALL_EVENTS.filter((e) => {
        if (seen.has(e.category)) return false;
        seen.add(e.category);
        return true;
      });
      return firstPerCategory.slice(0, 3);
    }
    return ALL_EVENTS.filter((e) => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Heading — city name is dynamic */}
      <h2 className="text-2xl md:text-3xl text-center text-black mb-8">
        <span className="font-bold">Discover</span> events in{" "}
        <span className="font-bold">{selectedCity}</span>
      </h2>

      {/* Location + Categories Row */}
      <div className="flex flex-wrap items-center justify-center gap-4 px-4">
        {/* Location Selector (dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsCityDropdownOpen((prev) => !prev)}
            className="flex items-center gap-3 px-4 py-2.5 border border-light-gray rounded-full bg-white min-w-[220px] cursor-pointer hover:border-primary transition-colors"
            aria-haspopup="listbox"
            aria-expanded={isCityDropdownOpen}
          >
            {/* Location icon — moved to far left, slightly larger */}
            <Image
              src="/svgs/landingPage/location.svg"
              alt="Location"
              width={38}
              height={38}
              className="shrink-0 -ml-1"
            />
            <span className="text-sm font-medium text-black flex-1 text-left">
              {selectedCity}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`shrink-0 transition-transform duration-200 ${
                isCityDropdownOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#181818"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Dropdown menu */}
          {isCityDropdownOpen && (
            <ul
              role="listbox"
              className="absolute top-full left-0 mt-2 w-full bg-white border border-light-gray rounded-xl shadow-lg z-30 py-1 max-h-[280px] overflow-y-auto"
            >
              {CITIES.map((city) => (
                <li
                  key={city}
                  role="option"
                  aria-selected={city === selectedCity}
                  onClick={() => handleCitySelect(city)}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    city === selectedCity
                      ? "bg-primary-light text-primary font-semibold"
                      : "text-black hover:bg-secondary-light"
                  }`}
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-light-gray hidden md:block" />

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 cursor-pointer ${
                activeCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-black border border-light-gray hover:bg-secondary-light"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid — filtered by category */}
      <div className="w-full px-6 md:px-10 lg:px-16 xl:px-20 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
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
                {/* Category badge overlay */}
                <span className="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-black/60 text-white rounded-full backdrop-blur-sm">
                  {event.category}
                </span>
              </div>

              {/* Info */}
              <h3 className="text-base font-semibold text-black mb-1 line-clamp-1">
                {event.title}
              </h3>
              <p className="text-sm text-medium-gray mb-1.5">
                {event.date} • {event.venue}
              </p>
              <span className="text-sm font-semibold text-black">
                from {event.price}
              </span>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <p className="text-center text-medium-gray py-12 text-sm">
            No events found in this category.
          </p>
        )}
      </div>
    </section>
  );
};

export default DiscoverSection;

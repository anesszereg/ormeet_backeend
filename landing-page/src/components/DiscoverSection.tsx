"use client";

import { useState } from "react";
import Image from "next/image";

const categories = [
  "All Categories",
  "Music",
  "Sports",
  "Food & Drink",
  "Art & Performance",
];

const DiscoverSection = () => {
  const [activeCategory, setActiveCategory] = useState("All Categories");

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Heading */}
      <h2 className="text-2xl md:text-3xl text-center text-black mb-8">
        <span className="font-bold">Discover</span> events near you
      </h2>

      {/* Location + Categories Row */}
      <div className="flex flex-wrap items-center justify-center gap-4 px-4">
        {/* Location Selector */}
        <div className="flex items-center gap-2 px-4 py-2.5 border border-[#EEEEEE] rounded-full bg-white min-w-[180px]">
          <Image
            src="/svgs/landingPage/location.svg"
            alt="Location"
            width={28}
            height={28}
          />
          <span className="text-sm font-medium text-black">California</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-auto"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="#181818"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-[#EEEEEE] hidden md:block"></div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-colors cursor-pointer ${
                activeCategory === category
                  ? "bg-black text-white"
                  : "bg-white text-black border border-[#EEEEEE] hover:bg-[#F8F8F8]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;

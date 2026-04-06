"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

import { FRONTEND_ORIGIN } from "@/lib/constants";

const HeroSection = () => {
  const [where, setWhere] = useState("");
  const [what, setWhat] = useState("");

  /** Build the search URL and redirect to the front-end search-results page */
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (where.trim()) params.set("location", where.trim());
    if (what.trim()) params.set("event", what.trim());

    const query = params.toString();
    const url = `${FRONTEND_ORIGIN}/search-results${query ? `?${query}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [where, what]);

  /** Allow pressing Enter in either input to trigger search */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  return (
    <section className="w-full flex flex-col items-center pt-10 pb-6 bg-white">
      {/* Headline */}
      <h1 className="text-4xl md:text-5xl text-center text-black mb-4">
        <span className="font-bold">Find</span> It.{" "}
        <span className="font-bold">Book</span> It.{" "}
        <span className="font-bold">Enjoy</span> It.
      </h1>

      {/* Subtitle */}
      <p className="text-base text-muted text-center mb-8 max-w-[600px] px-4">
        Find concerts, workshops, meetups, and more—your next event is just a
        search away.
      </p>

      {/* Search Bar */}
      <div className="w-full max-w-[560px] mx-auto px-4 mb-10">
        <div className="flex items-center bg-white border border-light-gray rounded-full shadow-sm hover:shadow-md transition-shadow h-[52px]">
          {/* Location Icon — flush left */}
          <div className="shrink-0 pl-1">
            <Image
              src="/svgs/landingPage/location.svg"
              alt="Location"
              width={42}
              height={42}
            />
          </div>

          {/* Where Section */}
          <div className="flex flex-col flex-1 min-w-0 pl-2">
            <span className="text-xs font-semibold text-black leading-tight">
              Where
            </span>
            <input
              type="text"
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search Location"
              className="text-sm font-medium text-black bg-transparent outline-none placeholder:text-input-gray placeholder:font-normal w-full"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-light-gray shrink-0"></div>

          {/* What Section */}
          <div className="flex flex-col flex-1 min-w-0 pl-4">
            <span className="text-xs font-semibold text-black leading-tight">
              What
            </span>
            <input
              type="text"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search events"
              className="text-sm font-medium text-black bg-transparent outline-none placeholder:text-input-gray placeholder:font-normal w-full"
            />
          </div>

          {/* Search Button — flush right */}
          <button
            onClick={handleSearch}
            className="shrink-0 pr-1 cursor-pointer hover:scale-105 transition-transform"
            aria-label="Search events"
          >
            <Image
              src="/svgs/landingPage/search.svg"
              alt="Search"
              width={46}
              height={46}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

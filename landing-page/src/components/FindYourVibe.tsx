"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CategoryCard } from "@/types";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

type VibeCategory = Omit<CategoryCard, "label"> & {
  key: string;
  searchTerm: string;
};

const allCategories: VibeCategory[][] = [
  [
    { id: 1, key: "fitness", searchTerm: "Fitness", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop" },
    { id: 2, key: "music", searchTerm: "Music", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop" },
    { id: 3, key: "dating", searchTerm: "Dating", image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=500&h=500&fit=crop" },
    { id: 4, key: "nightlife", searchTerm: "Nightlife", image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=500&h=500&fit=crop" },
    { id: 5, key: "holiday", searchTerm: "Holiday", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=500&fit=crop" },
  ],
  [
    { id: 6, key: "foodDrink", searchTerm: "Food & Drink", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=500&fit=crop" },
    { id: 7, key: "art", searchTerm: "Art", image: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=500&h=500&fit=crop" },
    { id: 8, key: "sports", searchTerm: "Sports", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=500&fit=crop" },
    { id: 9, key: "business", searchTerm: "Business", image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=500&h=500&fit=crop" },
    { id: 10, key: "wellness", searchTerm: "Wellness", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=500&h=500&fit=crop" },
  ],
  [
    { id: 11, key: "comedy", searchTerm: "Comedy", image: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=500&h=500&fit=crop" },
    { id: 12, key: "theater", searchTerm: "Theater", image: "https://images.unsplash.com/photo-1503095396549-807759245b35?w=500&h=500&fit=crop" },
    { id: 13, key: "outdoor", searchTerm: "Outdoor", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=500&fit=crop" },
    { id: 14, key: "tech", searchTerm: "Tech", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=500&fit=crop" },
    { id: 15, key: "fashion", searchTerm: "Fashion", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&h=500&fit=crop" },
  ],
];

const TOTAL_PAGES = allCategories.length;

const FindYourVibe = () => {
  const t = useTranslations("landing.vibe");
  const { page, handlePrev, handleNext } = usePagination({ totalPages: TOTAL_PAGES });
  const currentCategories = allCategories[page - 1];

  return (
    <section className="w-full bg-[#F0F8F7] py-16 px-6 md:px-10 lg:px-16 xl:px-20">
      {/* Header area */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-10">
        {/* Left: Title */}
        <h2 className="text-3xl md:text-4xl text-black leading-tight max-w-md">
          {t("titleStart")}{" "}
          <span className="font-bold">{t("titleHighlight")}</span>
        </h2>

        {/* Right: Description + Pagination */}
        <div className="flex flex-col items-start lg:items-end gap-4">
          <p className="text-sm md:text-base text-muted leading-relaxed max-w-md lg:text-end">
            {t("description")}
          </p>
          <PaginationControls
            page={page}
            totalPages={TOTAL_PAGES}
            onPrev={handlePrev}
            onNext={handleNext}
            variant="teal"
          />
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {currentCategories.map((cat) => {
          const label = t(`categories.${cat.key}`);
          return (
          <div
            key={cat.id}
            className="relative group cursor-pointer rounded-2xl overflow-hidden"
            onClick={() => window.open(`${FRONTEND_ORIGIN}/search-results?event=${encodeURIComponent(cat.searchTerm)}`, "_blank", "noopener,noreferrer")}
          >
            {/* Image */}
            <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px]">
              <Image
                src={cat.image}
                alt={label}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
              {/* Dark gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Arrow icon top-right */}
            <div className="absolute top-3 end-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 10L10 4" stroke="#181818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 4H10V10" stroke="#181818" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Category label bottom-left */}
            <span className="absolute bottom-4 start-4 text-white text-base font-semibold">
              {label}
            </span>
          </div>
        );
        })}
      </div>
    </section>
  );
};

export default FindYourVibe;

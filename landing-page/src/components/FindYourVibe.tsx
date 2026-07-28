"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { eventCategories } from "@ormeet/i18n";
import { FRONTEND_ORIGIN } from "@/lib/constants";
import { usePagination } from "@/hooks/usePagination";
import PaginationControls from "@/components/ui/PaginationControls";

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=500&h=500&fit=crop`;

/** Visuel de chaque type d'événement. La liste elle-même vit dans @ormeet/i18n. */
const CATEGORY_IMAGES: Record<string, string> = {
  music: unsplash("1493225457124-a3eb161ffa5f"),
  sports: unsplash("1546519638-68e109498ffc"),
  comedy: unsplash("1527224857830-43a7acc85260"),
  theater: unsplash("1503095396549-807759245b35"),
  cinema: unsplash("1489599849927-2ee91cede3ba"),
  conference: unsplash("1505373877841-8d25f7d46678"),
  workshop: unsplash("1524178232363-1fb2b075b655"),
  expo: unsplash("1531058020387-3be344556be6"),
  business: unsplash("1521737604893-d14cc237f11d"),
  tech: unsplash("1540575467063-178a50c2df87"),
  art: unsplash("1518998053901-5348d3961a04"),
  books: unsplash("1481627834876-b7833e8f5570"),
  food: unsplash("1414235077428-338989a2e8c0"),
  outdoor: unsplash("1551632811-561732d1e306"),
  gaming: unsplash("1542751371-adc38448a05e"),
};

const CARDS_PER_PAGE = 5;

/** Découpe le référentiel en pages de 5 cartes. */
const categoryPages = Array.from(
  { length: Math.ceil(eventCategories.length / CARDS_PER_PAGE) },
  (_, i) => eventCategories.slice(i * CARDS_PER_PAGE, (i + 1) * CARDS_PER_PAGE)
);

const TOTAL_PAGES = categoryPages.length;

const FindYourVibe = () => {
  const t = useTranslations("landing.vibe");
  const tCategories = useTranslations("common.eventCategories");
  const { page, handlePrev, handleNext } = usePagination({ totalPages: TOTAL_PAGES });
  const currentCategories = categoryPages[page - 1];

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
          const label = tCategories(cat.key);
          return (
          <div
            key={cat.key}
            className="relative group cursor-pointer rounded-2xl overflow-hidden"
            onClick={() => window.open(`${FRONTEND_ORIGIN}/search-results?event=${encodeURIComponent(cat.searchTerm)}`, "_blank", "noopener,noreferrer")}
          >
            {/* Image */}
            <div className="relative w-full h-[200px] sm:h-[220px] lg:h-[240px]">
              <Image
                src={CATEGORY_IMAGES[cat.key]}
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

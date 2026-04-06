interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  /** "sm" = 32px buttons (card grids), "md" = 40px buttons (section headers) */
  size?: "sm" | "md";
  /** "default" = gray borders, "teal" = teal-tinted borders (FindYourVibe) */
  variant?: "default" | "teal";
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
} as const;

const prevVariantClasses = {
  default: {
    base: "border border-light-gray",
    hover: "hover:bg-secondary-light",
  },
  teal: {
    base: "border border-[#D9E8E6]",
    hover: "hover:bg-[#E0EFED]",
  },
} as const;

/**
 * Reusable prev/next pagination controls with page indicator.
 * Extracts the duplicated pagination UI found across 5+ sections.
 */
export default function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext,
  size = "md",
  variant = "default",
}: PaginationControlsProps) {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;
  const btnSize = sizeClasses[size];
  const prevStyles = prevVariantClasses[variant];

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        disabled={isFirstPage}
        className={`${btnSize} flex items-center justify-center rounded-full ${prevStyles.base} transition-colors ${
          isFirstPage
            ? "opacity-50 cursor-not-allowed"
            : `${prevStyles.hover} cursor-pointer`
        }`}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="#333333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-sm text-medium-gray">
        {page} of {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={isLastPage}
        className={`${btnSize} flex items-center justify-center rounded-full transition-colors ${
          isLastPage
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
  );
}

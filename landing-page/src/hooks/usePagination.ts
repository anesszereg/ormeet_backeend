import { useState, useCallback } from "react";

interface UsePaginationOptions {
  totalPages: number;
  initialPage?: number;
}

interface UsePaginationReturn {
  page: number;
  totalPages: number;
  handlePrev: () => void;
  handleNext: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/** Reusable pagination state logic shared across paginated sections. */
export function usePagination({
  totalPages,
  initialPage = 1,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);

  const handlePrev = useCallback(() => {
    setPage((p) => (p > 1 ? p - 1 : p));
  }, []);

  const handleNext = useCallback(() => {
    setPage((p) => (p < totalPages ? p + 1 : p));
  }, [totalPages]);

  return {
    page,
    totalPages,
    handlePrev,
    handleNext,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
}

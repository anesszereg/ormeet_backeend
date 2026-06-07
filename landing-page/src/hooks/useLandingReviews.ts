"use client";

import { useEffect, useState } from "react";
import { fetchPublishedReviews, type LandingReview } from "@/lib/api";

export interface LandingReviewsState {
  reviews: LandingReview[];
  isLoading: boolean;
  hasLoaded: boolean;
}

/**
 * One-time fetch of approved reviews for the landing page Testimonials section.
 * Falls back to empty array so the component can use its static content.
 */
export function useLandingReviews(): LandingReviewsState {
  const [reviews, setReviews] = useState<LandingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchPublishedReviews();
      if (cancelled) return;
      setReviews(data);
      setIsLoading(false);
      setHasLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { reviews, isLoading, hasLoaded };
}

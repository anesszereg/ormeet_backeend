"use client";

import { useEffect, useState } from "react";
import { fetchPublishedEvents, type LandingEvent } from "@/lib/api";

export interface LandingEventsState {
  events: LandingEvent[];
  isLoading: boolean;
  /** True after the first fetch attempt completed (success or fail). */
  hasLoaded: boolean;
}

/**
 * One-time fetch of published events for the landing page. Components
 * can fall back to evergreen marketing content while `isLoading` is
 * true or when the API returns no events.
 */
export function useLandingEvents(): LandingEventsState {
  const [events, setEvents] = useState<LandingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchPublishedEvents();
      if (cancelled) return;
      setEvents(data);
      setIsLoading(false);
      setHasLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, isLoading, hasLoaded };
}

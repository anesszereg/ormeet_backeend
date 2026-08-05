"use client";

import { useEffect, useState } from "react";
import { fetchPublishedEvents, type LandingEvent } from "@/lib/api";

export interface LandingEventsState {
  events: LandingEvent[];
  isLoading: boolean;
  /** True after the first fetch attempt completed (success or fail). */
  hasLoaded: boolean;
}

/** Nombre de tentatives et délai entre elles (le backend Render gratuit se met
 *  en veille : la première requête peut échouer/expirer le temps qu'il se
 *  réveille, ce qui laissait la page vide). */
const MAX_ATTEMPTS = 4;
const RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch des événements publiés pour la landing. Réessaie tant que la réponse
 * est vide, pour absorber le réveil du backend. Les composants affichent le
 * skeleton tant que `isLoading` est vrai.
 */
export function useLandingEvents(): LandingEventsState {
  const [events, setEvents] = useState<LandingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const data = await fetchPublishedEvents();
        if (cancelled) return;
        if (data.length > 0 || attempt === MAX_ATTEMPTS) {
          setEvents(data);
          break;
        }
        // Réponse vide : probablement le backend encore endormi — on patiente.
        await sleep(RETRY_DELAY_MS);
        if (cancelled) return;
      }
      setIsLoading(false);
      setHasLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, isLoading, hasLoaded };
}

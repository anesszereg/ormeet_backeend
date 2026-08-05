import { normalizeForSearch, type Wilaya } from "@ormeet/i18n";
import type { LandingEvent } from "@/lib/api";

/**
 * Anciennes valeurs de catégorie encore présentes en base, rattachées à une
 * clé du référentiel. Les valeurs sans équivalent (Health & Wellness,
 * Education, Community, Other) restent visibles sous « Toutes les catégories »
 * mais ne remontent dans aucun filtre.
 */
const LEGACY_CATEGORY_ALIASES: Record<string, string> = {
  sport: "sports",
  "food & drink": "food",
  "food and drink": "food",
  technology: "tech",
  arts: "art",
};

/** Rapproche la catégorie d'un événement d'une clé du référentiel. */
export function matchesCategory(event: LandingEvent, categoryKey: string, searchTerm: string): boolean {
  const raw = normalizeForSearch(event.category || "");
  if (!raw) return false;
  const target = normalizeForSearch(searchTerm);
  if (raw === target || raw === categoryKey) return true;
  return LEGACY_CATEGORY_ALIASES[raw] === categoryKey;
}

/**
 * Un événement appartient à une wilaya si son lieu correspond à l'une des trois
 * graphies : le back peut stocker « Alger », « Algiers » ou « الجزائر ».
 */
export function matchesWilaya(event: LandingEvent, wilaya: Wilaya): boolean {
  const haystack = normalizeForSearch(`${event.city} ${event.venue}`);
  if (!haystack.trim()) return false;
  return [wilaya.fr, wilaya.en, wilaya.ar]
    .map(normalizeForSearch)
    .some((needle) => needle && haystack.includes(needle));
}

/** Événements dont la date de début n'est pas passée. */
export function upcomingOnly(events: LandingEvent[]): LandingEvent[] {
  const now = Date.now();
  return events.filter((e) => {
    if (!e.startAt) return true; // date inconnue : on ne masque pas l'événement
    const t = new Date(e.startAt).getTime();
    return Number.isNaN(t) || t >= now;
  });
}

/** Les plus proches en premier ; les dates inconnues finissent la liste. */
export function bySoonest(a: LandingEvent, b: LandingEvent): number {
  const ta = a.startAt ? new Date(a.startAt).getTime() : Number.POSITIVE_INFINITY;
  const tb = b.startAt ? new Date(b.startAt).getTime() : Number.POSITIVE_INFINITY;
  return (Number.isNaN(ta) ? Number.POSITIVE_INFINITY : ta) - (Number.isNaN(tb) ? Number.POSITIVE_INFINITY : tb);
}

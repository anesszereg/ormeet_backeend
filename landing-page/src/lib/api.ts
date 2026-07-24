import { BACKEND_ORIGIN } from "./constants";

/**
 * Raw shape returned by `GET /events` on the NestJS backend. Only the
 * fields the landing page actually consumes are typed; everything else
 * is left as `unknown` to keep this file decoupled from backend
 * internals.
 */
export interface BackendEvent {
  id: string;
  title: string;
  shortDescription?: string;
  category?: string | null;
  status?: string;
  images?: string[] | null;
  startAt?: string;
  endAt?: string;
  customLocation?: { city?: string; address?: string; country?: string } | null;
  venue?: {
    name?: string;
    city?: string;
    address?: string;
    country?: string;
  } | null;
  ticketTypes?: Array<{ price?: number | string }> | null;
  views?: number;
  favorites?: number;
}

/**
 * Normalized event shape consumed by the landing-page UI. Provides the
 * exact set of fields every section needs so components don't each have
 * to defensively reformat the raw API payload.
 */
export interface LandingEvent {
  id: string;
  title: string;
  /** Short month + day, e.g. "Apr 20". Empty string if no startAt. */
  date: string;
  /** Human-readable venue/city or "TBA". */
  venue: string;
  city: string;
  /** Free-form category label (e.g. "Music", "Open-mic night"). */
  category: string;
  /** First image URL (hero or gallery), or empty string if none. */
  image: string;
  /** Pre-formatted "$X.XX" minimum ticket price, or empty string. */
  price: string;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
};

const formatPrice = (
  ticketTypes?: BackendEvent["ticketTypes"],
): string => {
  if (!ticketTypes || ticketTypes.length === 0) return "";
  const prices = ticketTypes
    .map((t) => Number(t.price ?? NaN))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (prices.length === 0) return "";
  const min = Math.min(...prices);
  if (min === 0) return "Free";
  return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(min);
};

const resolveVenue = (e: BackendEvent): { venue: string; city: string } => {
  if (e.venue?.name) {
    return {
      venue: e.venue.name,
      city: e.venue.city || e.venue.country || "",
    };
  }
  if (e.customLocation?.city || e.customLocation?.address) {
    return {
      venue:
        e.customLocation.address ||
        e.customLocation.city ||
        "",
      city: e.customLocation.city || e.customLocation.country || "",
    };
  }
  return { venue: "TBA", city: "" };
};

export const normalizeEvent = (e: BackendEvent): LandingEvent => {
  const { venue, city } = resolveVenue(e);
  return {
    id: e.id,
    title: e.title,
    date: formatDate(e.startAt),
    venue,
    city,
    category: e.category || "",
    image: (e.images && e.images[0]) || "",
    price: formatPrice(e.ticketTypes),
  };
};

export interface LandingReview {
  id: string | number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

interface BackendReview {
  id: string;
  rating: number;
  comment?: string;
  user?: {
    name?: string;
    profilePhoto?: string;
  };
  event?: {
    title?: string;
  };
}

const FALLBACK_AVATARS = [
  "/images/landingPage/photoPorifle/mask-group-1.png",
  "/images/landingPage/photoPorifle/mask-group-2.png",
  "/images/landingPage/photoPorifle/mask-group.png",
  "/images/landingPage/photoPorifle/mask-group-3.png",
];

export const normalizeReview = (r: BackendReview, index: number): LandingReview => ({
  id: r.id,
  name: r.user?.name || "Ormeet User",
  role: r.event?.title ? `Attendee · ${r.event.title}` : "Event Attendee",
  avatar: r.user?.profilePhoto || FALLBACK_AVATARS[index % FALLBACK_AVATARS.length],
  rating: r.rating,
  text: r.comment || "",
});

/**
 * Fetch recent approved reviews from the backend. Returns an empty array on
 * any error so the landing page can fall back to its evergreen static content.
 */
export async function fetchPublishedReviews(): Promise<LandingReview[]> {
  try {
    const res = await fetch(
      `${BACKEND_ORIGIN}/reviews?approved=true`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as BackendReview[] | { data?: BackendReview[] };
    const list: BackendReview[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data!
        : [];
    return list
      .filter((r) => r.comment && r.comment.trim().length > 20)
      .slice(0, 18)
      .map(normalizeReview);
  } catch (err) {
    console.warn("[landing-page] failed to fetch reviews:", err);
    return [];
  }
}

/**
 * Fetch published events from the backend. Returns an empty array on
 * any error so the landing page can fall back to its evergreen mock
 * content without crashing.
 */
export async function fetchPublishedEvents(): Promise<LandingEvent[]> {
  try {
    const res = await fetch(
      `${BACKEND_ORIGIN}/events?status=published`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as BackendEvent[] | { data?: BackendEvent[] };
    const list: BackendEvent[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data!
        : [];
    return list.map(normalizeEvent);
  } catch (err) {
    console.warn("[landing-page] failed to fetch events:", err);
    return [];
  }
}

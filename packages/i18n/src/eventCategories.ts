/**
 * Référentiel des types d'événements de la plateforme.
 *
 * Sélection cadrée sur le marché algérien : on privilégie les formats qui
 * remplissent réellement une salle ici (concerts, foot, stand-up, salons,
 * formations, salon du livre, randonnée, e-sport) et on écarte les formats
 * qui ne correspondent pas au public local (vie nocturne, rencontres).
 *
 * Source unique : landing page, filtres de recherche, création d'événement.
 * Les libellés sont dans les fichiers de traduction, sous `common.eventCategories`.
 * Ne jamais dupliquer cette liste ailleurs.
 */
export interface EventCategory {
  /** Clé de traduction dans `common.eventCategories`. */
  key: string;
  /** Terme envoyé au moteur de recherche de l'app (paramètre `event`). */
  searchTerm: string;
}

export const eventCategories: readonly EventCategory[] = [
  { key: 'music', searchTerm: 'Music' },
  { key: 'sports', searchTerm: 'Sports' },
  { key: 'comedy', searchTerm: 'Comedy' },
  { key: 'theater', searchTerm: 'Theater' },
  { key: 'cinema', searchTerm: 'Cinema' },
  { key: 'conference', searchTerm: 'Conference' },
  { key: 'workshop', searchTerm: 'Workshop' },
  { key: 'expo', searchTerm: 'Expo' },
  { key: 'business', searchTerm: 'Business' },
  { key: 'tech', searchTerm: 'Tech' },
  { key: 'art', searchTerm: 'Art' },
  { key: 'books', searchTerm: 'Books' },
  { key: 'food', searchTerm: 'Food & Drink' },
  { key: 'outdoor', searchTerm: 'Outdoor' },
  { key: 'gaming', searchTerm: 'Gaming' }
];

export type EventCategoryKey = (typeof eventCategories)[number]['key'];

export const eventCategoryKeys: readonly string[] = eventCategories.map((c) => c.key);

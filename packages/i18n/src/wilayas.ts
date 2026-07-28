import type { Locale } from './config';

/**
 * Référentiel des 58 wilayas d'Algérie (découpage administratif de 2019).
 *
 * Source unique pour tous les champs qui manipulent une wilaya :
 * recherche de la landing page, filtres de recherche et création d'événement.
 * Ne jamais dupliquer cette liste ailleurs.
 */
export interface Wilaya {
  /** Code administratif officiel, de 1 à 58. */
  code: number;
  fr: string;
  en: string;
  ar: string;
}

export const wilayas: readonly Wilaya[] = [
  { code: 1, fr: 'Adrar', en: 'Adrar', ar: 'أدرار' },
  { code: 2, fr: 'Chlef', en: 'Chlef', ar: 'الشلف' },
  { code: 3, fr: 'Laghouat', en: 'Laghouat', ar: 'الأغواط' },
  { code: 4, fr: 'Oum El Bouaghi', en: 'Oum El Bouaghi', ar: 'أم البواقي' },
  { code: 5, fr: 'Batna', en: 'Batna', ar: 'باتنة' },
  { code: 6, fr: 'Béjaïa', en: 'Bejaia', ar: 'بجاية' },
  { code: 7, fr: 'Biskra', en: 'Biskra', ar: 'بسكرة' },
  { code: 8, fr: 'Béchar', en: 'Bechar', ar: 'بشار' },
  { code: 9, fr: 'Blida', en: 'Blida', ar: 'البليدة' },
  { code: 10, fr: 'Bouira', en: 'Bouira', ar: 'البويرة' },
  { code: 11, fr: 'Tamanrasset', en: 'Tamanrasset', ar: 'تمنراست' },
  { code: 12, fr: 'Tébessa', en: 'Tebessa', ar: 'تبسة' },
  { code: 13, fr: 'Tlemcen', en: 'Tlemcen', ar: 'تلمسان' },
  { code: 14, fr: 'Tiaret', en: 'Tiaret', ar: 'تيارت' },
  { code: 15, fr: 'Tizi Ouzou', en: 'Tizi Ouzou', ar: 'تيزي وزو' },
  { code: 16, fr: 'Alger', en: 'Algiers', ar: 'الجزائر' },
  { code: 17, fr: 'Djelfa', en: 'Djelfa', ar: 'الجلفة' },
  { code: 18, fr: 'Jijel', en: 'Jijel', ar: 'جيجل' },
  { code: 19, fr: 'Sétif', en: 'Setif', ar: 'سطيف' },
  { code: 20, fr: 'Saïda', en: 'Saida', ar: 'سعيدة' },
  { code: 21, fr: 'Skikda', en: 'Skikda', ar: 'سكيكدة' },
  { code: 22, fr: 'Sidi Bel Abbès', en: 'Sidi Bel Abbes', ar: 'سيدي بلعباس' },
  { code: 23, fr: 'Annaba', en: 'Annaba', ar: 'عنابة' },
  { code: 24, fr: 'Guelma', en: 'Guelma', ar: 'قالمة' },
  { code: 25, fr: 'Constantine', en: 'Constantine', ar: 'قسنطينة' },
  { code: 26, fr: 'Médéa', en: 'Medea', ar: 'المدية' },
  { code: 27, fr: 'Mostaganem', en: 'Mostaganem', ar: 'مستغانم' },
  { code: 28, fr: "M'Sila", en: "M'Sila", ar: 'المسيلة' },
  { code: 29, fr: 'Mascara', en: 'Mascara', ar: 'معسكر' },
  { code: 30, fr: 'Ouargla', en: 'Ouargla', ar: 'ورقلة' },
  { code: 31, fr: 'Oran', en: 'Oran', ar: 'وهران' },
  { code: 32, fr: 'El Bayadh', en: 'El Bayadh', ar: 'البيض' },
  { code: 33, fr: 'Illizi', en: 'Illizi', ar: 'إليزي' },
  { code: 34, fr: 'Bordj Bou Arréridj', en: 'Bordj Bou Arreridj', ar: 'برج بوعريريج' },
  { code: 35, fr: 'Boumerdès', en: 'Boumerdes', ar: 'بومرداس' },
  { code: 36, fr: 'El Tarf', en: 'El Tarf', ar: 'الطارف' },
  { code: 37, fr: 'Tindouf', en: 'Tindouf', ar: 'تندوف' },
  { code: 38, fr: 'Tissemsilt', en: 'Tissemsilt', ar: 'تيسمسيلت' },
  { code: 39, fr: 'El Oued', en: 'El Oued', ar: 'الوادي' },
  { code: 40, fr: 'Khenchela', en: 'Khenchela', ar: 'خنشلة' },
  { code: 41, fr: 'Souk Ahras', en: 'Souk Ahras', ar: 'سوق أهراس' },
  { code: 42, fr: 'Tipaza', en: 'Tipaza', ar: 'تيبازة' },
  { code: 43, fr: 'Mila', en: 'Mila', ar: 'ميلة' },
  { code: 44, fr: 'Aïn Defla', en: 'Ain Defla', ar: 'عين الدفلى' },
  { code: 45, fr: 'Naâma', en: 'Naama', ar: 'النعامة' },
  { code: 46, fr: 'Aïn Témouchent', en: 'Ain Temouchent', ar: 'عين تموشنت' },
  { code: 47, fr: 'Ghardaïa', en: 'Ghardaia', ar: 'غرداية' },
  { code: 48, fr: 'Relizane', en: 'Relizane', ar: 'غليزان' },
  { code: 49, fr: 'Timimoun', en: 'Timimoun', ar: 'تيميمون' },
  { code: 50, fr: 'Bordj Badji Mokhtar', en: 'Bordj Badji Mokhtar', ar: 'برج باجي مختار' },
  { code: 51, fr: 'Ouled Djellal', en: 'Ouled Djellal', ar: 'أولاد جلال' },
  { code: 52, fr: 'Béni Abbès', en: 'Beni Abbes', ar: 'بني عباس' },
  { code: 53, fr: 'In Salah', en: 'In Salah', ar: 'عين صالح' },
  { code: 54, fr: 'In Guezzam', en: 'In Guezzam', ar: 'عين قزام' },
  { code: 55, fr: 'Touggourt', en: 'Touggourt', ar: 'تقرت' },
  { code: 56, fr: 'Djanet', en: 'Djanet', ar: 'جانت' },
  { code: 57, fr: "El M'Ghair", en: "El M'Ghair", ar: 'المغير' },
  { code: 58, fr: 'El Meniaa', en: 'El Meniaa', ar: 'المنيعة' }
];

/**
 * Wilayas proposées par défaut, avant toute saisie de l'utilisateur.
 * Sélection produit (les 10 principales), dans l'ordre d'affichage voulu —
 * ce n'est pas un tri par code. Dès que l'utilisateur tape, la recherche
 * porte sur les 58 wilayas.
 */
export const popularWilayaCodes: readonly number[] = [
  16, // Alger
  31, // Oran
  25, // Constantine
  35, // Boumerdès
  19, // Sétif
  15, // Tizi Ouzou
  13, // Tlemcen
  9, // Blida
  23, // Annaba
  5 // Batna
];

export const popularWilayas: readonly Wilaya[] = popularWilayaCodes.map((code) => {
  const wilaya = wilayas.find((w) => w.code === code);
  if (!wilaya) {
    throw new Error(`popularWilayaCodes: code de wilaya inconnu (${code})`);
  }
  return wilaya;
});

/** Libellé affiché : « 16 - Alger », « 16 - الجزائر ». */
export function wilayaLabel(wilaya: Wilaya, locale: Locale): string {
  return `${String(wilaya.code).padStart(2, '0')} - ${wilaya[locale]}`;
}

/**
 * Normalise une saisie pour la comparaison : minuscules, sans accents latins
 * et sans diacritiques arabes. Permet de trouver « Béjaïa » en tapant « bejaia ».
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // accents latins (é → e)
    .replace(/[ً-ْـ]/g, '') // tashkîl et tatweel arabes
    .replace(/[أإآ]/g, 'ا') // variantes du alif
    .toLowerCase()
    .trim();
}

/**
 * Wilayas correspondant à la saisie, comparées sur le code et sur les trois
 * langues — l'utilisateur peut taper « 16 », « alger » ou « الجزائر ».
 * Une saisie vide renvoie la liste complète.
 */
export function searchWilayas(query: string, locale: Locale): readonly Wilaya[] {
  const needle = normalizeForSearch(query);
  if (!needle) return wilayas;
  return wilayas.filter((wilaya) => {
    if (String(wilaya.code).padStart(2, '0').startsWith(needle)) return true;
    if (normalizeForSearch(wilaya[locale]).includes(needle)) return true;
    return (['fr', 'en', 'ar'] as const).some((lang) =>
      normalizeForSearch(wilaya[lang]).includes(needle)
    );
  });
}

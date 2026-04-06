export interface CarouselEvent {
  id: number;
  image: string;
  title: string;
  date: string;
  venue: string;
}

export interface TrendingEvent {
  id: number;
  image: string;
  title: string;
  price: string;
  badge: string | null;
  badgeColor: "blue" | "red" | null;
}

export interface CaliforniaEvent {
  id: number;
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge: string | null;
  badgeColor: "green" | "red" | null;
}

export interface CategoryCard {
  id: number;
  label: string;
  image: string;
}

export interface CityCard {
  id: number;
  name: string;
  price: string;
  image: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
}

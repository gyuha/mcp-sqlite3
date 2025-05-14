export interface Film {
  film_id: number;
  title: string;
  description: string;
  release_year: number;
  language_id: number;
  original_language_id: number | null;
  rental_duration: number;
  rental_rate: number;
  length: number | null;
  replacement_cost: number;
  rating: string;
  special_features: string | null;
  last_update: string;
}

export interface FilmWithCategory extends Film {
  category_name: string;
  category_id: number;
}

export interface FilmWithDetails extends Film {
  language_name: string;
  categories: { category_id: number; name: string }[];
  actors: { actor_id: number; first_name: string; last_name: string }[];
  inventory_count: number;
  available_count: number;
}

export interface FilmFilterParams {
  title?: string;
  categoryId?: number;
  releaseYear?: number;
  rating?: string;
  actorId?: number;
  minLength?: number;
  maxLength?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface Category {
  category_id: number;
  name: string;
  last_update: string;
}

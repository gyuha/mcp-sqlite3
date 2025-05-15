export interface Rental {
  rental_id: number;
  rental_date: string;
  inventory_id: number;
  customer_id: number;
  return_date: string | null;
  staff_id: number;
  last_update: string;
}

export interface RentalWithDetails extends Rental {
  film_id: number;
  film_title: string;
  film_rental_rate: number;
  store_id: number;
  customer_name: string;
  customer_email: string | null;
  staff_name: string;
  overdue: boolean;
  days_overdue?: number;
  late_fee?: number;
}

export interface RentalFilterParams {
  customerId?: number;
  filmId?: number;
  storeId?: number;
  staffId?: number;
  status?: 'all' | 'returned' | 'outstanding' | 'overdue';
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface NewRental {
  inventory_id: number;
  customer_id: number;
  staff_id: number;
  return_date?: string | null;
}

export interface Inventory {
  inventory_id: number;
  film_id: number;
  store_id: number;
  last_update: string;
  available: boolean;
  film_title?: string;
  rental_rate?: number;
}

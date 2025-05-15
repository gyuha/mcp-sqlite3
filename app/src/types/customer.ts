export interface Address {
  address_id: number;
  address: string;
  address2: string | null;
  district: string;
  city_id: number;
  postal_code: string | null;
  phone: string;
  last_update: string;
  city_name?: string;
  country_name?: string;
}

export interface Customer {
  customer_id: number;
  store_id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  address_id: number;
  active: boolean;
  create_date: string;
  last_update: string;
  address?: Address;
}

export interface CustomerWithDetails extends Customer {
  address: Address & {
    city_name: string;
    country_name: string;
  };
  rental_count: number;
  total_payments: number;
}

export interface NewCustomer {
  store_id: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  address2?: string;
  district: string;
  city_id: number;
  postal_code?: string;
  phone: string;
  active: boolean;
}

export interface CustomerFilterParams {
  name?: string;
  email?: string;
  active?: boolean;
  storeId?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

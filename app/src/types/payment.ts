export interface Payment {
  payment_id: number;
  customer_id: number;
  staff_id: number;
  rental_id: number | null;
  amount: number;
  payment_date: string;
  last_update: string;
}

export interface PaymentWithDetails extends Payment {
  customer_name: string;
  customer_email: string;
  staff_name: string;
  film_title?: string;
  rental_date?: string;
  return_date?: string;
  payment_type: 'rental' | 'late_fee' | 'other';
}

export interface NewPayment {
  customer_id: number;
  staff_id: number;
  rental_id?: number;
  amount: number;
  payment_type?: 'rental' | 'late_fee' | 'other';
}

export interface PaymentFilterParams {
  customerId?: number;
  staffId?: number;
  rentalId?: number;
  paymentType?: 'rental' | 'late_fee' | 'other' | 'all';
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  rental_payments: number;
  rental_amount: number;
  late_fee_payments: number;
  late_fee_amount: number;
  other_payments: number;
  other_amount: number;
  daily_stats?: {
    date: string;
    count: number;
    amount: number;
  }[];
  monthly_stats?: {
    year_month: string;
    count: number;
    amount: number;
  }[];
}

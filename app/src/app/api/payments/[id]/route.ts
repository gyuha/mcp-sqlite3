import { NextResponse } from 'next/server';
import { getRecord } from '@/lib/db';
import { PaymentWithDetails } from '@/types/payment';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    const paymentId = parseInt(params.id);
    
    if (isNaN(paymentId)) {
      return NextResponse.json({ error: '유효하지 않은 결제 ID입니다.' }, { status: 400 });
    }
    
    const sql = `
      SELECT 
        p.payment_id, p.customer_id, p.staff_id, p.rental_id, p.amount, p.payment_date, p.last_update,
        c.first_name || ' ' || c.last_name AS customer_name, c.email AS customer_email,
        s.first_name || ' ' || s.last_name AS staff_name,
        f.title AS film_title,
        r.rental_date, r.return_date,
        CASE 
          WHEN r.rental_id IS NULL THEN 'other'
          WHEN r.return_date IS NULL THEN 'rental'
          WHEN r.return_date > date(r.rental_date, '+' || f.rental_duration || ' days') THEN 'late_fee'
          ELSE 'rental'
        END AS payment_type
      FROM payment p
      JOIN customer c ON p.customer_id = c.customer_id
      JOIN staff s ON p.staff_id = s.staff_id
      LEFT JOIN rental r ON p.rental_id = r.rental_id
      LEFT JOIN inventory i ON r.inventory_id = i.inventory_id
      LEFT JOIN film f ON i.film_id = f.film_id
      WHERE p.payment_id = :paymentId
    `;
    
    const payment = getRecord<PaymentWithDetails>(sql, { paymentId });
    
    if (!payment) {
      return NextResponse.json({ error: '해당 결제 정보를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    return NextResponse.json(payment);
  } catch (error) {
    console.error('결제 상세 정보 조회 오류:', error);
    return NextResponse.json({ error: '결제 정보를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

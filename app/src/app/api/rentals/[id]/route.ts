import { NextRequest, NextResponse } from 'next/server';
import { getRecord, executeQuery } from '@/lib/db-utils';
import { RentalWithDetails } from '@/types/rental';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rentalId = parseInt(params.id);

    if (isNaN(rentalId)) {
      return NextResponse.json(
        { error: '유효하지 않은 대여 ID입니다.' },
        { status: 400 }
      );
    }

    // 대여 상세 정보 조회
    const rentalSql = `
      SELECT 
        r.rental_id, 
        r.rental_date, 
        r.inventory_id, 
        r.customer_id, 
        r.return_date, 
        r.staff_id,
        r.last_update,
        i.film_id,
        i.store_id,
        f.title as film_title,
        f.description as film_description,
        f.release_year,
        f.language_id,
        f.original_language_id,
        f.rental_duration,
        f.rental_rate as film_rental_rate,
        f.length,
        f.replacement_cost,
        f.rating,
        f.special_features,
        l.name as language_name,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        s.first_name || ' ' || s.last_name as staff_name,
        st.store_id,
        a.address as store_address,
        ci.city as store_city,
        co.country as store_country,
        CASE
          WHEN r.return_date IS NULL AND date('now') > date(r.rental_date, '+' || f.rental_duration || ' days') THEN 1
          ELSE 0
        END as overdue,
        CASE
          WHEN r.return_date IS NULL AND date('now') > date(r.rental_date, '+' || f.rental_duration || ' days')
          THEN julianday('now') - julianday(date(r.rental_date, '+' || f.rental_duration || ' days'))
          ELSE 0
        END as days_overdue,
        CASE
          WHEN r.return_date IS NULL AND date('now') > date(r.rental_date, '+' || f.rental_duration || ' days')
          THEN (julianday('now') - julianday(date(r.rental_date, '+' || f.rental_duration || ' days'))) * f.rental_rate
          ELSE 0
        END as late_fee,
        date(r.rental_date, '+' || f.rental_duration || ' days') as due_date
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      JOIN language l ON f.language_id = l.language_id
      JOIN customer c ON r.customer_id = c.customer_id
      JOIN staff s ON r.staff_id = s.staff_id
      JOIN store st ON i.store_id = st.store_id
      JOIN address a ON st.address_id = a.address_id
      JOIN city ci ON a.city_id = ci.city_id
      JOIN country co ON ci.country_id = co.country_id
      WHERE r.rental_id = :rentalId
    `;

    const rental = getRecord<RentalWithDetails & {
      film_description: string;
      release_year: number;
      language_name: string;
      rental_duration: number;
      length: number;
      replacement_cost: number;
      rating: string;
      special_features: string;
      store_address: string;
      store_city: string;
      store_country: string;
      due_date: string;
    }>(rentalSql, { rentalId });

    if (!rental) {
      return NextResponse.json(
        { error: '대여 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 결제 정보 조회
    const paymentSql = `
      SELECT 
        payment_id,
        amount,
        payment_date
      FROM payment
      WHERE rental_id = :rentalId
      ORDER BY payment_date
    `;

    const payments = executeQuery(paymentSql, { rentalId });

    // 해당 영화의 현재 대여 가능한 재고 수
    const availableInventorySql = `
      SELECT COUNT(*) as available_count
      FROM inventory i
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE i.film_id = :filmId
        AND i.store_id = :storeId
        AND r.rental_id IS NULL
    `;

    const availableInventory = getRecord<{ available_count: number }>(
      availableInventorySql, 
      { filmId: rental.film_id, storeId: rental.store_id }
    );

    // 응답 데이터 생성
    const response = {
      rental,
      payments,
      additional_info: {
        available_inventory: availableInventory?.available_count || 0
      }
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('대여 상세 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '대여 정보를 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

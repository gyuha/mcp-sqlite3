import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord, update } from '@/lib/db-utils';

export async function PUT(
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

    // 대여 정보 확인
    const rentalSql = `
      SELECT 
        r.rental_id, 
        r.rental_date, 
        r.inventory_id, 
        r.customer_id, 
        r.return_date, 
        r.staff_id,
        f.film_id,
        f.title as film_title,
        f.rental_rate,
        f.rental_duration,
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
        END as late_fee
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE r.rental_id = :rentalId
    `;
    
    const rental = getRecord<{
      rental_id: number;
      return_date: string | null;
      overdue: number;
      days_overdue: number;
      late_fee: number;
    }>(rentalSql, { rentalId });

    if (!rental) {
      return NextResponse.json(
        { error: '대여 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (rental.return_date) {
      return NextResponse.json(
        { error: '이미 반납된 대여입니다.', returnDate: rental.return_date },
        { status: 400 }
      );
    }

    // 반납 처리
    const returnDate = new Date().toISOString();
    const updateData = {
      return_date: returnDate,
      last_update: returnDate
    };

    update('rental', rentalId, updateData, 'rental_id');

    // 연체료가 있다면 추가 결제 생성 (선택사항)
    let paymentId = null;
    if (rental.overdue && rental.late_fee > 0) {
      const paymentSql = `
        INSERT INTO payment (
          customer_id, 
          staff_id, 
          rental_id, 
          amount, 
          payment_date, 
          last_update
        )
        SELECT 
          r.customer_id,
          r.staff_id,
          r.rental_id,
          :lateFee,
          :paymentDate,
          :lastUpdate
        FROM rental r
        WHERE r.rental_id = :rentalId
        RETURNING payment_id
      `;

      const paymentResult = executeQuery(paymentSql, {
        rentalId,
        lateFee: rental.late_fee,
        paymentDate: returnDate,
        lastUpdate: returnDate
      });

      if (paymentResult && paymentResult.length > 0) {
        paymentId = paymentResult[0].payment_id;
      }
    }

    // 반납 처리 결과 반환
    const result = {
      rentalId: rental.rental_id,
      returnDate,
      wasOverdue: rental.overdue === 1,
      daysOverdue: rental.days_overdue,
      lateFee: rental.late_fee,
      latePaymentId: paymentId
    };

    return NextResponse.json({
      message: '영화가 성공적으로 반납되었습니다.',
      rental: result
    });
  } catch (error: any) {
    console.error('영화 반납 처리 오류:', error);
    return NextResponse.json(
      { error: '영화 반납 처리 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

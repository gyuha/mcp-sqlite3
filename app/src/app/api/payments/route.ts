import { NextResponse, NextRequest } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db';
import { PaymentFilterParams, PaymentWithDetails } from '@/types/payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // 필터링 파라미터 추출
    const filters: PaymentFilterParams = {
      customerId: searchParams.get('customerId') ? parseInt(searchParams.get('customerId') as string) : undefined,
      staffId: searchParams.get('staffId') ? parseInt(searchParams.get('staffId') as string) : undefined,
      rentalId: searchParams.get('rentalId') ? parseInt(searchParams.get('rentalId') as string) : undefined,
      paymentType: searchParams.get('paymentType') as PaymentFilterParams['paymentType'] || undefined,
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount') as string) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount') as string) : undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'payment_date',
      sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' || 'desc'
    };

    // 페이지네이션 파라미터 추출
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10;
    const offset = (page - 1) * limit;

    // 결제 목록 조회 SQL
    let sql = `
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
      WHERE 1=1
    `;

    const queryParams: Record<string, any> = {};

    // 필터 조건 적용
    if (filters.customerId) {
      sql += ' AND p.customer_id = :customerId';
      queryParams.customerId = filters.customerId;
    }

    if (filters.staffId) {
      sql += ' AND p.staff_id = :staffId';
      queryParams.staffId = filters.staffId;
    }

    if (filters.rentalId) {
      sql += ' AND p.rental_id = :rentalId';
      queryParams.rentalId = filters.rentalId;
    }

    if (filters.paymentType && filters.paymentType !== 'all') {
      if (filters.paymentType === 'rental') {
        sql += " AND (r.return_date IS NULL OR r.return_date <= date(r.rental_date, '+' || f.rental_duration || ' days'))";
      } else if (filters.paymentType === 'late_fee') {
        sql += " AND r.return_date > date(r.rental_date, '+' || f.rental_duration || ' days')";
      } else if (filters.paymentType === 'other') {
        sql += " AND r.rental_id IS NULL";
      }
    }

    if (filters.minAmount) {
      sql += ' AND p.amount >= :minAmount';
      queryParams.minAmount = filters.minAmount;
    }

    if (filters.maxAmount) {
      sql += ' AND p.amount <= :maxAmount';
      queryParams.maxAmount = filters.maxAmount;
    }

    if (filters.startDate) {
      sql += ' AND date(p.payment_date) >= date(:startDate)';
      queryParams.startDate = filters.startDate;
    }

    if (filters.endDate) {
      sql += ' AND date(p.payment_date) <= date(:endDate)';
      queryParams.endDate = filters.endDate;
    }

    // 정렬 조건 적용
    const validSortColumns = ['payment_id', 'customer_name', 'staff_name', 'film_title', 'amount', 'payment_date', 'payment_type'];
    let sortBy = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'payment_date';
    
    sql += ` ORDER BY ${sortBy} ${filters.sortDirection === 'asc' ? 'ASC' : 'DESC'}`;

    // 페이지네이션 적용
    sql += ` LIMIT :limit OFFSET :offset`;
    queryParams.limit = limit;
    queryParams.offset = offset;

    // 전체 결제 수 조회 SQL
    let countSql = `
      SELECT COUNT(*) as total 
      FROM payment p
      LEFT JOIN rental r ON p.rental_id = r.rental_id
      LEFT JOIN inventory i ON r.inventory_id = i.inventory_id
      LEFT JOIN film f ON i.film_id = f.film_id
      WHERE 1=1
    `;

    // 필터 조건 복사
    Object.keys(queryParams).forEach(key => {
      if (key !== 'limit' && key !== 'offset') {
        countSql += ` AND ${sql.split(` AND ${key}`)[1].split(' AND ')[0]}`;
      }
    });

    const payments = executeQuery<PaymentWithDetails>(sql, queryParams);
    const totalCount = getRecord<{ total: number }>(countSql, queryParams);

    return NextResponse.json({
      data: payments,
      pagination: {
        total: totalCount?.total || 0,
        page,
        limit,
        pages: totalCount ? Math.ceil(totalCount.total / limit) : 0
      }
    });
  } catch (error) {
    console.error('결제 목록 조회 오류:', error);
    return NextResponse.json({ error: '결제 목록을 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, staff_id, rental_id, amount } = body;
    
    // 필수 필드 검증
    if (!customer_id || !staff_id || !amount) {
      return NextResponse.json({ error: '고객 ID, 직원 ID, 결제 금액은 필수입니다.' }, { status: 400 });
    }
    
    // 결제 데이터 삽입
    const sql = `
      INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
      VALUES (:customer_id, :staff_id, :rental_id, :amount, datetime('now'))
    `;
    
    const params = {
      customer_id,
      staff_id,
      rental_id: rental_id || null,
      amount,
    };
    
    executeQuery(sql, params);
    
    // 삽입된 결제 정보 조회
    const newPaymentSql = `
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
      ORDER BY p.payment_id DESC
      LIMIT 1
    `;
    
    const newPayment = getRecord<PaymentWithDetails>(newPaymentSql);
    
    return NextResponse.json({ 
      message: '결제가 성공적으로 처리되었습니다.',
      payment: newPayment 
    });
  } catch (error) {
    console.error('결제 처리 오류:', error);
    return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

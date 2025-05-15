import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getPaginatedData, getRecord, insert } from '@/lib/db-utils';
import { RentalFilterParams, NewRental } from '@/types/rental';

export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 필터링 및 정렬 매개변수 추출
    const filters: RentalFilterParams = {
      customerId: searchParams.has('customerId') ? Number(searchParams.get('customerId')) : undefined,
      filmId: searchParams.has('filmId') ? Number(searchParams.get('filmId')) : undefined,
      storeId: searchParams.has('storeId') ? Number(searchParams.get('storeId')) : undefined,
      staffId: searchParams.has('staffId') ? Number(searchParams.get('staffId')) : undefined,
      status: searchParams.get('status') as 'all' | 'returned' | 'outstanding' | 'overdue' || 'all',
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'rental_date',
      sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
    };
    
    // 페이지네이션 파라미터 추출
    const page = searchParams.has('page') ? Math.max(1, Number(searchParams.get('page'))) : 1;
    const pageSize = searchParams.has('pageSize') ? Math.min(100, Math.max(1, Number(searchParams.get('pageSize')))) : 10;
    
    // 기본 SQL 쿼리 구성
    let sql = `
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
        f.rental_rate as film_rental_rate,
        f.rental_duration,
        c.first_name || ' ' || c.last_name as customer_name,
        c.email as customer_email,
        s.first_name || ' ' || s.last_name as staff_name,
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
      JOIN customer c ON r.customer_id = c.customer_id
      JOIN staff s ON r.staff_id = s.staff_id
    `;
    
    // 필터 조건 추가를 위한 WHERE 절과 매개변수
    const whereConditions: string[] = [];
    const sqlParams: Record<string, any> = {};
    
    // 고객 ID 필터
    if (filters.customerId) {
      whereConditions.push("r.customer_id = :customerId");
      sqlParams.customerId = filters.customerId;
    }
    
    // 영화 ID 필터
    if (filters.filmId) {
      whereConditions.push("i.film_id = :filmId");
      sqlParams.filmId = filters.filmId;
    }
    
    // 매장 ID 필터
    if (filters.storeId) {
      whereConditions.push("i.store_id = :storeId");
      sqlParams.storeId = filters.storeId;
    }
    
    // 직원 ID 필터
    if (filters.staffId) {
      whereConditions.push("r.staff_id = :staffId");
      sqlParams.staffId = filters.staffId;
    }
    
    // 상태 필터 (반납됨, 미반납, 연체)
    if (filters.status) {
      switch (filters.status) {
        case 'returned':
          whereConditions.push("r.return_date IS NOT NULL");
          break;
        case 'outstanding':
          whereConditions.push("r.return_date IS NULL");
          break;
        case 'overdue':
          whereConditions.push(`
            r.return_date IS NULL AND 
            date('now') > date(r.rental_date, '+' || f.rental_duration || ' days')
          `);
          break;
        // 'all'의 경우 필터 없음
      }
    }
    
    // 날짜 범위 필터
    if (filters.startDate) {
      whereConditions.push("date(r.rental_date) >= :startDate");
      sqlParams.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
      whereConditions.push("date(r.rental_date) <= :endDate");
      sqlParams.endDate = filters.endDate;
    }
    
    // WHERE 절 추가
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // 정렬 추가
    const validSortColumns = ['rental_date', 'return_date', 'customer_name', 'film_title', 'days_overdue', 'late_fee'];
    const sortColumn = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'rental_date';
    sql += ` ORDER BY ${sortColumn} ${filters.sortDirection === 'asc' ? 'ASC' : 'DESC'}`;
    
    // 페이지네이션을 적용하여 데이터 조회
    const result = await getPaginatedData(sql, page, pageSize, sqlParams);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('대여 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '대여 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as NewRental;
    
    // 필수 필드 검증
    const requiredFields = ['inventory_id', 'customer_id', 'staff_id'];
    
    for (const field of requiredFields) {
      if (!data[field as keyof NewRental]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }
    
    // 재고 항목이 대여 가능한지 확인
    const inventoryCheckSql = `
      SELECT i.inventory_id
      FROM inventory i
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
      WHERE i.inventory_id = :inventoryId AND r.rental_id IS NULL
    `;
    
    const availableInventory = getRecord(inventoryCheckSql, { inventoryId: data.inventory_id });
    
    if (!availableInventory) {
      return NextResponse.json(
        { error: '해당 재고 항목은 현재 대여 불가능합니다.' },
        { status: 400 }
      );
    }
    
    // 대여 정보 저장
    const rentalData = {
      inventory_id: data.inventory_id,
      customer_id: data.customer_id,
      staff_id: data.staff_id,
      rental_date: new Date().toISOString(),
      return_date: data.return_date || null,
      last_update: new Date().toISOString()
    };
    
    const rentalId = insert('rental', rentalData);
    
    // 대여 정보에 대한 결제 생성 (제거 가능)
    const getFilmSql = `
      SELECT f.rental_rate
      FROM inventory i
      JOIN film f ON i.film_id = f.film_id
      WHERE i.inventory_id = :inventoryId
    `;
    
    const filmInfo = getRecord<{ rental_rate: number }>(getFilmSql, { inventoryId: data.inventory_id });
    
    if (filmInfo) {
      const paymentData = {
        customer_id: data.customer_id,
        staff_id: data.staff_id,
        rental_id: rentalId,
        amount: filmInfo.rental_rate,
        payment_date: new Date().toISOString(),
        last_update: new Date().toISOString()
      };
      
      const paymentId = insert('payment', paymentData);
    }
    
    // 생성된 대여 정보 조회
    const newRentalSql = `
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
        f.rental_rate,
        c.first_name || ' ' || c.last_name as customer_name,
        s.first_name || ' ' || s.last_name as staff_name
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      JOIN customer c ON r.customer_id = c.customer_id
      JOIN staff s ON r.staff_id = s.staff_id
      WHERE r.rental_id = :rentalId
    `;
    
    const newRental = getRecord(newRentalSql, { rentalId });
    
    return NextResponse.json({ 
      message: '대여가 성공적으로 생성되었습니다.',
      rental: newRental 
    }, { status: 201 });
  } catch (error: any) {
    console.error('대여 생성 오류:', error);
    return NextResponse.json(
      { error: '대여 정보를 생성하는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

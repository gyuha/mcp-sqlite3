import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db';

export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  address_id: number;
  email: string;
  store_id: number;
  active: boolean;
  username: string;
  last_update: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  phone: string;
  store_name: string;
  rental_count: number;
  payment_count: number;
  total_revenue: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 검색 및 필터 파라미터
    const searchTerm = searchParams.get('search') || '';
    const storeId = searchParams.get('storeId') ? parseInt(searchParams.get('storeId') as string) : null;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // WHERE 절 조건 구성
    const conditions = [];
    const params: any = {};
    
    if (searchTerm) {
      conditions.push('(s.first_name LIKE :search OR s.last_name LIKE :search OR s.email LIKE :search OR s.username LIKE :search)');
      params.search = `%${searchTerm}%`;
    }
    
    if (storeId !== null) {
      conditions.push('s.store_id = :storeId');
      params.storeId = storeId;
    }
    
    if (activeOnly) {
      conditions.push('s.active = 1');
    }
    
    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : '';
    
    // 직원 목록 조회
    const query = `
      SELECT
        s.staff_id,
        s.first_name,
        s.last_name,
        s.address_id,
        s.email,
        s.store_id,
        s.active,
        s.username,
        s.last_update,
        a.address,
        c.city,
        co.country,
        a.postal_code,
        a.phone,
        (SELECT c.city FROM store st JOIN address a ON st.address_id = a.address_id JOIN city c ON a.city_id = c.city_id WHERE st.store_id = s.store_id) as store_name,
        (SELECT COUNT(*) FROM rental r WHERE r.staff_id = s.staff_id) as rental_count,
        (SELECT COUNT(*) FROM payment p WHERE p.staff_id = s.staff_id) as payment_count,
        (SELECT SUM(amount) FROM payment p WHERE p.staff_id = s.staff_id) as total_revenue
      FROM staff s
      JOIN address a ON s.address_id = a.address_id
      JOIN city c ON a.city_id = c.city_id
      JOIN country co ON c.country_id = co.country_id
      ${whereClause}
      ORDER BY s.staff_id
    `;
    
    const staffList = await executeQuery<Staff>(query, params);
    
    // 직원 요약 정보
    const summaryQuery = `
      SELECT
        COUNT(*) as total_staff,
        SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END) as active_staff,
        SUM(CASE WHEN active = 0 THEN 1 ELSE 0 END) as inactive_staff
      FROM staff
    `;
    
    const summary = await getRecord<{
      total_staff: number;
      active_staff: number;
      inactive_staff: number;
    }>(summaryQuery);
    
    return NextResponse.json({
      staff: staffList,
      summary
    });
  } catch (error) {
    console.error('직원 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '직원 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

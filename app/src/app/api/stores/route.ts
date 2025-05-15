import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-utils';

export async function GET() {
  try {
    // SQL 쿼리 - 매장 정보와 함께 주소, 도시, 국가 정보, 그리고 매장별 통계 조회
    const sql = `
      SELECT 
        s.store_id,
        s.manager_staff_id,
        s.address_id,
        s.last_update,
        staff.first_name || ' ' || staff.last_name as manager_name,
        a.address,
        a.address2,
        a.district,
        a.postal_code,
        a.phone,
        ci.city_id,
        ci.city as city_name,
        co.country_id,
        co.country as country_name,
        (SELECT COUNT(*) FROM inventory i WHERE i.store_id = s.store_id) as inventory_count,
        (SELECT COUNT(*) FROM customer c WHERE c.store_id = s.store_id) as customer_count,
        (SELECT COUNT(*) FROM staff st WHERE st.store_id = s.store_id) as staff_count
      FROM store s
      JOIN staff ON s.manager_staff_id = staff.staff_id
      JOIN address a ON s.address_id = a.address_id
      JOIN city ci ON a.city_id = ci.city_id
      JOIN country co ON ci.country_id = co.country_id
      ORDER BY s.store_id
    `;
    
    // 쿼리 실행
    const stores = executeQuery(sql);
    
    return NextResponse.json(stores);
  } catch (error: any) {
    console.error('매장 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '매장 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

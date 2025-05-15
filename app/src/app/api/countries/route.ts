import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 국가명 검색 (옵션)
    const search = searchParams.get('search') || undefined;
    
    // SQL 쿼리 기본 구성
    let sql = `
      SELECT 
        co.country_id,
        co.country,
        co.last_update,
        (SELECT COUNT(*) FROM city ci WHERE ci.country_id = co.country_id) as city_count
      FROM country co
    `;
    
    // 필터 조건 추가
    const params: Record<string, any> = {};
    
    if (search) {
      sql += " WHERE co.country LIKE :search";
      params.search = `%${search}%`;
    }
    
    // 정렬 추가
    sql += " ORDER BY co.country";
    
    // 쿼리 실행
    const countries = executeQuery(sql, params);
    
    return NextResponse.json(countries);
  } catch (error: any) {
    console.error('국가 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '국가 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

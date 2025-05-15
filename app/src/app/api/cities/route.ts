import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-utils';

export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 국가 ID로 필터링 (옵션)
    const countryId = searchParams.has('countryId') ? Number(searchParams.get('countryId')) : undefined;
    
    // 도시명 검색 (옵션)
    const search = searchParams.get('search') || undefined;
    
    // SQL 쿼리 기본 구성
    let sql = `
      SELECT 
        ci.city_id,
        ci.city,
        ci.country_id,
        co.country,
        ci.last_update
      FROM city ci
      JOIN country co ON ci.country_id = co.country_id
    `;
    
    // 필터 조건 추가
    const whereConditions: string[] = [];
    const params: Record<string, any> = {};
    
    if (countryId) {
      whereConditions.push("ci.country_id = :countryId");
      params.countryId = countryId;
    }
    
    if (search) {
      whereConditions.push("ci.city LIKE :search");
      params.search = `%${search}%`;
    }
    
    // WHERE 절 추가
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // 정렬 추가
    sql += " ORDER BY co.country, ci.city";
    
    // 쿼리 실행
    const cities = executeQuery(sql, params);
    
    return NextResponse.json(cities);
  } catch (error: any) {
    console.error('도시 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '도시 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

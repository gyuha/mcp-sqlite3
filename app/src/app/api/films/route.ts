import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getPaginatedData } from '@/lib/db-utils';
import { type FilmFilterParams } from '@/types/film';

export const revalidate = 3600; // 1시간마다 재검증 (초 단위)

export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 필터링 및 정렬 매개변수 추출
    const filters: FilmFilterParams = {
      title: searchParams.get('title') || undefined,
      categoryId: searchParams.has('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
      releaseYear: searchParams.has('releaseYear') ? Number(searchParams.get('releaseYear')) : undefined,
      rating: searchParams.get('rating') || undefined,
      actorId: searchParams.has('actorId') ? Number(searchParams.get('actorId')) : undefined,
      minLength: searchParams.has('minLength') ? Number(searchParams.get('minLength')) : undefined,
      maxLength: searchParams.has('maxLength') ? Number(searchParams.get('maxLength')) : undefined,
      sortBy: searchParams.get('sortBy') || 'title',
      sortDirection: searchParams.get('sortDirection') === 'desc' ? 'desc' : 'asc',
    };
    
    // 페이지네이션 파라미터 추출
    const page = searchParams.has('page') ? Math.max(1, Number(searchParams.get('page'))) : 1;
    const pageSize = searchParams.has('pageSize') ? Math.min(100, Math.max(1, Number(searchParams.get('pageSize')))) : 10;
    
    // 기본 SQL 쿼리 구성
    let sql = `
      SELECT 
        f.film_id, 
        f.title, 
        f.description, 
        f.release_year, 
        f.language_id, 
        f.original_language_id, 
        f.rental_duration, 
        f.rental_rate, 
        f.length, 
        f.replacement_cost, 
        f.rating, 
        f.special_features, 
        f.last_update,
        l.name as language_name,
        (
          SELECT COUNT(*) 
          FROM inventory i 
          WHERE i.film_id = f.film_id
        ) as inventory_count,
        (
          SELECT COUNT(*) 
          FROM inventory i 
          LEFT JOIN rental r ON i.inventory_id = r.inventory_id AND r.return_date IS NULL
          WHERE i.film_id = f.film_id AND r.rental_id IS NULL
        ) as available_count
      FROM film f
      JOIN language l ON f.language_id = l.language_id
    `;
    
    // 필터 조건 추가를 위한 WHERE 절과 매개변수
    const whereConditions: string[] = [];
    const sqlParams: Record<string, any> = {};
    
    // 제목 검색
    if (filters.title) {
      whereConditions.push("f.title LIKE :title");
      sqlParams.title = `%${filters.title}%`;
    }
    
    // 카테고리 필터링
    if (filters.categoryId) {
      sql += `
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = c.category_id
      `;
      whereConditions.push("c.category_id = :categoryId");
      sqlParams.categoryId = filters.categoryId;
    }
    
    // 배우 필터링
    if (filters.actorId) {
      sql += `
        JOIN film_actor fa ON f.film_id = fa.film_id
      `;
      whereConditions.push("fa.actor_id = :actorId");
      sqlParams.actorId = filters.actorId;
    }
    
    // 출시 연도 필터링
    if (filters.releaseYear) {
      whereConditions.push("f.release_year = :releaseYear");
      sqlParams.releaseYear = filters.releaseYear;
    }
    
    // 등급 필터링
    if (filters.rating) {
      whereConditions.push("f.rating = :rating");
      sqlParams.rating = filters.rating;
    }
    
    // 상영 시간 범위 필터링
    if (filters.minLength) {
      whereConditions.push("f.length >= :minLength");
      sqlParams.minLength = filters.minLength;
    }
    
    if (filters.maxLength) {
      whereConditions.push("f.length <= :maxLength");
      sqlParams.maxLength = filters.maxLength;
    }
    
    // WHERE 절 추가
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // GROUP BY 절 추가 (필요한 경우)
    if (filters.categoryId || filters.actorId) {
      sql += ` GROUP BY f.film_id`;
    }
    
    // 정렬 추가
    const validSortColumns = ['title', 'release_year', 'rental_rate', 'length', 'rating'];
    const sortColumn = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'title';
    sql += ` ORDER BY f.${sortColumn} ${filters.sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
    
    // 페이지네이션을 적용하여 데이터 조회
    const result = await getPaginatedData(sql, page, pageSize, sqlParams);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('영화 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '영화 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

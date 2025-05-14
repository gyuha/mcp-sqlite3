import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db-utils';
import { Film, FilmWithDetails } from '@/types/film';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const filmId = parseInt(params.id);

    if (isNaN(filmId)) {
      return NextResponse.json(
        { error: '유효하지 않은 영화 ID입니다.' },
        { status: 400 }
      );
    }

    // 영화 기본 정보 조회
    const filmSql = `
      SELECT 
        f.*,
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
      WHERE f.film_id = :filmId
    `;

    const film = getRecord<Film & { language_name: string; inventory_count: number; available_count: number }>(
      filmSql,
      { filmId }
    );

    if (!film) {
      return NextResponse.json(
        { error: '영화를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 영화 카테고리 조회
    const categoriesSql = `
      SELECT c.category_id, c.name
      FROM category c
      JOIN film_category fc ON c.category_id = fc.category_id
      WHERE fc.film_id = :filmId
    `;

    const categories = executeQuery<{ category_id: number; name: string }>(
      categoriesSql,
      { filmId }
    );

    // 출연 배우 조회
    const actorsSql = `
      SELECT a.actor_id, a.first_name, a.last_name
      FROM actor a
      JOIN film_actor fa ON a.actor_id = fa.actor_id
      WHERE fa.film_id = :filmId
      ORDER BY a.last_name, a.first_name
    `;

    const actors = executeQuery<{ actor_id: number; first_name: string; last_name: string }>(
      actorsSql,
      { filmId }
    );

    // 상세 정보를 포함한 응답 생성
    const filmWithDetails: FilmWithDetails = {
      ...film,
      categories,
      actors,
    };

    return NextResponse.json(filmWithDetails);
  } catch (error: any) {
    console.error('영화 상세 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '영화 정보를 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db-utils';
import { Category } from '@/types/film';

export const revalidate = 86400; // 24시간마다 재검증 (초 단위)

export async function GET() {
  try {
    const sql = `
      SELECT 
        c.category_id, 
        c.name, 
        c.last_update,
        COUNT(fc.film_id) as film_count
      FROM category c
      LEFT JOIN film_category fc ON c.category_id = fc.category_id
      GROUP BY c.category_id
      ORDER BY c.name
    `;

    const categories = executeQuery<Category & { film_count: number }>(sql);

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('카테고리 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '카테고리 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

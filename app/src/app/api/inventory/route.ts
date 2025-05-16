import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db';

export interface InventoryItem {
  inventory_id: number;
  film_id: number;
  store_id: number;
  title: string;
  release_year: number;
  rental_rate: number;
  rental_duration: number;
  replacement_cost: number;
  rating: string;
  is_available: boolean;
  last_rental_date: string | null;
  last_return_date: string | null;
  current_customer_id: number | null;
  current_customer_name: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 필터링 파라미터
    const filmTitle = searchParams.get('title') || '';
    const storeId = searchParams.get('storeId') ? parseInt(searchParams.get('storeId') as string) : null;
    const availability = searchParams.get('availability') || 'all'; // 'all', 'available', 'rented'
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // WHERE 절 조건 구성
    const conditions = [];
    const params: any = {};
    
    if (filmTitle) {
      conditions.push('f.title LIKE :title');
      params.title = `%${filmTitle}%`;
    }
    
    if (storeId !== null) {
      conditions.push('i.store_id = :storeId');
      params.storeId = storeId;
    }
    
    if (availability === 'available') {
      conditions.push('r2.rental_id IS NULL');
    } else if (availability === 'rented') {
      conditions.push('r2.rental_id IS NOT NULL');
    }
    
    const whereClause = conditions.length > 0 
      ? 'WHERE ' + conditions.join(' AND ') 
      : '';
    
    // 총 재고 수 조회
    const countQuery = `
      SELECT COUNT(*) as total
      FROM inventory i
      JOIN film f ON i.film_id = f.film_id
      LEFT JOIN (
        SELECT inventory_id, MAX(rental_id) as rental_id
        FROM rental
        WHERE return_date IS NULL
        GROUP BY inventory_id
      ) r2 ON i.inventory_id = r2.inventory_id
      ${whereClause}
    `;
    
    const totalResult = await getRecord<{ total: number }>(countQuery, params);
    const total = totalResult?.total || 0;
    
    // 오프셋 계산
    const offset = (page - 1) * pageSize;
    
    // 재고 목록 조회
    const query = `
      SELECT 
        i.inventory_id,
        i.film_id,
        i.store_id,
        f.title,
        f.release_year,
        f.rental_rate,
        f.rental_duration,
        f.replacement_cost,
        f.rating,
        CASE WHEN r2.rental_id IS NULL THEN 1 ELSE 0 END as is_available,
        MAX(r.rental_date) as last_rental_date,
        MAX(r.return_date) as last_return_date,
        r2.customer_id as current_customer_id,
        CASE WHEN r2.customer_id IS NOT NULL THEN c.first_name || ' ' || c.last_name ELSE NULL END as current_customer_name
      FROM inventory i
      JOIN film f ON i.film_id = f.film_id
      LEFT JOIN rental r ON i.inventory_id = r.inventory_id
      LEFT JOIN (
        SELECT r.rental_id, r.inventory_id, r.customer_id
        FROM rental r
        WHERE r.return_date IS NULL
      ) r2 ON i.inventory_id = r2.inventory_id
      LEFT JOIN customer c ON r2.customer_id = c.customer_id
      ${whereClause}
      GROUP BY i.inventory_id
      ORDER BY i.inventory_id
      LIMIT :limit OFFSET :offset
    `;
    
    const inventoryItems = await executeQuery<InventoryItem>(query, {
      ...params,
      limit: pageSize,
      offset: offset
    });
    
    // 재고 현황 요약 정보
    const summaryQuery = `
      SELECT
        COUNT(*) as total_inventory,
        SUM(CASE WHEN r2.rental_id IS NULL THEN 1 ELSE 0 END) as available_inventory,
        SUM(CASE WHEN r2.rental_id IS NOT NULL THEN 1 ELSE 0 END) as rented_inventory
      FROM inventory i
      LEFT JOIN (
        SELECT inventory_id, MAX(rental_id) as rental_id
        FROM rental
        WHERE return_date IS NULL
        GROUP BY inventory_id
      ) r2 ON i.inventory_id = r2.inventory_id
    `;
    
    const summary = await getRecord<{
      total_inventory: number;
      available_inventory: number;
      rented_inventory: number;
    }>(summaryQuery);
    
    return NextResponse.json({
      items: inventoryItems,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      summary
    });
  } catch (error) {
    console.error('재고 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '재고 목록을 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

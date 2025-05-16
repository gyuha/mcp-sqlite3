import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db';

interface DashboardStats {
  total_films: number;
  total_rentals: number;
  total_customers: number;
  total_revenue: number;
  active_rentals: number;
  overdue_rentals: number;
  inventory_available: number;
  inventory_rented: number;
  top_categories: {
    name: string;
    rental_count: number;
  }[];
  revenue_by_month: {
    month: string;
    amount: number;
  }[];
  recent_rentals: {
    rental_id: number;
    rental_date: string;
    customer_name: string;
    film_title: string;
    return_date: string | null;
  }[];
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // 'day', 'week', 'month', 'year'
    
    // 기간에 따른 날짜 범위 설정
    let dateRange: string;
    switch (period) {
      case 'day':
        dateRange = "date('now', '-1 day')";
        break;
      case 'week':
        dateRange = "date('now', '-7 days')";
        break;
      case 'year':
        dateRange = "date('now', '-1 year')";
        break;
      case 'month':
      default:
        dateRange = "date('now', '-30 days')";
        break;
    }
    
    // 1. 총계 통계
    const totalStats = await getRecord<{
      total_films: number;
      total_rentals: number;
      total_customers: number;
      total_revenue: number;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM film) as total_films,
        (SELECT COUNT(*) FROM rental) as total_rentals,
        (SELECT COUNT(*) FROM customer) as total_customers,
        (SELECT SUM(amount) FROM payment) as total_revenue
    `);
    
    // 2. 대여 현황
    const rentalStats = await getRecord<{
      active_rentals: number;
      overdue_rentals: number;
    }>(`
      SELECT
        COUNT(*) as active_rentals,
        SUM(CASE 
          WHEN return_date IS NULL AND date(rental_date, '+' || f.rental_duration || ' days') < date('now') 
          THEN 1 ELSE 0 END) as overdue_rentals
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      WHERE return_date IS NULL
    `);
    
    // 3. 재고 현황
    const inventoryStats = await getRecord<{
      inventory_available: number;
      inventory_rented: number;
    }>(`
      SELECT
        SUM(CASE WHEN NOT EXISTS (
          SELECT 1 FROM rental 
          WHERE inventory_id = inventory.inventory_id 
          AND return_date IS NULL
        ) THEN 1 ELSE 0 END) as inventory_available,
        SUM(CASE WHEN EXISTS (
          SELECT 1 FROM rental 
          WHERE inventory_id = inventory.inventory_id 
          AND return_date IS NULL
        ) THEN 1 ELSE 0 END) as inventory_rented
      FROM inventory
    `);
    
    // 4. 인기 카테고리
    const topCategories = await executeQuery<{
      name: string;
      rental_count: number;
    }>(`
      SELECT
        c.name,
        COUNT(*) as rental_count
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      JOIN film_category fc ON f.film_id = fc.film_id
      JOIN category c ON fc.category_id = c.category_id
      WHERE r.rental_date >= ${dateRange}
      GROUP BY c.name
      ORDER BY rental_count DESC
      LIMIT 5
    `);
    
    // 5. 월별 매출
    const revenueByMonth = await executeQuery<{
      month: string;
      amount: number;
    }>(`
      SELECT
        strftime('%Y-%m', payment_date) as month,
        SUM(amount) as amount
      FROM payment
      WHERE payment_date >= date('now', '-12 months')
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    
    // 6. 최근 대여
    const recentRentals = await executeQuery<{
      rental_id: number;
      rental_date: string;
      customer_name: string;
      film_title: string;
      return_date: string | null;
    }>(`
      SELECT
        r.rental_id,
        r.rental_date,
        c.first_name || ' ' || c.last_name as customer_name,
        f.title as film_title,
        r.return_date
      FROM rental r
      JOIN customer c ON r.customer_id = c.customer_id
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      ORDER BY r.rental_date DESC
      LIMIT 10
    `);
    
    // 전체 통계 조합
    const dashboardStats: DashboardStats = {
      total_films: totalStats?.total_films || 0,
      total_rentals: totalStats?.total_rentals || 0,
      total_customers: totalStats?.total_customers || 0,
      total_revenue: totalStats?.total_revenue || 0,
      active_rentals: rentalStats?.active_rentals || 0,
      overdue_rentals: rentalStats?.overdue_rentals || 0,
      inventory_available: inventoryStats?.inventory_available || 0,
      inventory_rented: inventoryStats?.inventory_rented || 0,
      top_categories: topCategories || [],
      revenue_by_month: revenueByMonth || [],
      recent_rentals: recentRentals || []
    };
    
    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    return NextResponse.json(
      { error: '대시보드 통계를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

import { NextResponse, NextRequest } from 'next/server';
import { executeQuery, getRecord } from '@/lib/db';
import { PaymentStats } from '@/types/payment';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // 필터링 파라미터 추출
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const customerId = searchParams.get('customerId') ? parseInt(searchParams.get('customerId') as string) : undefined;
    const staffId = searchParams.get('staffId') ? parseInt(searchParams.get('staffId') as string) : undefined;
    
    const queryParams: Record<string, any> = {};
    let whereClause = '1=1';
    
    if (startDate) {
      whereClause += ' AND date(p.payment_date) >= date(:startDate)';
      queryParams.startDate = startDate;
    }
    
    if (endDate) {
      whereClause += ' AND date(p.payment_date) <= date(:endDate)';
      queryParams.endDate = endDate;
    }
    
    if (customerId) {
      whereClause += ' AND p.customer_id = :customerId';
      queryParams.customerId = customerId;
    }
    
    if (staffId) {
      whereClause += ' AND p.staff_id = :staffId';
      queryParams.staffId = staffId;
    }
    
    // 총 결제 통계 조회
    const totalStatsSql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(p.amount) as total_amount,
        SUM(CASE WHEN r.rental_id IS NULL THEN 1 ELSE 0 END) as other_payments,
        SUM(CASE WHEN r.rental_id IS NULL THEN p.amount ELSE 0 END) as other_amount,
        SUM(CASE 
          WHEN r.return_date IS NULL OR r.return_date <= date(r.rental_date, '+' || f.rental_duration || ' days') 
          THEN 1 ELSE 0 END) as rental_payments,
        SUM(CASE 
          WHEN r.return_date IS NULL OR r.return_date <= date(r.rental_date, '+' || f.rental_duration || ' days') 
          THEN p.amount ELSE 0 END) as rental_amount,
        SUM(CASE 
          WHEN r.return_date > date(r.rental_date, '+' || f.rental_duration || ' days') 
          THEN 1 ELSE 0 END) as late_fee_payments,
        SUM(CASE 
          WHEN r.return_date > date(r.rental_date, '+' || f.rental_duration || ' days') 
          THEN p.amount ELSE 0 END) as late_fee_amount
      FROM payment p
      LEFT JOIN rental r ON p.rental_id = r.rental_id
      LEFT JOIN inventory i ON r.inventory_id = i.inventory_id
      LEFT JOIN film f ON i.film_id = f.film_id
      WHERE ${whereClause}
    `;
    
    const totalStats = getRecord<PaymentStats>(totalStatsSql, queryParams);
    
    // 일별 통계 조회
    const dailyStatsSql = `
      SELECT 
        date(p.payment_date) as date,
        COUNT(*) as count,
        SUM(p.amount) as amount
      FROM payment p
      LEFT JOIN rental r ON p.rental_id = r.rental_id
      LEFT JOIN inventory i ON r.inventory_id = i.inventory_id
      LEFT JOIN film f ON i.film_id = f.film_id
      WHERE ${whereClause}
      GROUP BY date(p.payment_date)
      ORDER BY date(p.payment_date) DESC
      LIMIT 30
    `;
    
    const dailyStats = executeQuery<{ date: string; count: number; amount: number }>(dailyStatsSql, queryParams);
    
    // 월별 통계 조회
    const monthlyStatsSql = `
      SELECT 
        strftime('%Y-%m', p.payment_date) as year_month,
        COUNT(*) as count,
        SUM(p.amount) as amount
      FROM payment p
      LEFT JOIN rental r ON p.rental_id = r.rental_id
      LEFT JOIN inventory i ON r.inventory_id = i.inventory_id
      LEFT JOIN film f ON i.film_id = f.film_id
      WHERE ${whereClause}
      GROUP BY strftime('%Y-%m', p.payment_date)
      ORDER BY strftime('%Y-%m', p.payment_date) DESC
      LIMIT 12
    `;
    
    const monthlyStats = executeQuery<{ year_month: string; count: number; amount: number }>(monthlyStatsSql, queryParams);
    
    // 전체 통계 조합
    const stats: PaymentStats = {
      total_payments: totalStats?.total_payments || 0,
      total_amount: totalStats?.total_amount || 0,
      rental_payments: totalStats?.rental_payments || 0,
      rental_amount: totalStats?.rental_amount || 0,
      late_fee_payments: totalStats?.late_fee_payments || 0,
      late_fee_amount: totalStats?.late_fee_amount || 0,
      other_payments: totalStats?.other_payments || 0,
      other_amount: totalStats?.other_amount || 0,
      daily_stats: dailyStats,
      monthly_stats: monthlyStats
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('결제 통계 조회 오류:', error);
    return NextResponse.json({ error: '결제 통계를 불러오는 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

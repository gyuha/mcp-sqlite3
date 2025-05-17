'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/format-utils';

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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  useEffect(() => {
    fetchDashboardStats();
  }, [period]);
  
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/stats?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`대시보드 통계를 불러오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('대시보드 통계 로딩 오류:', err);
      setError(err.message || '대시보드 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 차트 데이터 계산 (간단한 그래프를 위한 데이터)
  const calculateChartData = () => {
    if (!stats?.revenue_by_month) return [];
    
    // 최근 6개월 매출 데이터 추출
    const chartData = [...stats.revenue_by_month].slice(0, 6).reverse();
    
    // 가장 큰 금액 (막대 그래프 높이 계산용)
    const maxAmount = Math.max(...chartData.map(item => item.amount));
    
    return chartData.map(item => ({
      ...item,
      // 높이 비율 계산 (0-100 사이 값)
      percentage: Math.round((item.amount / maxAmount) * 100)
    }));
  };
  
  const chartData = calculateChartData();
  
  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 재고 비율 계산
  const calculateInventoryPercentage = () => {
    if (!stats) return 0;
    const total = stats.inventory_available + stats.inventory_rented;
    return total === 0 ? 0 : Math.round((stats.inventory_available / total) * 100);
  };
  
  return (
    <main className="container mx-auto px-4 py-8 dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">관리자 대시보드</h1>
        <div className="flex space-x-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="day">오늘</option>
            <option value="week">최근 7일</option>
            <option value="month">최근 30일</option>
            <option value="year">최근 1년</option>
          </select>
          <button
            onClick={fetchDashboardStats}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded"
          >
            새로고침
          </button>
        </div>
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* 대시보드 내용 */}
      {!loading && !error && stats && (
        <div className="space-y-6">
          {/* 주요 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">총 영화 수</h3>
              <p className="text-3xl font-bold">{stats.total_films.toLocaleString()}</p>
              <div className="mt-2">
                <Link href="/films" className="text-blue-600 text-sm hover:underline">
                  영화 목록 보기 →
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">총 고객 수</h3>
              <p className="text-3xl font-bold">{stats.total_customers.toLocaleString()}</p>
              <div className="mt-2">
                <Link href="/customers" className="text-blue-600 text-sm hover:underline">
                  고객 목록 보기 →
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">총 대여 건수</h3>
              <p className="text-3xl font-bold">{stats.total_rentals.toLocaleString()}</p>
              <div className="mt-2">
                <Link href="/rentals" className="text-blue-600 text-sm hover:underline">
                  대여 목록 보기 →
                </Link>
              </div>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">총 매출</h3>
              <p className="text-3xl font-bold">{formatCurrency(stats.total_revenue)}</p>
              <div className="mt-2">
                <Link href="/payments" className="text-blue-600 text-sm hover:underline">
                  결제 목록 보기 →
                </Link>
              </div>
            </div>
          </div>
          
          {/* 대여 및 재고 현황 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 대여 현황 */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">대여 현황</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>현재 대여 중</span>
                  <span className="font-semibold">{stats.active_rentals.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-red-500">연체 중</span>
                  <span className="font-semibold text-red-500">{stats.overdue_rentals.toLocaleString()}</span>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/rentals?status=overdue" 
                    className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200 text-sm font-medium"
                  >
                    연체 목록 보기
                  </Link>
                </div>
              </div>
            </div>
            
            {/* 재고 현황 */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">재고 현황</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>대여 가능 재고</span>
                  <span className="font-semibold">{stats.inventory_available.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>대여 중 재고</span>
                  <span className="font-semibold">{stats.inventory_rented.toLocaleString()}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${calculateInventoryPercentage()}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1">
                    대여 가능: {calculateInventoryPercentage()}%
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 인기 카테고리 및 월별 매출 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 인기 카테고리 */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">인기 카테고리</h3>
              <div className="space-y-4">
                {stats.top_categories.map((category, index) => (
                  <div key={category.name} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="text-gray-500 w-5">{index + 1}.</span>
                      <span>{category.name}</span>
                    </div>
                    <span className="font-semibold">{category.rental_count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 월별 매출 차트 */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">최근 월별 매출</h3>
              <div className="flex items-end space-x-2 h-40">
                {chartData.map((item) => (
                  <div key={item.month} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                      style={{ height: `${item.percentage}%` }}
                      title={`${formatCurrency(item.amount)}`}
                    />
                    <div className="text-xs mt-1 text-gray-600">
                      {item.month.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right">
                <Link href="/payments/stats" className="text-blue-600 text-sm hover:underline">
                  상세 매출 통계 →
                </Link>
              </div>
            </div>
          </div>
          
          {/* 최근 대여 목록 */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">최근 대여</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영화 제목</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반납일</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent_rentals.map((rental) => (
                    <tr key={rental.rental_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {rental.rental_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(rental.rental_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rental.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.film_title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {rental.return_date ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            반납 완료
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            대여 중
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {rental.return_date ? formatDate(rental.return_date) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link href="/rentals" className="text-blue-600 text-sm hover:underline">
                전체 대여 목록 →
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

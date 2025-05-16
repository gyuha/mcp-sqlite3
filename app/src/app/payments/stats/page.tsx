'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaymentStats } from '@/types/payment';
import { formatCurrency } from '@/lib/format-utils';

export default function PaymentStatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filterCustomerId, setFilterCustomerId] = useState('');
  const [filterStaffId, setFilterStaffId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // URL 파라미터로부터 필터 초기화
  useEffect(() => {
    const customerId = searchParams.get('customerId') || '';
    const staffId = searchParams.get('staffId') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    setFilterCustomerId(customerId);
    setFilterStaffId(staffId);
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
    
    fetchStats();
  }, [searchParams]);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL 쿼리 파라미터 생성
      const queryParams = new URLSearchParams();
      
      if (filterCustomerId) queryParams.append('customerId', filterCustomerId);
      if (filterStaffId) queryParams.append('staffId', filterStaffId);
      if (filterStartDate) queryParams.append('startDate', filterStartDate);
      if (filterEndDate) queryParams.append('endDate', filterEndDate);
      
      const response = await fetch(`/api/payments/stats?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`결제 통계를 불러오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      console.error('결제 통계 로딩 오류:', err);
      setError(err.message || '결제 통계를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 필터 적용 핸들러
  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (filterCustomerId) queryParams.set('customerId', filterCustomerId);
    if (filterStaffId) queryParams.set('staffId', filterStaffId);
    if (filterStartDate) queryParams.set('startDate', filterStartDate);
    if (filterEndDate) queryParams.set('endDate', filterEndDate);
    
    router.push(`/payments/stats?${queryParams.toString()}`);
  };
  
  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setFilterCustomerId('');
    setFilterStaffId('');
    setFilterStartDate('');
    setFilterEndDate('');
    
    router.push('/payments/stats');
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">결제 통계</h1>
        <div className="flex space-x-2">
          <Link
            href="/payments"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            결제 목록으로
          </Link>
        </div>
      </div>
      
      {/* 필터 섹션 */}
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="font-semibold text-lg mb-4">기간 및 필터 설정</h2>
        <form onSubmit={handleFilterApply} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              id="startDate"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              id="endDate"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">고객 ID</label>
            <input
              type="number"
              id="customerId"
              value={filterCustomerId}
              onChange={(e) => setFilterCustomerId(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="고객 ID로 필터링"
            />
          </div>
          
          <div>
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-1">직원 ID</label>
            <input
              type="number"
              id="staffId"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="직원 ID로 필터링"
            />
          </div>
          
          <div className="md:col-span-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleFilterReset}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              초기화
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              필터 적용
            </button>
          </div>
        </form>
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
      
      {/* 통계 결과 */}
      {!loading && !error && stats && (
        <div className="space-y-6">
          {/* 총계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">총 결제 건수</h3>
              <p className="text-3xl font-bold">{stats.total_payments.toLocaleString()}</p>
              <p className="mt-2 text-lg font-semibold text-blue-600">{formatCurrency(stats.total_amount)}</p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">일반 대여 결제</h3>
              <p className="text-3xl font-bold">{stats.rental_payments.toLocaleString()}</p>
              <p className="mt-2 text-lg font-semibold text-blue-600">{formatCurrency(stats.rental_amount)}</p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">연체료 결제</h3>
              <p className="text-3xl font-bold">{stats.late_fee_payments.toLocaleString()}</p>
              <p className="mt-2 text-lg font-semibold text-red-600">{formatCurrency(stats.late_fee_amount)}</p>
            </div>
            
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">기타 결제</h3>
              <p className="text-3xl font-bold">{stats.other_payments.toLocaleString()}</p>
              <p className="mt-2 text-lg font-semibold text-gray-600">{formatCurrency(stats.other_amount)}</p>
            </div>
          </div>
          
          {/* 월별 통계 */}
          {stats.monthly_stats && stats.monthly_stats.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">월별 결제 통계</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 건수</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.monthly_stats.map((month) => (
                      <tr key={month.year_month}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {month.year_month}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {month.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(month.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(month.amount / month.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* 일별 통계 */}
          {stats.daily_stats && stats.daily_stats.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">최근 일별 결제 통계</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 건수</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 금액</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.daily_stats.map((day) => (
                      <tr key={day.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {day.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {day.count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(day.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(day.amount / day.count)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

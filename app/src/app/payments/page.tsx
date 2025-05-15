'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PaymentWithDetails } from '@/types/payment';
import { formatDate, formatCurrency } from '@/lib/format-utils';

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface PaymentsResponse {
  data: PaymentWithDetails[];
  pagination: Pagination;
}

export default function PaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filterCustomerId, setFilterCustomerId] = useState<string>('');
  const [filterStaffId, setFilterStaffId] = useState<string>('');
  const [filterPaymentType, setFilterPaymentType] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterMinAmount, setFilterMinAmount] = useState<string>('');
  const [filterMaxAmount, setFilterMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('payment_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // URL 파라미터로부터 필터 및 페이징 정보 초기화
  useEffect(() => {
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string) : 1;
    const customerId = searchParams.get('customerId') || '';
    const staffId = searchParams.get('staffId') || '';
    const paymentType = searchParams.get('paymentType') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const minAmount = searchParams.get('minAmount') || '';
    const maxAmount = searchParams.get('maxAmount') || '';
    const sort = searchParams.get('sortBy') || 'payment_date';
    const direction = searchParams.get('sortDirection') as 'asc' | 'desc' || 'desc';
    
    setFilterCustomerId(customerId);
    setFilterStaffId(staffId);
    setFilterPaymentType(paymentType);
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
    setFilterMinAmount(minAmount);
    setFilterMaxAmount(maxAmount);
    setSortBy(sort);
    setSortDirection(direction);
    
    fetchPayments(page);
  }, [searchParams]);

  const fetchPayments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // URL 쿼리 파라미터 생성
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      
      if (filterCustomerId) queryParams.append('customerId', filterCustomerId);
      if (filterStaffId) queryParams.append('staffId', filterStaffId);
      if (filterPaymentType !== 'all') queryParams.append('paymentType', filterPaymentType);
      if (filterStartDate) queryParams.append('startDate', filterStartDate);
      if (filterEndDate) queryParams.append('endDate', filterEndDate);
      if (filterMinAmount) queryParams.append('minAmount', filterMinAmount);
      if (filterMaxAmount) queryParams.append('maxAmount', filterMaxAmount);
      queryParams.append('sortBy', sortBy);
      queryParams.append('sortDirection', sortDirection);
      
      const response = await fetch(`/api/payments?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`결제 목록을 불러오는데 실패했습니다: ${response.status}`);
      }
      
      const result: PaymentsResponse = await response.json();
      setPayments(result.data);
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('결제 목록 로딩 오류:', err);
      setError(err.message || '결제 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.set('page', newPage.toString());
    router.push(`/payments?${queryParams.toString()}`);
  };

  // 필터 적용 핸들러
  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    queryParams.set('page', '1');
    
    if (filterCustomerId) queryParams.set('customerId', filterCustomerId);
    if (filterStaffId) queryParams.set('staffId', filterStaffId);
    if (filterPaymentType !== 'all') queryParams.set('paymentType', filterPaymentType);
    if (filterStartDate) queryParams.set('startDate', filterStartDate);
    if (filterEndDate) queryParams.set('endDate', filterEndDate);
    if (filterMinAmount) queryParams.set('minAmount', filterMinAmount);
    if (filterMaxAmount) queryParams.set('maxAmount', filterMaxAmount);
    queryParams.set('sortBy', sortBy);
    queryParams.set('sortDirection', sortDirection);
    
    router.push(`/payments?${queryParams.toString()}`);
  };

  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setFilterCustomerId('');
    setFilterStaffId('');
    setFilterPaymentType('all');
    setFilterStartDate('');
    setFilterEndDate('');
    setFilterMinAmount('');
    setFilterMaxAmount('');
    setSortBy('payment_date');
    setSortDirection('desc');
    
    router.push('/payments');
  };

  // 정렬 변경 핸들러
  const handleSortChange = (column: string) => {
    const queryParams = new URLSearchParams(searchParams.toString());
    
    if (sortBy === column) {
      // 같은 컬럼을 클릭한 경우, 정렬 방향 전환
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      queryParams.set('sortDirection', newDirection);
    } else {
      // 다른 컬럼을 클릭한 경우, 기본 내림차순으로 설정
      setSortBy(column);
      setSortDirection('desc');
      queryParams.set('sortBy', column);
      queryParams.set('sortDirection', 'desc');
    }
    
    router.push(`/payments?${queryParams.toString()}`);
  };

  // 결제 유형 표시 함수
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'rental':
        return <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">대여 결제</span>;
      case 'late_fee':
        return <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold">연체료</span>;
      case 'other':
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">기타 결제</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">미분류</span>;
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">결제 관리</h1>
        <div className="flex space-x-2">
          <Link
            href="/payments/stats"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            결제 통계
          </Link>
        </div>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="font-semibold text-lg mb-4">검색 및 필터링</h2>
        <form onSubmit={handleFilterApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객 ID</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterCustomerId}
              onChange={(e) => setFilterCustomerId(e.target.value)}
              placeholder="고객 ID로 검색"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">직원 ID</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterStaffId}
              onChange={(e) => setFilterStaffId(e.target.value)}
              placeholder="직원 ID로 검색"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">결제 유형</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterPaymentType}
              onChange={(e) => setFilterPaymentType(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="rental">대여 결제</option>
              <option value="late_fee">연체료</option>
              <option value="other">기타 결제</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최소 금액</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filterMinAmount}
                onChange={(e) => setFilterMinAmount(e.target.value)}
                placeholder="최소 금액"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 금액</label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={filterMaxAmount}
                onChange={(e) => setFilterMaxAmount(e.target.value)}
                placeholder="최대 금액"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
              onClick={handleFilterReset}
            >
              초기화
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
            >
              검색
            </button>
          </div>
        </form>
      </div>

      {/* 결과 섹션 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-gray-100 border border-gray-300 text-gray-700 px-4 py-10 rounded text-center">
          <p className="text-lg">조회된 결제 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" 
                    onClick={() => handleSortChange('payment_id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>결제 ID</span>
                      {sortBy === 'payment_id' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('customer_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>고객</span>
                      {sortBy === 'customer_name' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('film_title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>영화</span>
                      {sortBy === 'film_title' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>금액</span>
                      {sortBy === 'amount' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('payment_date')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>결제일</span>
                      {sortBy === 'payment_date' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('payment_type')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>유형</span>
                      {sortBy === 'payment_type' && (
                        <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상세
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <Link 
                        href={`/customers/${payment.customer_id}`} 
                        className="text-blue-600 hover:underline"
                      >
                        {payment.customer_name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.film_title ? (
                        <Link 
                          href={`/films/${payment.rental_id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {payment.film_title}
                        </Link>
                      ) : (
                        <span className="text-gray-500 italic">해당 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.payment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getPaymentTypeLabel(payment.payment_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/payments/${payment.payment_id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        상세보기
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {pagination.pages > 1 && (
            <div className="flex justify-center my-4">
              <nav className="flex items-center">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.page <= 1}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page <= 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  &laquo;
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page <= 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  &lsaquo;
                </button>

                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 5) {
                    // 5페이지 이하면 1부터 페이지 수까지 표시
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    // 현재 페이지가 3 이하면 1~5까지 표시
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.pages - 2) {
                    // 현재 페이지가 마지막에서 2페이지 이내면 마지막 5페이지 표시
                    pageNum = pagination.pages - 4 + i;
                  } else {
                    // 그 외의 경우 현재 페이지 중심으로 앞뒤 2페이지씩 표시
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`mx-1 px-3 py-1 rounded ${
                        pagination.page === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page >= pagination.pages
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  &rsaquo;
                </button>
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={pagination.page >= pagination.pages}
                  className={`mx-1 px-3 py-1 rounded ${
                    pagination.page >= pagination.pages
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </main>
  );
}

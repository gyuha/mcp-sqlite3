'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RentalFilterParams, RentalWithDetails } from '@/types/rental';
import Pagination from '@/components/Pagination';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function RentalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 초기 필터 설정
  const initialFilters: RentalFilterParams = {
    customerId: searchParams.has('customerId') ? Number(searchParams.get('customerId')) : undefined,
    filmId: searchParams.has('filmId') ? Number(searchParams.get('filmId')) : undefined,
    storeId: searchParams.has('storeId') ? Number(searchParams.get('storeId')) : undefined,
    staffId: searchParams.has('staffId') ? Number(searchParams.get('staffId')) : undefined,
    status: (searchParams.get('status') as 'all' | 'returned' | 'outstanding' | 'overdue') || 'all',
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    sortBy: searchParams.get('sortBy') || 'rental_date',
    sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc',
  };
  
  const [filters, setFilters] = useState<RentalFilterParams>(initialFilters);
  const [rentals, setRentals] = useState<RentalWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    searchParams.has('page') ? Math.max(1, Number(searchParams.get('page'))) : 1
  );
  const [pageSize] = useState(
    searchParams.has('pageSize') ? Math.min(100, Math.max(1, Number(searchParams.get('pageSize')))) : 10
  );
  const [filterOpen, setFilterOpen] = useState(false);
  
  // URL 업데이트 함수
  const updateUrl = (page: number, newFilters: RentalFilterParams) => {
    const params = new URLSearchParams();
    
    // 페이지 및 페이지 크기
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    
    // 필터 매개변수
    if (newFilters.customerId) params.set('customerId', newFilters.customerId.toString());
    if (newFilters.filmId) params.set('filmId', newFilters.filmId.toString());
    if (newFilters.storeId) params.set('storeId', newFilters.storeId.toString());
    if (newFilters.staffId) params.set('staffId', newFilters.staffId.toString());
    if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status);
    if (newFilters.startDate) params.set('startDate', newFilters.startDate);
    if (newFilters.endDate) params.set('endDate', newFilters.endDate);
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortDirection) params.set('sortDirection', newFilters.sortDirection);
    
    // URL 업데이트
    router.push(`/rentals?${params.toString()}`);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: RentalFilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    updateUrl(1, newFilters);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page, filters);
  };

  // 필터 폼 제출 핸들러
  const handleFilterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFilters: RentalFilterParams = { ...filters };
    
    // 고객 ID
    const customerId = formData.get('customerId') as string;
    newFilters.customerId = customerId ? parseInt(customerId) : undefined;
    
    // 영화 ID
    const filmId = formData.get('filmId') as string;
    newFilters.filmId = filmId ? parseInt(filmId) : undefined;
    
    // 매장 ID
    const storeId = formData.get('storeId') as string;
    newFilters.storeId = storeId ? parseInt(storeId) : undefined;
    
    // 상태
    const status = formData.get('status') as 'all' | 'returned' | 'outstanding' | 'overdue';
    newFilters.status = status || 'all';
    
    // 날짜 범위
    newFilters.startDate = (formData.get('startDate') as string) || undefined;
    newFilters.endDate = (formData.get('endDate') as string) || undefined;
    
    // 정렬
    newFilters.sortBy = (formData.get('sortBy') as string) || 'rental_date';
    newFilters.sortDirection = (formData.get('sortDirection') as 'asc' | 'desc') || 'desc';
    
    handleFilterChange(newFilters);
  };

  // 대여 반납 처리 함수
  const handleReturnRental = async (rentalId: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/rentals/${rentalId}/return`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '반납 처리 중 오류가 발생했습니다.');
      }
      
      // 성공 시 목록 새로고침
      fetchRentals();
      
      alert('영화가 성공적으로 반납되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 대여 데이터 로드
  const fetchRentals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // URL 쿼리 매개변수 구성
      const params = new URLSearchParams();
      
      // 페이지네이션 매개변수
      params.set('page', currentPage.toString());
      params.set('pageSize', pageSize.toString());
      
      // 필터 매개변수
      if (filters.customerId) params.set('customerId', filters.customerId.toString());
      if (filters.filmId) params.set('filmId', filters.filmId.toString());
      if (filters.storeId) params.set('storeId', filters.storeId.toString());
      if (filters.staffId) params.set('staffId', filters.staffId.toString());
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
      
      // API 요청
      const response = await fetch(`/api/rentals?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('대여 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setRentals(data.data);
      setTotalItems(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setRentals([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };
  
  // 초기 데이터 로드 및 필터/페이지 변경 시 재로드
  useEffect(() => {
    fetchRentals();
  }, [currentPage, pageSize, filters]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  // 상태에 따른 배지 렌더링
  const renderStatusBadge = (rental: RentalWithDetails) => {
    if (rental.return_date) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          반납됨
        </span>
      );
    } else if (rental.overdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          연체
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-4 h-4 mr-1" />
          대여 중
        </span>
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">대여 관리</h1>

      {/* 필터 토글 버튼 */}
      <div className="mb-4">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          필터 {filterOpen ? '닫기' : '열기'}
        </button>
      </div>
      
      {/* 필터 폼 */}
      {filterOpen && (
        <form onSubmit={handleFilterSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                id="status"
                name="status"
                defaultValue={filters.status}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">모든 대여</option>
                <option value="outstanding">대여 중</option>
                <option value="returned">반납됨</option>
                <option value="overdue">연체</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">고객 ID</label>
              <input
                type="number"
                id="customerId"
                name="customerId"
                defaultValue={filters.customerId || ''}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="고객 ID"
              />
            </div>
            
            <div>
              <label htmlFor="filmId" className="block text-sm font-medium text-gray-700 mb-1">영화 ID</label>
              <input
                type="number"
                id="filmId"
                name="filmId"
                defaultValue={filters.filmId || ''}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="영화 ID"
              />
            </div>
            
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">매장 ID</label>
              <input
                type="number"
                id="storeId"
                name="storeId"
                defaultValue={filters.storeId || ''}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="매장 ID"
              />
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                defaultValue={filters.startDate || ''}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                defaultValue={filters.endDate || ''}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">정렬 기준</label>
              <select
                id="sortBy"
                name="sortBy"
                defaultValue={filters.sortBy || 'rental_date'}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="rental_date">대여일</option>
                <option value="return_date">반납일</option>
                <option value="customer_name">고객명</option>
                <option value="film_title">영화 제목</option>
                <option value="days_overdue">연체일</option>
                <option value="late_fee">연체료</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 mb-1">정렬 방향</label>
              <select
                id="sortDirection"
                name="sortDirection"
                defaultValue={filters.sortDirection || 'desc'}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="asc">오름차순</option>
                <option value="desc">내림차순</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => handleFilterChange({
                customerId: undefined,
                filmId: undefined,
                storeId: undefined,
                staffId: undefined,
                status: 'all',
                startDate: undefined,
                endDate: undefined,
                sortBy: 'rental_date',
                sortDirection: 'desc'
              })}
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      )}
      
      {/* 결과 개요 */}
      <div className="mb-4">
        <p className="text-gray-600">
          총 {totalItems}건의 대여 중 {rentals.length}건 표시 중
          {filters.status !== 'all' && (
            <span>
              {' '}
              (상태: {
                filters.status === 'returned' ? '반납됨' : 
                filters.status === 'outstanding' ? '대여 중' : 
                filters.status === 'overdue' ? '연체' : '모두'
              })
            </span>
          )}
        </p>
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6" role="alert">
          <p className="font-bold">오류 발생</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* 대여 목록 테이블 */}
      {!loading && !error && rentals.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영화</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여일</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반납일</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연체료</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentals.map((rental) => (
                <tr key={rental.rental_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rental.rental_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/films/${rental.film_id}`}>
                        {rental.film_title}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {rental.film_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/customers/${rental.customer_id}`}>
                        {rental.customer_name}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      {rental.customer_email || '이메일 없음'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(rental.rental_date).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {rental.return_date ? 
                      new Date(rental.return_date).toLocaleDateString('ko-KR') : 
                      '미반납'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(rental)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {rental.overdue ? (
                      <div>
                        <div className="text-sm font-medium text-red-600">
                          ${rental.late_fee?.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          ({rental.days_overdue?.toFixed(0)}일 연체)
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/rentals/${rental.rental_id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      상세
                    </Link>
                    
                    {!rental.return_date && (
                      <button
                        onClick={() => handleReturnRental(rental.rental_id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        반납
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 결과 없음 표시 */}
      {!loading && !error && rentals.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 text-lg">조회된 대여 내역이 없습니다.</p>
          <p className="text-gray-400 mt-2">다른 필터 조건으로 다시 시도해보세요.</p>
        </div>
      )}
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

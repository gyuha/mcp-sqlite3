'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CustomerFilterParams, Customer } from '@/types/customer';
import CustomerFilters from '@/components/CustomerFilters';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function CustomersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 초기 필터 설정
  const initialFilters: CustomerFilterParams = {
    name: searchParams.get('name') || undefined,
    email: searchParams.get('email') || undefined,
    active: searchParams.has('active') 
      ? searchParams.get('active') === 'true' 
      : undefined,
    storeId: searchParams.has('storeId') 
      ? Number(searchParams.get('storeId')) 
      : undefined,
    sortBy: searchParams.get('sortBy') || 'last_name',
    sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc',
  };
  
  const [filters, setFilters] = useState<CustomerFilterParams>(initialFilters);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    searchParams.has('page') ? Math.max(1, Number(searchParams.get('page'))) : 1
  );
  const [pageSize] = useState(
    searchParams.has('pageSize') ? Math.min(100, Math.max(1, Number(searchParams.get('pageSize')))) : 12
  );

  // URL 업데이트 함수
  const updateUrl = (page: number, newFilters: CustomerFilterParams) => {
    const params = new URLSearchParams();
    
    // 페이지 및 페이지 크기
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    
    // 필터 매개변수
    if (newFilters.name) params.set('name', newFilters.name);
    if (newFilters.email) params.set('email', newFilters.email);
    if (newFilters.active !== undefined) params.set('active', newFilters.active.toString());
    if (newFilters.storeId) params.set('storeId', newFilters.storeId.toString());
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortDirection) params.set('sortDirection', newFilters.sortDirection);
    
    // URL 업데이트
    router.push(`/customers?${params.toString()}`);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: CustomerFilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    updateUrl(1, newFilters);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page, filters);
  };

  // 고객 데이터 로드
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // URL 쿼리 매개변수 구성
        const params = new URLSearchParams();
        
        // 페이지네이션 매개변수
        params.set('page', currentPage.toString());
        params.set('pageSize', pageSize.toString());
        
        // 필터 매개변수
        if (filters.name) params.set('name', filters.name);
        if (filters.email) params.set('email', filters.email);
        if (filters.active !== undefined) params.set('active', filters.active.toString());
        if (filters.storeId) params.set('storeId', filters.storeId.toString());
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
        
        // API 요청
        const response = await fetch(`/api/customers?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('고객 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setCustomers(data.data);
        setTotalItems(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setCustomers([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [currentPage, pageSize, filters]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">고객 관리</h1>
        <Link href="/customers/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          신규 고객 등록
        </Link>
      </div>
      
      {/* 필터 섹션 */}
      <CustomerFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {/* 결과 개요 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          총 {totalItems}명의 고객 중 {customers.length}명 표시 중
          {filters.name && ` (검색: "${filters.name}")`}
        </p>
      </div>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* 에러 상태 */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">오류!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {/* 결과 없음 */}
      {!loading && !error && customers.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      )}
      
      {/* 고객 그리드 */}
      {!loading && !error && customers.length > 0 && (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매장</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.customer_id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {customer.first_name} {customer.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Store #{customer.store_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(customer.create_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {customer.active ? '활성' : '비활성'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/customers/${customer.customer_id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                    상세보기
                  </Link>
                  <Link href={`/customers/${customer.customer_id}/edit`} className="text-green-600 hover:text-green-900">
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </div>
  );
}

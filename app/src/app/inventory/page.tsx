'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/format-utils';

interface InventoryItem {
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

interface InventoryResponse {
  items: InventoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    total_inventory: number;
    available_inventory: number;
    rented_inventory: number;
  };
}

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filterTitle, setFilterTitle] = useState('');
  const [filterStoreId, setFilterStoreId] = useState('');
  const [filterAvailability, setFilterAvailability] = useState('all');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // URL 파라미터로부터 필터 초기화
  useEffect(() => {
    const title = searchParams.get('title') || '';
    const storeId = searchParams.get('storeId') || '';
    const availability = searchParams.get('availability') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('pageSize') || '20');
    
    setFilterTitle(title);
    setFilterStoreId(storeId);
    setFilterAvailability(availability);
    setCurrentPage(page);
    setPageSize(size);
    
    fetchInventory();
  }, [searchParams]);
  
  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL 쿼리 파라미터 생성
      const queryParams = new URLSearchParams();
      
      if (filterTitle) queryParams.append('title', filterTitle);
      if (filterStoreId) queryParams.append('storeId', filterStoreId);
      if (filterAvailability !== 'all') queryParams.append('availability', filterAvailability);
      queryParams.append('page', currentPage.toString());
      queryParams.append('pageSize', pageSize.toString());
      
      const response = await fetch(`/api/inventory?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`재고 목록을 불러오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setInventory(data);
    } catch (err: any) {
      console.error('재고 목록 로딩 오류:', err);
      setError(err.message || '재고 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 필터 적용 핸들러
  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (filterTitle) queryParams.set('title', filterTitle);
    if (filterStoreId) queryParams.set('storeId', filterStoreId);
    if (filterAvailability !== 'all') queryParams.set('availability', filterAvailability);
    queryParams.set('page', '1'); // 필터 적용 시 첫 페이지로 이동
    queryParams.set('pageSize', pageSize.toString());
    
    router.push(`/inventory?${queryParams.toString()}`);
  };
  
  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setFilterTitle('');
    setFilterStoreId('');
    setFilterAvailability('all');
    
    router.push(`/inventory?page=1&pageSize=${pageSize}`);
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    const queryParams = new URLSearchParams(searchParams as any);
    queryParams.set('page', page.toString());
    
    router.push(`/inventory?${queryParams.toString()}`);
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">재고 관리</h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            대시보드로 돌아가기
          </Link>
          <button
            onClick={fetchInventory}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            새로고침
          </button>
        </div>
      </div>
      
      {/* 재고 현황 요약 */}
      {!loading && !error && inventory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">총 재고</h3>
            <p className="text-3xl font-bold">{inventory.summary.total_inventory.toLocaleString()}</p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">대여 가능 재고</h3>
            <p className="text-3xl font-bold text-green-600">{inventory.summary.available_inventory.toLocaleString()}</p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">대여 중 재고</h3>
            <p className="text-3xl font-bold text-blue-600">{inventory.summary.rented_inventory.toLocaleString()}</p>
          </div>
        </div>
      )}
      
      {/* 필터 섹션 */}
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="font-semibold text-lg mb-4">재고 필터</h2>
        <form onSubmit={handleFilterApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">영화 제목</label>
            <input
              type="text"
              id="title"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="영화 제목으로 검색"
            />
          </div>
          
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">매장 ID</label>
            <select
              id="storeId"
              value={filterStoreId}
              onChange={(e) => setFilterStoreId(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 매장</option>
              <option value="1">매장 1</option>
              <option value="2">매장 2</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">가용 상태</label>
            <select
              id="availability"
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">모든 재고</option>
              <option value="available">대여 가능</option>
              <option value="rented">대여 중</option>
            </select>
          </div>
          
          <div className="md:col-span-3 flex justify-end space-x-2">
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
      
      {/* 재고 목록 테이블 */}
      {!loading && !error && inventory && (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영화 제목</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매장</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여 상태</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여 요금</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최근 대여일</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">현재 대여자</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.items.map((item) => (
                    <tr key={item.inventory_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.inventory_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link href={`/films/${item.film_id}`} className="hover:text-blue-600 hover:underline">
                          {item.title} ({item.release_year})
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        매장 {item.store_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.is_available ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            대여 가능
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            대여 중
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.rental_rate)} / {item.rental_duration}일
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.last_rental_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.current_customer_name ? (
                          <Link href={`/customers/${item.current_customer_id}`} className="hover:text-blue-600 hover:underline">
                            {item.current_customer_name}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link href={`/rentals/new?inventoryId=${item.inventory_id}`} className={`text-blue-600 hover:underline ${!item.is_available ? 'pointer-events-none opacity-50' : ''}`}>
                          대여하기
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* 페이지네이션 */}
          {inventory.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                전체 <span className="font-medium">{inventory.total.toLocaleString()}</span>개 중
                <span className="font-medium"> {((inventory.page - 1) * inventory.pageSize + 1).toLocaleString()} - {Math.min(inventory.page * inventory.pageSize, inventory.total).toLocaleString()}</span>개 표시
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(inventory.page - 1)}
                  disabled={inventory.page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    inventory.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  이전
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 rounded-md">
                  {inventory.page} / {inventory.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(inventory.page + 1)}
                  disabled={inventory.page === inventory.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    inventory.page === inventory.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

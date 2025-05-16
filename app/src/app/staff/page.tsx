'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/format-utils';

interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  address_id: number;
  email: string;
  store_id: number;
  active: boolean;
  username: string;
  last_update: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  phone: string;
  store_name: string;
  rental_count: number;
  payment_count: number;
  total_revenue: number;
}

interface StaffResponse {
  staff: Staff[];
  summary: {
    total_staff: number;
    active_staff: number;
    inactive_staff: number;
  };
}

export default function StaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [staffData, setStaffData] = useState<StaffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStoreId, setFilterStoreId] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  
  // URL 파라미터로부터 필터 초기화
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const storeId = searchParams.get('storeId') || '';
    const active = searchParams.get('activeOnly') === 'true';
    
    setSearchTerm(search);
    setFilterStoreId(storeId);
    setActiveOnly(active);
    
    fetchStaffData();
  }, [searchParams]);
  
  const fetchStaffData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // URL 쿼리 파라미터 생성
      const queryParams = new URLSearchParams();
      
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterStoreId) queryParams.append('storeId', filterStoreId);
      if (activeOnly) queryParams.append('activeOnly', 'true');
      
      const response = await fetch(`/api/staff?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`직원 목록을 불러오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setStaffData(data);
    } catch (err: any) {
      console.error('직원 목록 로딩 오류:', err);
      setError(err.message || '직원 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };
  
  // 필터 적용 핸들러
  const handleFilterApply = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (searchTerm) queryParams.set('search', searchTerm);
    if (filterStoreId) queryParams.set('storeId', filterStoreId);
    if (activeOnly) queryParams.set('activeOnly', 'true');
    
    router.push(`/staff?${queryParams.toString()}`);
  };
  
  // 필터 초기화 핸들러
  const handleFilterReset = () => {
    setSearchTerm('');
    setFilterStoreId('');
    setActiveOnly(false);
    
    router.push('/staff');
  };
  
  // 날짜 포맷 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  };
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">직원 관리</h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            대시보드로 돌아가기
          </Link>
          <button
            onClick={fetchStaffData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            새로고침
          </button>
        </div>
      </div>
      
      {/* 직원 현황 요약 */}
      {!loading && !error && staffData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">총 직원 수</h3>
            <p className="text-3xl font-bold">{staffData.summary.total_staff}</p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">활성 직원</h3>
            <p className="text-3xl font-bold text-green-600">{staffData.summary.active_staff}</p>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">비활성 직원</h3>
            <p className="text-3xl font-bold text-gray-400">{staffData.summary.inactive_staff}</p>
          </div>
        </div>
      )}
      
      {/* 필터 섹션 */}
      <div className="bg-white shadow-md rounded-lg mb-6 p-4">
        <h2 className="font-semibold text-lg mb-4">직원 검색</h2>
        <form onSubmit={handleFilterApply} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="이름, 이메일, 사용자명 검색"
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
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="activeOnly"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="activeOnly" className="ml-2 block text-sm font-medium text-gray-700">
              활성 직원만 표시
            </label>
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
              검색
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
      
      {/* 직원 목록 테이블 */}
      {!loading && !error && staffData && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이메일</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매장</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여 처리</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 처리</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">총 매출</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {staffData.staff.map((staff) => (
                  <tr key={staff.staff_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {staff.staff_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {staff.first_name} {staff.last_name}
                      <div className="text-xs text-gray-500">
                        {staff.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      매장 {staff.store_id} ({staff.store_name})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {staff.active ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          활성
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.rental_count.toLocaleString()}건
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {staff.payment_count.toLocaleString()}건
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(staff.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 직원이 없을 경우 */}
      {!loading && !error && staffData && staffData.staff.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
          <p>검색 조건에 맞는 직원이 없습니다.</p>
        </div>
      )}
    </main>
  );
}

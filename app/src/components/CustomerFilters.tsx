import { useState, useEffect } from 'react';
import { CustomerFilterParams } from '@/types/customer';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface CustomerFiltersProps {
  filters: CustomerFilterParams;
  onFilterChange: (filters: CustomerFilterParams) => void;
}

interface Store {
  store_id: number;
  manager_name: string;
  city_name: string;
  country_name: string;
}

const CustomerFilters = ({ filters, onFilterChange }: CustomerFiltersProps) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<CustomerFilterParams>(filters);

  // 매장 데이터 로드
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch('/api/stores');
        if (response.ok) {
          const data = await response.json();
          setStores(data);
        }
      } catch (error) {
        console.error('매장 로드 실패:', error);
      }
    };

    fetchStores();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (name: keyof CustomerFilterParams, value: any) => {
    const newFilters = {
      ...localFilters,
      [name]: value === '' ? undefined : value
    };
    setLocalFilters(newFilters);
  };
  
  // 필터 적용
  const applyFilters = () => {
    onFilterChange(localFilters);
  };
  
  // 필터 초기화
  const resetFilters = () => {
    const defaultFilters = {
      name: undefined,
      email: undefined,
      active: undefined,
      storeId: undefined,
      sortBy: 'last_name',
      sortDirection: 'asc'
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };
  
  return (
    <div className="bg-white shadow rounded-lg mb-6">
      {/* 모바일 필터 토글 */}
      <div className="md:hidden p-4 border-b">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center justify-between w-full text-gray-700"
        >
          <span className="font-medium">필터</span>
          <AdjustmentsHorizontalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* 검색바 */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            value={localFilters.name || ''}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            placeholder="고객 이름 검색..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <button 
            onClick={applyFilters}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs bg-blue-500 text-white"
          >
            검색
          </button>
        </div>
      </div>

      {/* 필터 컨테이너 */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block p-4`}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 이메일 필터 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="text"
              id="email"
              value={localFilters.email || ''}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              placeholder="이메일 주소"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* 활성 상태 필터 */}
          <div>
            <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-1">
              활성 상태
            </label>
            <select
              id="active"
              value={localFilters.active === undefined ? '' : String(localFilters.active)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFilterChange('active', undefined);
                } else {
                  handleFilterChange('active', value === 'true');
                }
              }}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 고객</option>
              <option value="true">활성 고객</option>
              <option value="false">비활성 고객</option>
            </select>
          </div>

          {/* 매장 필터 */}
          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
              매장
            </label>
            <select
              id="storeId"
              value={localFilters.storeId || ''}
              onChange={(e) => handleFilterChange('storeId', e.target.value ? Number(e.target.value) : '')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 매장</option>
              {stores.map((store) => (
                <option key={store.store_id} value={store.store_id}>
                  {store.city_name} ({store.manager_name})
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 기준 */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              정렬 기준
            </label>
            <select
              id="sortBy"
              value={localFilters.sortBy || 'last_name'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="last_name">성</option>
              <option value="first_name">이름</option>
              <option value="email">이메일</option>
              <option value="create_date">가입일</option>
              <option value="rental_count">대여 수</option>
              <option value="total_payments">결제 금액</option>
            </select>
          </div>

          {/* 정렬 방향 */}
          <div>
            <label htmlFor="sortDirection" className="block text-sm font-medium text-gray-700 mb-1">
              정렬 방향
            </label>
            <select
              id="sortDirection"
              value={localFilters.sortDirection || 'asc'}
              onChange={(e) => handleFilterChange('sortDirection', e.target.value as 'asc' | 'desc')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="asc">오름차순</option>
              <option value="desc">내림차순</option>
            </select>
          </div>
        </div>

        {/* 필터 액션 버튼 */}
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            필터 적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;

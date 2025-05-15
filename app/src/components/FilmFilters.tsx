import { useState, useEffect } from 'react';
import { Category, FilmFilterParams } from '@/types/film';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface FilmFiltersProps {
  filters: FilmFilterParams;
  onFilterChange: (filters: FilmFilterParams) => void;
}

const FilmFilters = ({ filters, onFilterChange }: FilmFiltersProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilmFilterParams>(filters);

  // 카테고리 데이터 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('카테고리 로드 실패:', error);
      }
    };

    fetchCategories();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (name: keyof FilmFilterParams, value: any) => {
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
      title: undefined,
      categoryId: undefined,
      releaseYear: undefined,
      rating: undefined,
      minLength: undefined,
      maxLength: undefined,
      sortBy: 'title',
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

      {/* 모바일 검색바 */}
      <div className="p-4 border-b">
        <div className="relative">
          <input
            type="text"
            value={localFilters.title || ''}
            onChange={(e) => handleFilterChange('title', e.target.value)}
            placeholder="영화 제목 검색..."
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
          {/* 카테고리 필터 */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              id="category"
              value={localFilters.categoryId || ''}
              onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : '')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 카테고리</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* 출시 연도 필터 */}
          <div>
            <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-1">
              출시 연도
            </label>
            <select
              id="releaseYear"
              value={localFilters.releaseYear || ''}
              onChange={(e) => handleFilterChange('releaseYear', e.target.value ? Number(e.target.value) : '')}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 연도</option>
              {Array.from({ length: 30 }, (_, i) => 2000 + i).map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* 등급 필터 */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              등급
            </label>
            <select
              id="rating"
              value={localFilters.rating || ''}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">모든 등급</option>
              {['G', 'PG', 'PG-13', 'R', 'NC-17'].map(rating => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </div>

          {/* 정렬 필터 */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              정렬 기준
            </label>
            <select
              id="sortBy"
              value={localFilters.sortBy || 'title'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="title">제목</option>
              <option value="release_year">출시 연도</option>
              <option value="rental_rate">대여 가격</option>
              <option value="length">상영 시간</option>
              <option value="rating">등급</option>
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

          {/* 상영 시간 필터 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="minLength" className="block text-sm font-medium text-gray-700 mb-1">
                최소 시간(분)
              </label>
              <input
                type="number"
                id="minLength"
                min="0"
                value={localFilters.minLength || ''}
                onChange={(e) => handleFilterChange('minLength', e.target.value ? Number(e.target.value) : '')}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="maxLength" className="block text-sm font-medium text-gray-700 mb-1">
                최대 시간(분)
              </label>
              <input
                type="number"
                id="maxLength"
                min="0"
                value={localFilters.maxLength || ''}
                onChange={(e) => handleFilterChange('maxLength', e.target.value ? Number(e.target.value) : '')}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
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

export default FilmFilters;

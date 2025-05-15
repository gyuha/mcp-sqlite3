'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FilmFilterParams, Film } from '@/types/film';
import FilmCard from '@/components/FilmCard';
import FilmFilters from '@/components/FilmFilters';
import Pagination from '@/components/Pagination';

export default function FilmsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 초기 필터 설정
  const initialFilters: FilmFilterParams = {
    title: searchParams.get('title') || undefined,
    categoryId: searchParams.has('categoryId') ? Number(searchParams.get('categoryId')) : undefined,
    releaseYear: searchParams.has('releaseYear') ? Number(searchParams.get('releaseYear')) : undefined,
    rating: searchParams.get('rating') || undefined,
    actorId: searchParams.has('actorId') ? Number(searchParams.get('actorId')) : undefined,
    minLength: searchParams.has('minLength') ? Number(searchParams.get('minLength')) : undefined,
    maxLength: searchParams.has('maxLength') ? Number(searchParams.get('maxLength')) : undefined,
    sortBy: searchParams.get('sortBy') || 'title',
    sortDirection: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc',
  };
  
  const [filters, setFilters] = useState<FilmFilterParams>(initialFilters);
  const [films, setFilms] = useState<Film[]>([]);
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
  const updateUrl = (page: number, newFilters: FilmFilterParams) => {
    const params = new URLSearchParams();
    
    // 페이지 및 페이지 크기
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    
    // 필터 매개변수
    if (newFilters.title) params.set('title', newFilters.title);
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId.toString());
    if (newFilters.releaseYear) params.set('releaseYear', newFilters.releaseYear.toString());
    if (newFilters.rating) params.set('rating', newFilters.rating);
    if (newFilters.actorId) params.set('actorId', newFilters.actorId.toString());
    if (newFilters.minLength) params.set('minLength', newFilters.minLength.toString());
    if (newFilters.maxLength) params.set('maxLength', newFilters.maxLength.toString());
    if (newFilters.sortBy) params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortDirection) params.set('sortDirection', newFilters.sortDirection);
    
    // URL 업데이트
    router.push(`/films?${params.toString()}`);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilters: FilmFilterParams) => {
    setFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
    updateUrl(1, newFilters);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page, filters);
  };

  // 영화 데이터 로드
  useEffect(() => {
    const fetchFilms = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // URL 쿼리 매개변수 구성
        const params = new URLSearchParams();
        
        // 페이지네이션 매개변수
        params.set('page', currentPage.toString());
        params.set('pageSize', pageSize.toString());
        
        // 필터 매개변수
        if (filters.title) params.set('title', filters.title);
        if (filters.categoryId) params.set('categoryId', filters.categoryId.toString());
        if (filters.releaseYear) params.set('releaseYear', filters.releaseYear.toString());
        if (filters.rating) params.set('rating', filters.rating);
        if (filters.actorId) params.set('actorId', filters.actorId.toString());
        if (filters.minLength) params.set('minLength', filters.minLength.toString());
        if (filters.maxLength) params.set('maxLength', filters.maxLength.toString());
        if (filters.sortBy) params.set('sortBy', filters.sortBy);
        if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);
        
        // API 요청
        const response = await fetch(`/api/films?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('영화 데이터를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setFilms(data.data);
        setTotalItems(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        setFilms([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilms();
  }, [currentPage, pageSize, filters]);

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">영화 목록</h1>
      
      {/* 필터 섹션 */}
      <FilmFilters filters={filters} onFilterChange={handleFilterChange} />
      
      {/* 결과 개요 */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          총 {totalItems}개 영화 중 {films.length}개 표시 중
          {filters.title && ` (검색: "${filters.title}")`}
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
      {!loading && !error && films.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <p className="text-gray-400 mt-2">다른 검색어나 필터를 시도해보세요.</p>
        </div>
      )}
      
      {/* 영화 그리드 */}
      {!loading && !error && films.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {films.map((film) => (
            <FilmCard key={film.film_id} film={film} />
          ))}
        </div>
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

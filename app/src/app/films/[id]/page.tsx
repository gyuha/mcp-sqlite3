'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FilmWithDetails } from '@/types/film';
import { StarIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// 등급에 따른 별점 수 계산 함수
const getRatingStars = (rating: string): number => {
  const ratingsMap: Record<string, number> = {
    'G': 5,
    'PG': 4,
    'PG-13': 3,
    'R': 2,
    'NC-17': 1
  };
  return ratingsMap[rating] || 0;
};

export default function FilmDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [film, setFilm] = useState<FilmWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchFilm = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/films/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('영화를 찾을 수 없습니다.');
          } else {
            throw new Error('영화 정보를 불러오는데 실패했습니다.');
          }
        }
        
        const data = await response.json();
        setFilm(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchFilm();
    }
  }, [id]);

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러 표시
  if (error || !film) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error || '영화 정보를 불러올 수 없습니다.'}</p>
          <button 
            onClick={() => router.push('/films')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            영화 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 영화 상세 정보 렌더링
  const stars = getRatingStars(film.rating);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 링크 */}
      <div className="mb-6">
        <Link href="/films" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          영화 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* 영화 헤더 */}
        <div className="md:flex">
          {/* 영화 포스터 */}
          <div className="md:w-1/3 p-4 flex justify-center">
            <div className="relative w-full max-w-xs h-[400px]">
              <Image
                src={`https://placehold.co/300x450?text=${encodeURIComponent(film.title)}`}
                alt={film.title}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
          </div>
          
          {/* 영화 정보 */}
          <div className="md:w-2/3 p-6">
            <h1 className="text-3xl font-bold mb-2">{film.title}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex mr-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < stars ? (
                      <StarIconSolid className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <StarIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </span>
                ))}
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                {film.rating}
              </span>
            </div>
            
            <p className="text-gray-700 mb-6">{film.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="font-semibold text-gray-900">출시 연도</h2>
                <p>{film.release_year}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">언어</h2>
                <p>{film.language_name}</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">상영 시간</h2>
                <p className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
                  {film.length} 분
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">대여 요금</h2>
                <p className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1 text-gray-500" />
                  ${film.rental_rate.toFixed(2)}
                </p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">대여 기간</h2>
                <p>{film.rental_duration} 일</p>
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">교체 비용</h2>
                <p>${film.replacement_cost.toFixed(2)}</p>
              </div>
            </div>
            
            {/* 카테고리 */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">카테고리</h2>
              <div className="flex flex-wrap gap-2">
                {film.categories.map((category) => (
                  <Link
                    href={`/films?categoryId=${category.category_id}`}
                    key={category.category_id}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-full transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* 재고 상태 */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">재고 상태</h2>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${film.available_count > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>{film.available_count > 0 ? '대여 가능' : '대여 불가'}</span>
                <span className="text-gray-500 ml-2">
                  ({film.available_count}/{film.inventory_count} 개 이용 가능)
                </span>
              </div>
            </div>
            
            {/* 대여 버튼 */}
            <button
              className={`px-6 py-3 rounded-md font-medium text-white ${
                film.available_count > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={film.available_count === 0}
            >
              {film.available_count > 0 ? '대여하기' : '재고 없음'}
            </button>
          </div>
        </div>
        
        {/* 출연진 섹션 */}
        <div className="p-6 border-t">
          <h2 className="text-2xl font-bold mb-4">출연진</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {film.actors.map((actor) => (
              <div key={actor.actor_id} className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-2 overflow-hidden">
                  <span className="text-gray-400 text-2xl">
                    {actor.first_name[0]}{actor.last_name[0]}
                  </span>
                </div>
                <Link href={`/films?actorId=${actor.actor_id}`} className="font-medium text-gray-900 hover:text-blue-600">
                  {`${actor.first_name} ${actor.last_name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* 추가 기능 및 정보 */}
        <div className="p-6 border-t">
          <h2 className="text-2xl font-bold mb-4">추가 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">특별 기능</h3>
              <p className="text-gray-700">
                {film.special_features || '특별 기능 없음'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">최근 업데이트</h3>
              <p className="text-gray-700">
                {new Date(film.last_update).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

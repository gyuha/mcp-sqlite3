import Image from 'next/image';
import Link from 'next/link';
import { Film } from '@/types/film';
import { StarIcon } from '@heroicons/react/24/solid';

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

// 등급에 따른 배경색 클래스 함수
const getRatingColorClass = (rating: string): string => {
  const ratingsMap: Record<string, string> = {
    'G': 'bg-green-100 text-green-800',
    'PG': 'bg-blue-100 text-blue-800',
    'PG-13': 'bg-yellow-100 text-yellow-800',
    'R': 'bg-orange-100 text-orange-800',
    'NC-17': 'bg-red-100 text-red-800'
  };
  return ratingsMap[rating] || 'bg-gray-100 text-gray-800';
};

// 영화 포스터 기본 URL (실제로는 API에서 받아와야 함)
const POSTER_PLACEHOLDER = 'https://placehold.co/300x450?text=No+Image';

interface FilmCardProps {
  film: Film & {
    language_name?: string;
    inventory_count?: number;
    available_count?: number;
  };
}

const FilmCard = ({ film }: FilmCardProps) => {
  const stars = getRatingStars(film.rating);
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
      <Link href={`/films/${film.film_id}`}>
        <div className="relative h-64 bg-gray-200">
          <Image
            src={POSTER_PLACEHOLDER}
            alt={film.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
            className="transition-opacity duration-300"
            priority={false}
          />
          <div className="absolute top-2 right-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColorClass(film.rating)}`}>
              {film.rating}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{film.title}</h3>
          <p className="text-gray-600 text-sm mt-1">{film.release_year}</p>
          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{film.description}</p>
          
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-gray-900 font-medium">${film.rental_rate.toFixed(2)}</p>
          </div>
          
          {(film.inventory_count !== undefined && film.available_count !== undefined) && (
            <div className="mt-3 text-sm">
              <span className={`${film.available_count > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {film.available_count > 0 ? '대여 가능' : '대여 불가'}
              </span>
              <span className="text-gray-500 ml-2">
                (재고: {film.available_count}/{film.inventory_count})
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default FilmCard;

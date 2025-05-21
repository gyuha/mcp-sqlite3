'use client';

import { useQuery } from '@tanstack/react-query';
import { Artist } from '@/types/database';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';

export default function ArtistsPage() {
  const { data: artists, isLoading, error } = useQuery<Artist[]>({
    queryKey: ['artists'],
    queryFn: async () => {
      const response = await fetch('/api/artists');
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      const data = await response.json();
      return data.data.items;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        message="아티스트 목록을 불러오는데 실패했습니다."
        error={error instanceof Error ? error : new Error('Unknown error')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">아티스트</h1>
        <p className="text-gray-500">등록된 모든 아티스트 목록입니다.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists?.map((artist) => (
          <div
            key={artist.ArtistId}
            className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold">{artist.Name}</h2>
            {artist.albumCount !== undefined && (
              <p className="text-gray-500 mt-2">앨범 {artist.albumCount}개</p>
            )}
            <a
              href={`/artists/${artist.ArtistId}`}
              className="text-blue-600 hover:underline mt-4 inline-block"
            >
              자세히 보기 →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

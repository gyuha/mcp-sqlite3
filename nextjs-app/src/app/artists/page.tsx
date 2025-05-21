'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Artist } from '@/types/database';
import { ApiResponse } from '@/lib/api-utils';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';
import { Card } from '@/components/ui/Card';

export default function ArtistsPage() {
  const { data, isLoading, error } = useQuery<ApiResponse<Artist[]>>({
    queryKey: ['artists'],
    queryFn: async () => {
      const response = await fetch('/api/artists');
      if (!response.ok) {
        throw new Error('Failed to fetch artists');
      }
      return response.json();
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

  const artists = data?.data ?? [];

  return (
    <main className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">아티스트</h1>
        <p className="text-gray-500 mt-2">등록된 모든 아티스트 목록입니다.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists.map((artist) => (
          <Link 
            key={artist.ArtistId} 
            href={`/artists/${artist.ArtistId}`}
          >
            <Card className="h-full hover:border-blue-500 transition-colors">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{artist.Name}</h2>
                <p className="text-gray-600">
                  {artist.albumCount ?? 0} 앨범
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {artists.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">등록된 아티스트가 없습니다.</p>
        </div>
      )}
    </main>
  );
}

'use client';

import { useState } from 'react';
import { Album } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAlbums, AlbumFilters } from '@/lib/hooks';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';

export default function AlbumsPage() {
  const [filters, setFilters] = useState<AlbumFilters>({
    page: 1,
    limit: 9,
    sortBy: 'Title',
    sortOrder: 'asc',
  });

  const { data, isLoading, error, refetch } = useAlbums(filters) as {
    data: { items: Album[]; pagination: any } | undefined;
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
  };
  
  const albums: Album[] = data?.items ?? [];
  const pagination = data?.pagination;

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="앨범 목록을 불러오는데 실패했습니다." retry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">앨범</h1>
        <p className="text-gray-500">등록된 모든 앨범 목록입니다.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {albums.map((album: Album) => (
          <Card key={album.albumId}>
            <CardHeader>
              <CardTitle>{album.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <span className="text-sm text-gray-500">
                  아티스트: {album.artistName}
                </span>
                <span className="text-sm text-gray-500">
                  트랙 수: {album.trackCount}
                </span>
                <a
                  href={`/albums/${album.albumId}`}
                  className="text-blue-600 hover:underline"
                >
                  자세히 보기 →
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pagination && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
              !pagination.hasPreviousPage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handlePageChange(filters.page! - 1)}
            disabled={!pagination.hasPreviousPage}
          >
            이전
          </button>
          <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${
              !pagination.hasNextPage ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => handlePageChange(filters.page! + 1)}
            disabled={!pagination.hasNextPage}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

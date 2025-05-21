'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Artist, Album } from '@/types/database';
import { ApiResponse } from '@/lib/api-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';

export default function ArtistPage({ params }: { params: { id: string } }) {
  const {
    data: artistData,
    isLoading: isLoadingArtist,
    error: artistError
  } = useQuery<ApiResponse<Artist>>({
    queryKey: ['artist', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch artist');
      }
      return response.json();
    },
  });

  const {
    data: albumsData,
    isLoading: isLoadingAlbums,
    error: albumsError
  } = useQuery<ApiResponse<Album[]>>({
    queryKey: ['artist-albums', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${params.id}/albums`);
      if (!response.ok) {
        throw new Error('Failed to fetch albums');
      }
      return response.json();
    },
    enabled: !!artistData?.data,
  });

  if (isLoadingArtist || isLoadingAlbums) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  if (artistError || albumsError) {
    return (
      <ErrorMessage
        message="데이터를 불러오는데 실패했습니다."
        error={artistError instanceof Error ? artistError : 
              albumsError instanceof Error ? albumsError : 
              new Error('Unknown error')}
      />
    );
  }

  const artist = artistData?.data;
  const albums = albumsData?.data ?? [];

  if (!artist) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{artist.Name}</h1>
        <p className="text-gray-500 mt-2">아티스트 정보 및 앨범 목록</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">앨범 목록</h2>
          <span className="text-gray-500">총 {albums.length}개의 앨범</span>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link 
                key={album.AlbumId} 
                href={`/albums/${album.AlbumId}`}
              >
                <Card className="h-full hover:border-blue-500 transition-colors">
                  <CardHeader>
                    <CardTitle>{album.Title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      {album.trackCount ?? 0} 트랙
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">등록된 앨범이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Album, Artist, Track } from '@/types/database';
import { ApiResponse } from '@/lib/api-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';

export default function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
  // 앨범 정보 조회
  const {
    data: albumData,
    isLoading: isLoadingAlbum,
    error: albumError
  } = useQuery<ApiResponse<Album>>({
    queryKey: ['album', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/albums/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch album');
      }
      return response.json();
    },
  });

  // 아티스트 정보 조회
  const {
    data: artistData,
    isLoading: isLoadingArtist,
    error: artistError
  } = useQuery<ApiResponse<Artist>>({
    queryKey: ['album-artist', albumData?.data?.ArtistId],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${albumData?.data?.ArtistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch artist');
      }
      return response.json();
    },
    enabled: !!albumData?.data?.ArtistId,
  });

  // 트랙 목록 조회
  const {
    data: tracksData,
    isLoading: isLoadingTracks,
    error: tracksError
  } = useQuery<ApiResponse<Track[]>>({
    queryKey: ['album-tracks', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/albums/${params.id}/tracks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tracks');
      }
      return response.json();
    },
    enabled: !!albumData?.data,
  });

  if (isLoadingAlbum || isLoadingArtist || isLoadingTracks) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
        <span className="ml-3 text-gray-600">로딩 중...</span>
      </div>
    );
  }

  if (albumError || artistError || tracksError) {
    return (
      <ErrorMessage
        message="데이터를 불러오는데 실패했습니다."
        error={
          albumError instanceof Error ? albumError :
          artistError instanceof Error ? artistError :
          tracksError instanceof Error ? tracksError :
          new Error('Unknown error')
        }
      />
    );
  }

  const album = albumData?.data;
  const artist = artistData?.data;
  const tracks = tracksData?.data ?? [];

  if (!album || !artist) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold">{album.Title}</h1>
        <Link 
          href={`/artists/${artist.ArtistId}`}
          className="text-blue-600 hover:underline"
        >
          {artist.Name}
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">트랙 목록</h2>
          <span className="text-gray-500">총 {tracks.length}개의 트랙</span>
        </div>

        {tracks.length > 0 ? (
          <div className="space-y-4">
            {tracks.map((track) => (
              <Card key={track.TrackId}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{track.Name}</h3>
                      {track.Composer && (
                        <p className="text-sm text-gray-500">
                          작곡: {track.Composer}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{Math.round(track.Milliseconds / 1000 / 60)}분</p>
                      <p>{(track.UnitPrice).toLocaleString()}원</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">등록된 트랙이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Artist } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useArtists } from '@/lib/hooks';
import LoadingSpinner from '@/components/ui/loading';
import ErrorMessage from '@/components/ui/error';

export default function ArtistsPage() {
  const { data: artists, isLoading, error, refetch } = useArtists();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="아티스트 목록을 불러오는데 실패했습니다." retry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">아티스트</h1>
        <p className="text-gray-500">등록된 모든 아티스트 목록입니다.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {artists?.map((artist) => (
          <Card key={artist.ArtistId}>
            <CardHeader>
              <CardTitle>{artist.Name}</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`/artists/${artist.ArtistId}`}
                className="text-blue-600 hover:underline"
              >
                자세히 보기 →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

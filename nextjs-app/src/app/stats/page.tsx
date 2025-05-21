'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { statsApi } from '@/lib/api-client';

interface Stats {
  totalAlbums: number;
  totalArtists: number;
  totalTracks: number;
  avgTracksPerAlbum: number;
  topGenres: Array<{ name: string; count: number }>;
  topArtists: Array<{ name: string; albumCount: number }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await statsApi.getOverview();
        setStats(response.data ?? null);
      } catch (error) {
        setError(error instanceof Error ? error.message : '통계를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">음악 라이브러리 통계</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">총 앨범 수</h3>
          <p className="text-3xl font-bold">{stats.totalAlbums}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">총 아티스트 수</h3>
          <p className="text-3xl font-bold">{stats.totalArtists}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">총 트랙 수</h3>
          <p className="text-3xl font-bold">{stats.totalTracks}</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">앨범당 평균 트랙</h3>
          <p className="text-3xl font-bold">{stats.avgTracksPerAlbum}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">인기 장르</h2>
          <div className="space-y-4">
            {stats.topGenres.map((genre, index) => (
              <div key={genre.name} className="flex justify-between items-center">
                <span className="font-medium">{index + 1}. {genre.name}</span>
                <span className="text-gray-600">{genre.count} 트랙</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">인기 아티스트</h2>
          <div className="space-y-4">
            {stats.topArtists.map((artist, index) => (
              <div key={artist.name} className="flex justify-between items-center">
                <span className="font-medium">{index + 1}. {artist.name}</span>
                <span className="text-gray-600">{artist.albumCount} 앨범</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
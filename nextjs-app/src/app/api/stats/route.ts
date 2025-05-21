import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import { createApiResponse, handleApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const db = DatabaseManager.getInstance();

    const stats = {
      totalAlbums: 0,
      totalArtists: 0,
      totalTracks: 0,
      avgTracksPerAlbum: 0,
      topGenres: [] as { name: string; count: number }[],
      topArtists: [] as { name: string; albumCount: number }[],
    };

    // 기본 통계
    const basicStats = db.getConnection().prepare(`
      SELECT
        (SELECT COUNT(*) FROM Album) as totalAlbums,
        (SELECT COUNT(*) FROM Artist) as totalArtists,
        (SELECT COUNT(*) FROM Track) as totalTracks,
        ROUND(CAST((SELECT COUNT(*) FROM Track) AS FLOAT) / 
              CAST((SELECT COUNT(*) FROM Album) AS FLOAT), 2) as avgTracksPerAlbum
    `).get() as {
      totalAlbums: number;
      totalArtists: number;
      totalTracks: number;
      avgTracksPerAlbum: number;
    };

    Object.assign(stats, basicStats);

    // 상위 장르
    stats.topGenres = db.getConnection().prepare(`
      SELECT 
        Genre.Name as name,
        COUNT(Track.TrackId) as count
      FROM Genre
      JOIN Track ON Genre.GenreId = Track.GenreId
      GROUP BY Genre.GenreId
      ORDER BY count DESC
      LIMIT 5
    `).all() as { name: string; count: number }[];

    // 상위 아티스트
    stats.topArtists = db.getConnection().prepare(`
      SELECT 
        Artist.Name as name,
        COUNT(Album.AlbumId) as albumCount
      FROM Artist
      JOIN Album ON Artist.ArtistId = Album.ArtistId
      GROUP BY Artist.ArtistId
      ORDER BY albumCount DESC
      LIMIT 5
    `).all() as { name: string; albumCount: number }[];

    return createApiResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}

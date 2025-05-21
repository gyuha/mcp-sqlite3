import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { Album, Track, Artist } from '@/types/database';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

// GET /api/albums/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    db.connect();

    // 앨범, 아티스트 정보 및 통계 조회
    const albumInfo = db.queryOne<Album & {
      ArtistName: string;
      TrackCount: number;
      TotalDuration: number;
      TotalPrice: number;
    }>(`
      SELECT 
        a.*,
        ar.Name as ArtistName,
        COUNT(t.TrackId) as TrackCount,
        SUM(t.Milliseconds) as TotalDuration,
        SUM(t.UnitPrice) as TotalPrice
      FROM Album a
      LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
      LEFT JOIN Track t ON a.AlbumId = t.AlbumId
      WHERE a.AlbumId = ?
      GROUP BY a.AlbumId
    `, [id]);

    if (!albumInfo) {
      return createErrorResponse('Album not found', 404);
    }

    // 앨범의 트랙 목록 조회
    const tracks = db.query<Track & { GenreName: string; MediaTypeName: string }>(`
      SELECT 
        t.*,
        g.Name as GenreName,
        m.Name as MediaTypeName
      FROM Track t
      LEFT JOIN Genre g ON t.GenreId = g.GenreId
      LEFT JOIN MediaType m ON t.MediaTypeId = m.MediaTypeId
      WHERE t.AlbumId = ?
      ORDER BY t.TrackId
    `, [id]);

    // 아티스트의 다른 앨범 조회
    const otherAlbums = db.query<Album>(`
      SELECT * FROM Album
      WHERE ArtistId = ? AND AlbumId != ?
      LIMIT 5
    `, [albumInfo.ArtistId, id]);

    return createSuccessResponse({
      ...albumInfo,
      tracks,
      otherAlbums,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

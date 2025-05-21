import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { Album, Artist } from '@/types/database';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

// GET /api/artists/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    db.connect();

    // 아티스트 정보 조회
    const artist = db.queryOne<Artist>(
      'SELECT * FROM Artist WHERE ArtistId = ?',
      [id]
    );

    if (!artist) {
      return createErrorResponse('Artist not found', 404);
    }

    // 아티스트의 앨범 목록 조회
    const albums = db.query<Album>(
      'SELECT * FROM Album WHERE ArtistId = ? ORDER BY Title',
      [id]
    );

    // 앨범 수와 트랙 수 조회
    const stats = db.queryOne<{ albumCount: number; trackCount: number }>(
      `SELECT 
        COUNT(DISTINCT a.AlbumId) as albumCount,
        COUNT(t.TrackId) as trackCount
       FROM Artist ar
       LEFT JOIN Album a ON ar.ArtistId = a.ArtistId
       LEFT JOIN Track t ON a.AlbumId = t.AlbumId
       WHERE ar.ArtistId = ?
       GROUP BY ar.ArtistId`,
      [id]
    );

    return createSuccessResponse({
      ...artist,
      albums,
      stats: {
        albumCount: stats?.albumCount || 0,
        trackCount: stats?.trackCount || 0,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

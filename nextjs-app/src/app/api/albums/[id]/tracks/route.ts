import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import {
  createApiResponse,
  createErrorResponse,
  handleApiError
} from '@/lib/api-utils';
import { Track } from '@/types/database';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const albumId = parseInt(id);

    if (isNaN(albumId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const tracks = db.getConnection().prepare(`
      SELECT 
        Track.TrackId,
        Track.Name,
        Track.AlbumId,
        Track.MediaTypeId,
        Track.GenreId,
        Track.Composer,
        Track.Milliseconds,
        Track.Bytes,
        Track.UnitPrice,
        Genre.Name as genreName
      FROM Track
      LEFT JOIN Genre ON Track.GenreId = Genre.GenreId
      WHERE Track.AlbumId = ?
      ORDER BY Track.TrackId ASC
    `).all(albumId) as Track[];

    // 앨범이 존재하는지 확인
    if (tracks.length === 0) {
      const album = db.getConnection().prepare(`
        SELECT AlbumId FROM Album WHERE AlbumId = ?
      `).get(albumId);

      if (!album) {
        return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
      }
    }

    return createApiResponse(tracks);
  } catch (error) {
    return handleApiError(error);
  }
}
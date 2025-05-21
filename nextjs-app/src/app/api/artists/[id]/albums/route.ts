import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import {
  createApiResponse,
  createErrorResponse,
  handleApiError
} from '@/lib/api-utils';
import { Album } from '@/types/database';

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const artistId = parseInt(id);

    if (isNaN(artistId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const albums = db.getConnection().prepare(`
      SELECT 
        Album.AlbumId,
        Album.Title,
        Album.ArtistId,
        Artist.Name as artistName,
        COUNT(Track.TrackId) as trackCount
      FROM Album
      JOIN Artist ON Album.ArtistId = Artist.ArtistId
      LEFT JOIN Track ON Album.AlbumId = Track.AlbumId
      WHERE Album.ArtistId = ?
      GROUP BY Album.AlbumId
      ORDER BY Album.Title ASC
    `).all(artistId) as Album[];

    return createApiResponse(albums);
  } catch (error) {
    return handleApiError(error);
  }
}
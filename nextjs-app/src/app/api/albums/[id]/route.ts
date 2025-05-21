import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import {
  createApiResponse,
  createSuccessMessage,
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
    const albumId = parseInt(id);

    if (isNaN(albumId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const album = db.getConnection().prepare(`
      SELECT 
        Album.AlbumId,
        Album.Title,
        Album.ArtistId,
        Artist.Name as artistName,
        COUNT(Track.TrackId) as trackCount
      FROM Album
      JOIN Artist ON Album.ArtistId = Artist.ArtistId
      LEFT JOIN Track ON Album.AlbumId = Track.AlbumId
      WHERE Album.AlbumId = ?
      GROUP BY Album.AlbumId
    `).get(albumId) as Album | undefined;

    if (!album) {
      return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
    }

    return createApiResponse(album);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const albumId = parseInt(id);

    if (isNaN(albumId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const { Title, ArtistId } = await request.json();
    if (!Title || !ArtistId) {
      return createErrorResponse('앨범 제목과 아티스트 ID는 필수입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection()
      .prepare('UPDATE Album SET Title = ?, ArtistId = ? WHERE AlbumId = ?')
      .run(Title, ArtistId, albumId);
    
    if (result.changes === 0) {
      return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
    }

    const album = db.getConnection()
      .prepare('SELECT AlbumId, Title, ArtistId FROM Album WHERE AlbumId = ?')
      .get(albumId) as Album;

    return createApiResponse(album);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
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
    
    // 먼저 앨범에 관련된 트랙이 있는지 확인
    const tracks = db.getConnection()
      .prepare('SELECT COUNT(*) as count FROM Track WHERE AlbumId = ?')
      .get(albumId) as { count: number };
    
    if (tracks.count > 0) {
      return createErrorResponse('트랙이 있는 앨범은 삭제할 수 없습니다.', 400);
    }

    const result = db.getConnection()
      .prepare('DELETE FROM Album WHERE AlbumId = ?')
      .run(albumId);
    
    if (result.changes === 0) {
      return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
    }

    return createSuccessMessage('앨범이 삭제되었습니다.');
  } catch (error) {
    return handleApiError(error);
  }
}

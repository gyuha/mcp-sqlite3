import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import {
  createApiResponse,
  createErrorResponse,
  createSuccessMessage,
  handleApiError
} from '@/lib/api-utils';
import { Album } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const album = db.getConnection().prepare(`
      SELECT 
        Album.AlbumId as id,
        Album.Title as title,
        Artist.Name as artistName,
        Artist.ArtistId as artistId,
        COUNT(Track.TrackId) as trackCount
      FROM Album
      JOIN Artist ON Album.ArtistId = Artist.ArtistId
      LEFT JOIN Track ON Album.AlbumId = Track.AlbumId
      WHERE Album.AlbumId = ?
      GROUP BY Album.AlbumId
    `).get(id) as Album | undefined;

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
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const { title, artistId } = await request.json();
    if (!title || !artistId) {
      return createErrorResponse('제목과 아티스트 ID는 필수입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection().prepare(`
      UPDATE Album SET Title = ?, ArtistId = ? WHERE AlbumId = ?
    `).run(title, artistId, id);

    if (result.changes === 0) {
      return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
    }

    return createSuccessMessage('앨범이 성공적으로 업데이트되었습니다.');
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection().prepare(`
      DELETE FROM Album WHERE AlbumId = ?
    `).run(id);

    if (result.changes === 0) {
      return createErrorResponse('앨범을 찾을 수 없습니다.', 404);
    }

    return createSuccessMessage('앨범이 성공적으로 삭제되었습니다.');
  } catch (error) {
    return handleApiError(error);
  }
}

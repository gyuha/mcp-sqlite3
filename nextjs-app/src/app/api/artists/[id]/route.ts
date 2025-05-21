import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import { Artist } from '@/types/database';
import { createApiResponse, createSuccessMessage, createErrorResponse, handleApiError } from '@/lib/api-utils';

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
    
    const artist = db.getConnection()
      .prepare(`
        SELECT 
          Artist.ArtistId,
          Artist.Name,
          COUNT(Album.AlbumId) as albumCount
        FROM Artist
        LEFT JOIN Album ON Artist.ArtistId = Album.ArtistId
        WHERE Artist.ArtistId = ?
        GROUP BY Artist.ArtistId
      `)
      .get(artistId) as Artist;

    if (!artist) {
      return createErrorResponse('아티스트를 찾을 수 없습니다.', 404);
    }

    return createApiResponse(artist);
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
    const artistId = parseInt(id);
    
    if (isNaN(artistId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const { Name } = await request.json();
    if (!Name) {
      return createErrorResponse('아티스트 이름은 필수입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection()
      .prepare('UPDATE Artist SET Name = ? WHERE ArtistId = ?')
      .run(Name, artistId);
    
    if (result.changes === 0) {
      return createErrorResponse('아티스트를 찾을 수 없습니다.', 404);
    }

    const artist = db.getConnection()
      .prepare('SELECT ArtistId, Name FROM Artist WHERE ArtistId = ?')
      .get(artistId) as Artist;

    return createApiResponse(artist);
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
    const artistId = parseInt(id);
    
    if (isNaN(artistId)) {
      return createErrorResponse('유효하지 않은 ID입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    
    // 먼저 아티스트와 관련된 앨범이 있는지 확인
    const albums = db.getConnection()
      .prepare('SELECT COUNT(*) as count FROM Album WHERE ArtistId = ?')
      .get(artistId) as { count: number };
    
    if (albums.count > 0) {
      return createErrorResponse('앨범이 있는 아티스트는 삭제할 수 없습니다.', 400);
    }

    const result = db.getConnection()
      .prepare('DELETE FROM Artist WHERE ArtistId = ?')
      .run(artistId);
    
    if (result.changes === 0) {
      return createErrorResponse('아티스트를 찾을 수 없습니다.', 404);
    }

    return createSuccessMessage('아티스트가 삭제되었습니다.');
  } catch (error) {
    return handleApiError(error);
  }
}

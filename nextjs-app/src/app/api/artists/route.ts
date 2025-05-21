import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import { Artist } from '@/types/database';
import { createApiResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const search = searchParams.get('search') ?? '';
    const offset = (page - 1) * limit;

    const db = DatabaseManager.getInstance();
    
    // 검색 조건이 있는 경우와 없는 경우에 따라 쿼리 분기
    const baseQuery = `
      SELECT 
        Artist.ArtistId,
        Artist.Name,
        COUNT(Album.AlbumId) as albumCount
      FROM Artist
      LEFT JOIN Album ON Artist.ArtistId = Album.ArtistId
    `;

    const whereClause = search ? 'WHERE Artist.Name LIKE ?' : '';
    const groupBy = 'GROUP BY Artist.ArtistId';
    const orderBy = 'ORDER BY Artist.Name ASC';
    const limitClause = 'LIMIT ? OFFSET ?';

    const query = [baseQuery, whereClause, groupBy, orderBy, limitClause]
      .filter(Boolean)
      .join(' ');

    const params = search 
      ? [`%${search}%`, limit, offset]
      : [limit, offset];

    const artists = db.getConnection()
      .prepare(query)
      .all(...params) as Artist[];

    // 총 레코드 수 조회
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM Artist 
      ${whereClause}
    `;

    const countParams = search ? [`%${search}%`] : [];
    const { count } = db.getConnection()
      .prepare(countQuery)
      .get(...countParams) as { count: number };

    return createApiResponse(artists, {
      totalCount: count,
      currentPage: page,
      pageCount: Math.ceil(count / limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { Name } = await req.json();
    
    if (!Name) {
      return createErrorResponse('아티스트 이름은 필수입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection()
      .prepare('INSERT INTO Artist (Name) VALUES (?)')
      .run(Name);

    const newArtist = db.getConnection()
      .prepare('SELECT ArtistId, Name FROM Artist WHERE ArtistId = ?')
      .get(result.lastInsertRowid) as Artist;

    return createApiResponse(newArtist);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/artists?id=:id
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Artist ID is required', 400);
    }

    const body = await req.json();
    const { Name } = body;

    if (!Name) {
      return createErrorResponse('Artist name is required', 400);
    }

    const db = DatabaseManager.getInstance();
    const changes = db.getConnection()
      .prepare('UPDATE Artist SET Name = ? WHERE ArtistId = ?')
      .run(Name, id);
    
    if (changes.changes === 0) {
      return createErrorResponse('Artist not found', 404);
    }

    const artist = db.getConnection()
      .prepare('SELECT ArtistId, Name FROM Artist WHERE ArtistId = ?')
      .get(id) as Artist;

    return createApiResponse(artist, 'Artist updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/artists?id=:id
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Artist ID is required', 400);
    }

    const db = DatabaseManager.getInstance();
    
    // 먼저 아티스트와 관련된 앨범이 있는지 확인
    const albums = db.getConnection()
      .prepare('SELECT COUNT(*) as count FROM Album WHERE ArtistId = ?')
      .get(id) as { count: number };
    
    if (albums.count > 0) {
      return createErrorResponse('Cannot delete artist with existing albums', 400);
    }

    const changes = db.getConnection()
      .prepare('DELETE FROM Artist WHERE ArtistId = ?')
      .run(id);
    
    if (changes.changes === 0) {
      return createErrorResponse('Artist not found', 404);
    }

    return createApiResponse(null, 'Artist deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

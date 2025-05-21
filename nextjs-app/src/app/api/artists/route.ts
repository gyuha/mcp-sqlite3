import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { Artist } from '@/types/database';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

// GET /api/artists
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'Name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    db.connect();

    let sql = 'SELECT * FROM Artist';
    const params: (string | number)[] = [];

    if (search) {
      sql += ' WHERE Name LIKE ?';
      params.push(`%${search}%`);
    }

    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;

    const result = db.queryWithPagination<Artist>(sql, params, { page, limit });

    // 각 아티스트의 앨범 수를 조회
    const artistIds = result.items.map(artist => artist.ArtistId);
    if (artistIds.length > 0) {
      const albumCounts = db.query<{ ArtistId: number; count: number }>(
        `SELECT ArtistId, COUNT(*) as count 
         FROM Album 
         WHERE ArtistId IN (${artistIds.join(',')})
         GROUP BY ArtistId`
      );

      result.items = result.items.map(artist => ({
        ...artist,
        albumCount: albumCounts.find(count => count.ArtistId === artist.ArtistId)?.count || 0,
      }));
    }

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/artists
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Name } = body;

    if (!Name) {
      return createErrorResponse('Artist name is required', 400);
    }

    db.connect();
    const artistId = db.insert('Artist', { Name });
    
    const artist = db.queryOne<Artist>('SELECT * FROM Artist WHERE ArtistId = ?', [artistId]);
    return createSuccessResponse(artist, 'Artist created successfully');
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

    db.connect();
    const changes = db.update('Artist', { Name }, 'ArtistId = ?', [id]);
    
    if (changes === 0) {
      return createErrorResponse('Artist not found', 404);
    }

    const artist = db.queryOne<Artist>('SELECT * FROM Artist WHERE ArtistId = ?', [id]);
    return createSuccessResponse(artist, 'Artist updated successfully');
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

    db.connect();
    
    // 먼저 아티스트와 관련된 앨범이 있는지 확인
    const albums = db.query<{ count: number }>('SELECT COUNT(*) as count FROM Album WHERE ArtistId = ?', [id]);
    
    if (albums[0]?.count > 0) {
      return createErrorResponse('Cannot delete artist with existing albums', 400);
    }

    const changes = db.remove('Artist', 'ArtistId = ?', [id]);
    
    if (changes === 0) {
      return createErrorResponse('Artist not found', 404);
    }

    return createSuccessResponse(null, 'Artist deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

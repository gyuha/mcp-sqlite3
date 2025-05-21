import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { Track } from '@/types/database';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

// GET /api/tracks
export async function GET(req: NextRequest) {
  try {
    const albumId = req.nextUrl.searchParams.get('albumId');
    const query = albumId
      ? `SELECT * FROM Track WHERE AlbumId = ?`
      : `SELECT * FROM Track`;
    const params = albumId ? [albumId] : [];

    db.connect();
    const tracks = db.query<Track>(query, params);
    return createSuccessResponse(tracks);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/tracks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Name, AlbumId, MediaTypeId, GenreId, Composer, Milliseconds, Bytes, UnitPrice } = body;

    if (!Name || !AlbumId || !MediaTypeId || !GenreId || !Milliseconds || !UnitPrice) {
      return createErrorResponse('Required fields are missing', 400);
    }

    db.connect();
    const trackId = db.insert('Track', {
      Name,
      AlbumId,
      MediaTypeId,
      GenreId,
      Composer,
      Milliseconds,
      Bytes,
      UnitPrice
    });
    
    const track = db.queryOne<Track>('SELECT * FROM Track WHERE TrackId = ?', [trackId]);
    return createSuccessResponse(track, 'Track created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/tracks?id=:id
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Track ID is required', 400);
    }

    const body = await req.json();
    const updateData: Partial<Track> = {};
    
    const validFields = [
      'Name', 'AlbumId', 'MediaTypeId', 'GenreId',
      'Composer', 'Milliseconds', 'Bytes', 'UnitPrice'
    ] as const;

    let hasUpdates = false;
    for (const field of validFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
        hasUpdates = true;
      }
    }

    if (!hasUpdates) {
      return createErrorResponse('At least one field to update is required', 400);
    }

    db.connect();
    const changes = db.update('Track', updateData, 'TrackId = ?', [id]);
    
    if (changes === 0) {
      return createErrorResponse('Track not found', 404);
    }

    const track = db.queryOne<Track>('SELECT * FROM Track WHERE TrackId = ?', [id]);
    return createSuccessResponse(track, 'Track updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/tracks?id=:id
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Track ID is required', 400);
    }

    db.connect();
    const changes = db.remove('Track', 'TrackId = ?', [id]);
    
    if (changes === 0) {
      return createErrorResponse('Track not found', 404);
    }

    return createSuccessResponse(null, 'Track deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

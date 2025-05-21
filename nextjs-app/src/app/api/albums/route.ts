import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

interface AlbumRow {
  AlbumId: number;
  Title: string;
  ArtistId: number;
}

// GET /api/albums
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'Title';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const artistId = searchParams.get('artistId');

    db.connect();

    let sql = `
      SELECT 
        a.*,
        ar.Name as ArtistName,
        COUNT(t.TrackId) as TrackCount,
        SUM(t.Milliseconds) as TotalDuration
      FROM Album a
      LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
      LEFT JOIN Track t ON a.AlbumId = t.AlbumId
    `;

    const params: (string | number)[] = [];

    const conditions: string[] = [];
    if (search) {
      conditions.push('a.Title LIKE ?');
      params.push(`%${search}%`);
    }
    if (artistId) {
      conditions.push('a.ArtistId = ?');
      params.push(artistId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' GROUP BY a.AlbumId';
    sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    const dbInstance = db.DatabaseManager.getInstance();
    const dbConnection = dbInstance.getConnection();

    const stmt = dbConnection.prepare(sql);
    const albums = stmt.all(...params) as (AlbumRow & {
      ArtistName: string;
      TrackCount: number;
      TotalDuration: number;
    })[];
    
    const totalCountStmt = dbConnection.prepare(`
      SELECT COUNT(DISTINCT a.AlbumId) as total 
      FROM Album a
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
    `);
    const { total } = totalCountStmt.get(...params.slice(0, -2)) as { total: number };

    return createSuccessResponse({
      items: albums,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/albums
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Title, ArtistId } = body;

    if (!Title || !ArtistId) {
      return createErrorResponse('Title and ArtistId are required', 400);
    }

    db.connect();
    const albumId = db.insert('Album', { Title, ArtistId });
    
    const album = db.queryOne<AlbumRow>('SELECT * FROM Album WHERE AlbumId = ?', [albumId]);
    return createSuccessResponse(album, 'Album created successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/albums?id=:id
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Album ID is required', 400);
    }

    const body = await req.json();
    const { Title, ArtistId } = body;

    if (!Title && !ArtistId) {
      return createErrorResponse('At least one field to update is required', 400);
    }

    db.connect();
    const updateData: Partial<AlbumRow> = {};
    if (Title) updateData.Title = Title;
    if (ArtistId) updateData.ArtistId = ArtistId;

    const changes = db.update('Album', updateData, 'AlbumId = ?', [id]);
    if (changes === 0) {
      return createErrorResponse('Album not found', 404);
    }

    const album = db.queryOne<AlbumRow>('SELECT * FROM Album WHERE AlbumId = ?', [id]);
    return createSuccessResponse(album, 'Album updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/albums?id=:id
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Album ID is required', 400);
    }

    db.connect();
    const changes = db.remove('Album', 'AlbumId = ?', [id]);
    
    if (changes === 0) {
      return createErrorResponse('Album not found', 404);
    }

    return createSuccessResponse(null, 'Album deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

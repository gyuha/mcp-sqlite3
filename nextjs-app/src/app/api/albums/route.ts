import { NextRequest } from 'next/server';
import { DatabaseManager } from '@/lib/db';
import { createApiResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';
import { Album, CountResult } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const db = DatabaseManager.getInstance();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = parseInt(searchParams.get('limit') ?? '10');
    const offset = (page - 1) * limit;

    const albums = db.getConnection().prepare(`
      SELECT 
        Album.AlbumId as id,
        Album.Title as title,
        Artist.Name as artistName,
        COUNT(Track.TrackId) as trackCount
      FROM Album
      JOIN Artist ON Album.ArtistId = Artist.ArtistId
      LEFT JOIN Track ON Album.AlbumId = Track.AlbumId
      GROUP BY Album.AlbumId
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Album[];

    const countResult = db.getConnection().prepare(`
      SELECT COUNT(*) as count FROM Album
    `).get() as CountResult;

    const totalCount = countResult.count;

    return createApiResponse(albums, {
      totalCount,
      currentPage: page,
      pageCount: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, artistId } = await request.json();
    
    if (!title || !artistId) {
      return createErrorResponse('제목과 아티스트 ID는 필수입니다.', 400);
    }

    const db = DatabaseManager.getInstance();
    const result = db.getConnection().prepare(`
      INSERT INTO Album (Title, ArtistId) VALUES (?, ?)
    `).run(title, artistId);

    const newAlbum = db.getConnection().prepare(`
      SELECT AlbumId as id, Title as title, ArtistId as artistId
      FROM Album WHERE AlbumId = ?
    `).get(result.lastInsertRowid) as Album;

    return createApiResponse(newAlbum);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/albums
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

    const db = DatabaseManager.getInstance();
    const dbConnection = db.getConnection();

    const updateFields: string[] = [];
    const params: (string | number)[] = [];

    if (Title) {
      updateFields.push('Title = ?');
      params.push(Title);
    }
    if (ArtistId) {
      updateFields.push('ArtistId = ?');
      params.push(ArtistId);
    }
    params.push(Number(id));

    const stmt = dbConnection.prepare(
      `UPDATE Album SET ${updateFields.join(', ')} WHERE AlbumId = ?`
    );
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return createErrorResponse('Album not found', 404);
    }

    const album = dbConnection.prepare('SELECT * FROM Album WHERE AlbumId = ?')
      .get(id) as AlbumRow;

    return createApiResponse(album, 'Album updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/albums
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return createErrorResponse('Album ID is required', 400);
    }

    const db = DatabaseManager.getInstance();
    const dbConnection = db.getConnection();

    const stmt = dbConnection.prepare('DELETE FROM Album WHERE AlbumId = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return createErrorResponse('Album not found', 404);
    }

    return createApiResponse(null, 'Album deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}

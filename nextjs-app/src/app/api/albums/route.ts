import { NextRequest, NextResponse } from 'next/server';
import { DatabaseManager } from '@/lib/db';
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

    const offset = (page - 1) * limit;

    const db = DatabaseManager.getInstance();
    const dbConnection = db.getConnection();

    // 서브쿼리를 사용하여 트랙 정보를 미리 계산
    let sql = `
      SELECT 
        a.*,
        ar.Name as ArtistName,
        (
          SELECT COUNT(*)
          FROM Track t
          WHERE t.AlbumId = a.AlbumId
        ) as TrackCount,
        (
          SELECT SUM(Milliseconds)
          FROM Track t
          WHERE t.AlbumId = a.AlbumId
        ) as TotalDuration
      FROM Album a
      LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
      WHERE 1=1
    `;

    // 전체 레코드 수를 가져오는 쿼리
    let countSql = `
      SELECT COUNT(*) as total
      FROM Album a
      LEFT JOIN Artist ar ON a.ArtistId = ar.ArtistId
      WHERE 1=1
    `;

    const params: (string | number)[] = [];

    if (search) {
      sql += ` AND (a.Title LIKE ? OR ar.Name LIKE ?)`;
      countSql += ` AND (a.Title LIKE ? OR ar.Name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (artistId) {
      sql += ` AND a.ArtistId = ?`;
      countSql += ` AND a.ArtistId = ?`;
      params.push(artistId);
    }

    // 정렬 추가
    sql += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;

    // 페이징 추가
    sql += ` LIMIT ? OFFSET ?`;
    const queryParams = [...params];
    const countQueryParams = [...params];
    queryParams.push(limit, offset);

    const countStmt = dbConnection.prepare(countSql);
    const countResult = countStmt.get(...countQueryParams) as { total: number };
    const total = countResult.total;
    
    const stmt = dbConnection.prepare(sql);
    const items = stmt.all(...queryParams);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json(createSuccessResponse({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    }));
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
      return NextResponse.json(createErrorResponse('Title and ArtistId are required', 400));
    }

    const db = DatabaseManager.getInstance();
    const dbConnection = db.getConnection();

    const stmt = dbConnection.prepare(
      'INSERT INTO Album (Title, ArtistId) VALUES (?, ?)'
    );
    const result = stmt.run(Title, ArtistId);
    
    const album = dbConnection.prepare('SELECT * FROM Album WHERE AlbumId = ?')
      .get(result.lastInsertRowid) as AlbumRow;

    return NextResponse.json(createSuccessResponse(album, 'Album created successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/albums
export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(createErrorResponse('Album ID is required', 400));
    }

    const body = await req.json();
    const { Title, ArtistId } = body;

    if (!Title && !ArtistId) {
      return NextResponse.json(createErrorResponse('At least one field to update is required', 400));
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
      return NextResponse.json(createErrorResponse('Album not found', 404));
    }

    const album = dbConnection.prepare('SELECT * FROM Album WHERE AlbumId = ?')
      .get(id) as AlbumRow;

    return NextResponse.json(createSuccessResponse(album, 'Album updated successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/albums
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(createErrorResponse('Album ID is required', 400));
    }

    const db = DatabaseManager.getInstance();
    const dbConnection = db.getConnection();

    const stmt = dbConnection.prepare('DELETE FROM Album WHERE AlbumId = ?');
    const result = stmt.run(id);
    
    if (result.changes === 0) {
      return NextResponse.json(createErrorResponse('Album not found', 404));
    }

    return NextResponse.json(createSuccessResponse(null, 'Album deleted successfully'));
  } catch (error) {
    return handleApiError(error);
  }
}

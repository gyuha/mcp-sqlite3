import { NextRequest } from 'next/server';
import * as db from '@/lib/db';
import { AlbumStats, ArtistStats, GenreStats } from '@/types/database';
import { createSuccessResponse, createErrorResponse, handleApiError } from '@/lib/api-utils';

/**
 * 통계 데이터를 계산하고 반환하는 API 라우트
 */

// GET /api/stats/overview
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'all';
    const period = req.nextUrl.searchParams.get('period') || 'all';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    db.connect();

    // 기본 통계 정보 조회
    const overview = db.queryOne<{
      totalArtists: number;
      totalAlbums: number;
      totalTracks: number;
      totalGenres: number;
      totalDuration: number;
      totalSales: number;
    }>(`
      SELECT 
        (SELECT COUNT(*) FROM Artist) as totalArtists,
        (SELECT COUNT(*) FROM Album) as totalAlbums,
        (SELECT COUNT(*) FROM Track) as totalTracks,
        (SELECT COUNT(*) FROM Genre) as totalGenres,
        (SELECT SUM(Milliseconds) FROM Track) as totalDuration,
        (SELECT SUM(UnitPrice * Quantity) FROM InvoiceLine) as totalSales
    `);

    const result: any = { overview };

    // 요청된 통계 유형에 따라 추가 데이터 조회
    switch (type) {
      case 'all':
      case 'albums': {
        // 앨범별 트랙 통계
        const albumStats = db.query<AlbumStats>(`
          SELECT 
            a.AlbumId as albumId,
            a.Title as albumTitle,
            COUNT(t.TrackId) as trackCount,
            SUM(t.Milliseconds) as totalDuration
          FROM Album a
          LEFT JOIN Track t ON a.AlbumId = t.AlbumId
          GROUP BY a.AlbumId
          ORDER BY trackCount DESC
          LIMIT ?
        `, [limit]);
        result.albumStats = albumStats;

        if (type === 'albums') break;
      }

      case 'artists': {
        // 아티스트별 앨범 및 트랙 통계
        const artistStats = db.query<ArtistStats>(`
          SELECT 
            ar.ArtistId as artistId,
            ar.Name as artistName,
            COUNT(DISTINCT a.AlbumId) as albumCount,
            COUNT(t.TrackId) as trackCount
          FROM Artist ar
          LEFT JOIN Album a ON ar.ArtistId = a.ArtistId
          LEFT JOIN Track t ON a.AlbumId = t.AlbumId
          GROUP BY ar.ArtistId
          ORDER BY albumCount DESC, trackCount DESC
          LIMIT ?
        `, [limit]);
        result.artistStats = artistStats;

        if (type === 'artists') break;
      }

      case 'genres': {
        // 장르별 트랙 통계
        const genreStats = db.query<GenreStats>(`
          SELECT 
            g.GenreId as genreId,
            g.Name as genreName,
            COUNT(t.TrackId) as trackCount,
            SUM(t.Milliseconds) as totalDuration
          FROM Genre g
          LEFT JOIN Track t ON g.GenreId = t.GenreId
          GROUP BY g.GenreId
          ORDER BY trackCount DESC
          LIMIT ?
        `, [limit]);
        result.genreStats = genreStats;

        if (type === 'genres') break;
      }

      case 'sales': {
        // 매출 통계
        let salesQuery = `
          SELECT 
            strftime('%Y-%m', InvoiceDate) as period,
            SUM(Total) as totalSales,
            COUNT(DISTINCT CustomerId) as customerCount,
            COUNT(*) as invoiceCount
          FROM Invoice
        `;

        if (period === 'year') {
          salesQuery = salesQuery.replace('%Y-%m', '%Y');
        } else if (period === 'month') {
          salesQuery = salesQuery.replace('%Y-%m', '%Y-%m');
        }

        salesQuery += ` GROUP BY period ORDER BY period DESC LIMIT ?`;
        
        const salesStats = db.query<{
          period: string;
          totalSales: number;
          customerCount: number;
          invoiceCount: number;
        }>(salesQuery, [limit]);

        result.salesStats = salesStats;
        break;
      }

      case 'playlists': {
        // 재생목록 통계
        const playlistStats = db.query<{
          playlistId: number;
          name: string;
          trackCount: number;
          totalDuration: number;
          genreDiversity: number;
        }>(`
          SELECT 
            p.PlaylistId as playlistId,
            p.Name as name,
            COUNT(DISTINCT pt.TrackId) as trackCount,
            SUM(t.Milliseconds) as totalDuration,
            COUNT(DISTINCT t.GenreId) as genreDiversity
          FROM Playlist p
          LEFT JOIN PlaylistTrack pt ON p.PlaylistId = pt.PlaylistId
          LEFT JOIN Track t ON pt.TrackId = t.TrackId
          GROUP BY p.PlaylistId
          ORDER BY trackCount DESC
          LIMIT ?
        `, [limit]);
        result.playlistStats = playlistStats;
        break;
      }
    }

    // 일별 트랜드 데이터 (지난 30일)
    if (type === 'all' || type === 'trends') {
      const trends = db.query<{
        date: string;
        sales: number;
        invoices: number;
        tracks: number;
      }>(`
        WITH RECURSIVE dates(date) AS (
          SELECT date(max(InvoiceDate), '-29 days')
          FROM Invoice
          UNION ALL
          SELECT date(date, '+1 day')
          FROM dates
          WHERE date < (SELECT max(InvoiceDate) FROM Invoice)
        )
        SELECT 
          dates.date,
          COALESCE(SUM(i.Total), 0) as sales,
          COUNT(DISTINCT i.InvoiceId) as invoices,
          COUNT(DISTINCT il.TrackId) as tracks
        FROM dates
        LEFT JOIN Invoice i ON date(i.InvoiceDate) = dates.date
        LEFT JOIN InvoiceLine il ON i.InvoiceId = il.InvoiceId
        GROUP BY dates.date
        ORDER BY dates.date DESC
      `);
      result.trends = trends;
    }

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

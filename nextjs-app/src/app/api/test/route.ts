import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { Artist } from '@/types/database';

export async function GET() {
  try {
    // 데이터베이스 연결
    db.connect();
    
    // 테스트 쿼리 실행
    const artists = db.query<Artist>('SELECT * FROM Artist LIMIT 5');
    
    return NextResponse.json({ success: true, data: artists });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}

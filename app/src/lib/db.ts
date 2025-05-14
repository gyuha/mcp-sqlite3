import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// 데이터베이스 파일 경로 설정 (프로젝트 루트의 상위 디렉토리에 위치)
const dbPath = path.join(process.cwd(), '..', 'sakila_master.db');

// 데이터베이스 파일 존재 여부 확인
if (!fs.existsSync(dbPath)) {
  console.error(`데이터베이스 파일이 존재하지 않습니다: ${dbPath}`);
  throw new Error(`데이터베이스 파일이 존재하지 않습니다: ${dbPath}`);
}

// 데이터베이스 연결
let db: Database.Database;

try {
  db = new Database(dbPath, {
    readonly: false, // 읽기 전용 모드 비활성화
    fileMustExist: true, // 파일이 존재하지 않으면 에러 발생
  });
  
  // 외래 키 제약 조건 활성화
  db.pragma('foreign_keys = ON');
  
  console.log('SQLite 데이터베이스 연결 성공');
} catch (error) {
  console.error('SQLite 데이터베이스 연결 실패:', error);
  throw error;
}

export default db;

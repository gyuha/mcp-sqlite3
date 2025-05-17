import Database from 'better-sqlite3';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import type { Database as SQLiteDatabase } from 'better-sqlite3';

// 데이터베이스 파일 경로 설정 (프로젝트 루트의 상위 디렉토리에 위치)
const dbPath = join(process.cwd(), '..', 'sakila_master.db');

// 데이터베이스 파일 존재 여부 확인
if (!existsSync(dbPath)) {
  console.error(`데이터베이스 파일이 존재하지 않습니다: ${dbPath}`);
  throw new Error(`데이터베이스 파일이 존재하지 않습니다: ${dbPath}`);
}

// 데이터베이스 연결 (싱글톤 패턴으로 구현)
let dbInstance: SQLiteDatabase | null = null;

function getDB(): SQLiteDatabase {
  if (!dbInstance) {
    try {
      dbInstance = new Database(dbPath, {
        readonly: false, // 읽기 전용 모드 비활성화
        fileMustExist: true, // 파일이 존재하지 않으면 에러 발생
        // 성능 최적화를 위한 추가 옵션
        timeout: 5000, // 타임아웃 5초
        verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
      });
      
      // 외래 키 제약 조건 활성화
      dbInstance.pragma('foreign_keys = ON');
      
      // 성능 최적화를 위한 프라그마 설정
      dbInstance.pragma('journal_mode = WAL'); // WAL 모드 활성화
      dbInstance.pragma('cache_size = -10000'); // 약 10MB 캐시 사용
      
      console.log('SQLite 데이터베이스 연결 성공');
    } catch (error) {
      console.error('SQLite 데이터베이스 연결 실패:', error);
      throw error;
    }
  }
  
  return dbInstance;
}

// 어플리케이션 종료 시 데이터베이스 연결 닫기
process.on('exit', () => {
  if (dbInstance) {
    dbInstance.close();
    console.log('SQLite 데이터베이스 연결 종료');
  }
});

// 예상치 못한 종료 처리
process.on('SIGINT', () => {
  if (dbInstance) {
    dbInstance.close();
    console.log('SQLite 데이터베이스 연결 종료 (SIGINT)');
  }
  process.exit();
});

// 데이터베이스 인스턴스 내보내기
const db = getDB();
export default db;

// db-utils.ts의 함수들을 재내보내기 위해 추가
export { executeQuery, getRecord, insert, update, transaction, getPaginatedData } from './db-utils';

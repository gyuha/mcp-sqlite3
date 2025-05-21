import Database, { Statement, RunResult } from 'better-sqlite3';
import path from 'path';
import { PaginationParams, PaginatedResult } from '../types/database';

// 데이터베이스 연결 관리를 위한 클래스
class DatabaseManager {
  private static instance: DatabaseManager;
  private db: Database.Database | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getConnection(dbPath?: string): Database.Database {
    if (!this.db) {
      const defaultPath = dbPath || path.join(process.cwd(), '../../Chinook.db');
      console.log('Database path:', defaultPath);
      
      try {
        this.db = new Database(defaultPath, { readonly: false });
        
        // 데이터베이스 설정
        this.db.pragma('journal_mode = WAL'); // Write Ahead Logging 모드 활성화
        this.db.pragma('foreign_keys = ON'); // 외래 키 제약 조건 활성화
      } catch (error) {
        console.error('Failed to connect to database:', error);
        throw error;
      }
    }
    return this.db;
  }

  public closeConnection(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

/**
 * 현재 데이터베이스 연결을 가져오는 함수
 */
function getDb(): Database.Database {
  return DatabaseManager.getInstance().getConnection();
}

/**
 * 데이터베이스에 연결하는 함수
 * @param dbPath 데이터베이스 파일 경로 (선택적)
 * @returns Database 인스턴스
 */
export function connect(dbPath?: string): Database.Database {
  return DatabaseManager.getInstance().getConnection(dbPath);
}

/**
 * 데이터베이스 연결을 종료하는 함수
 */
export function close(): void {
  DatabaseManager.getInstance().closeConnection();
}

/**
 * 쿼리를 실행하고 결과를 반환하는 함수
 * @param sql SQL 쿼리문
 * @param params 쿼리 파라미터
 * @returns 쿼리 실행 결과
 */
export function query<T = unknown>(sql: string, params: Array<string | number> = []): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(params) as T[];
}

/**
 * 단일 행을 반환하는 쿼리를 실행하는 함수
 * @param sql SQL 쿼리문
 * @param params 쿼리 파라미터
 * @returns 단일 행 결과 또는 undefined
 */
export function queryOne<T = unknown>(sql: string, params: Array<string | number> = []): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(params) as T | undefined;
}

/**
 * 페이지네이션이 적용된 쿼리를 실행하는 함수
 * @param sql SQL 쿼리문 (WHERE 절까지 포함)
 * @param params 쿼리 파라미터
 * @param pagination 페이지네이션 정보
 * @returns 페이지네이션이 적용된 결과
 */
export function queryWithPagination<T = unknown>(
  sql: string,
  params: Array<string | number> = [],
  pagination: PaginationParams
): PaginatedResult<T> {
  const { page, limit } = pagination;
  const offset = (page - 1) * limit;

  // 전체 개수 조회
  const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
  const { total = 0 } = queryOne<{ total: number }>(countSql, params) || {};

  // 데이터 조회
  const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
  const items = query<T>(paginatedSql, [...params, limit, offset]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
}

/**
 * 데이터를 삽입하는 함수
 * @param table 테이블 이름
 * @param data 삽입할 데이터 객체
 * @returns 삽입된 행의 ID
 */
export function insert(table: string, data: Record<string, unknown>): number {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...values) as RunResult;
  return Number(result.lastInsertRowid);
}

/**
 * 데이터를 수정하는 함수
 * @param table 테이블 이름
 * @param data 수정할 데이터 객체
 * @param where WHERE 절 조건
 * @param params WHERE 절 파라미터
 * @returns 수정된 행의 수
 */
export function update(table: string, data: Record<string, unknown>, where: string, params: Array<string | number> = []): number {
  const set = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), ...params];
  const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...values) as RunResult;
  return result.changes;
}

/**
 * 데이터를 삭제하는 함수
 * @param table 테이블 이름
 * @param where WHERE 절 조건
 * @param params WHERE 절 파라미터
 * @returns 삭제된 행의 수
 */
export function remove(table: string, where: string, params: Array<string | number> = []): number {
  const sql = `DELETE FROM ${table} WHERE ${where}`;
  const stmt = getDb().prepare(sql);
  const result = stmt.run(...params) as RunResult;
  return result.changes;
}

/**
 * 트랜잭션을 실행하는 함수
 * @param callback 트랜잭션 내에서 실행할 콜백 함수
 * @returns 콜백 함수의 반환값
 */
export function transaction<T>(callback: (db: Database.Database) => T): T {
  const db = getDb();
  try {
    db.exec('BEGIN');
    const result = callback(db);
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// 데이터베이스 유틸리티 객체
const dbUtils = {
  connect,
  close,
  query,
  queryOne,
  queryWithPagination,
  insert,
  update,
  remove,
  transaction,
};

export default dbUtils;

import db from './db';
import { type Statement } from 'better-sqlite3';

/**
 * 쿼리 실행 및 결과 반환
 * @param sql SQL 쿼리
 * @param params 쿼리 매개변수
 * @returns 쿼리 실행 결과
 */
export function executeQuery<T = any>(sql: string, params: any = {}): T[] {
  try {
    const stmt: Statement = db.prepare(sql);
    return stmt.all(params) as T[];
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    throw error;
  }
}

/**
 * 단일 레코드 조회
 * @param sql SQL 쿼리
 * @param params 쿼리 매개변수
 * @returns 단일 레코드 또는 null
 */
export function getRecord<T = any>(sql: string, params: any = {}): T | null {
  try {
    const stmt: Statement = db.prepare(sql);
    return stmt.get(params) as T || null;
  } catch (error) {
    console.error('단일 레코드 조회 오류:', error);
    throw error;
  }
}

/**
 * 새 레코드 삽입
 * @param table 테이블 이름
 * @param data 삽입할 데이터
 * @returns 삽입된 레코드의 ID
 */
export function insert(table: string, data: Record<string, any>): number {
  try {
    const keys = Object.keys(data);
    const placeholders = keys.map(key => `:${key}`).join(', ');
    const columns = keys.join(', ');
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);
    const result = stmt.run(data);
    
    return result.lastInsertRowid as number;
  } catch (error) {
    console.error('데이터 삽입 오류:', error);
    throw error;
  }
}

/**
 * 레코드 업데이트
 * @param table 테이블 이름
 * @param id 레코드 ID
 * @param data 업데이트할 데이터
 * @param idField ID 필드 이름 (기본값: id)
 * @returns 영향받은 행 수
 */
export function update(table: string, id: number | string, data: Record<string, any>, idField: string = 'id'): number {
  try {
    const setClause = Object.keys(data)
      .map(key => `${key} = :${key}`)
      .join(', ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${idField} = :id`;
    const stmt = db.prepare(sql);
    const result = stmt.run({ ...data, id });
    
    return result.changes;
  } catch (error) {
    console.error('데이터 업데이트 오류:', error);
    throw error;
  }
}

/**
 * 레코드 삭제
 * @param table 테이블 이름
 * @param id 레코드 ID
 * @param idField ID 필드 이름 (기본값: id)
 * @returns 영향받은 행 수
 */
export function deleteRecord(table: string, id: number | string, idField: string = 'id'): number {
  try {
    const sql = `DELETE FROM ${table} WHERE ${idField} = :id`;
    const stmt = db.prepare(sql);
    const result = stmt.run({ id });
    
    return result.changes;
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    throw error;
  }
}

/**
 * 트랜잭션 처리
 * @param callback 트랜잭션 내에서 실행할 콜백 함수
 * @returns 콜백 함수의 반환값
 */
export function transaction<T>(callback: () => T): T {
  const transactionFn = db.transaction(callback);
  return transactionFn();
}

/**
 * 페이지네이션 적용 쿼리 실행
 * @param sql 기본 SQL 쿼리
 * @param page 페이지 번호 (1부터 시작)
 * @param pageSize 페이지 크기
 * @param params 추가 쿼리 매개변수
 * @returns 페이지네이션이 적용된 결과와 총 개수
 */
export async function getPaginatedData<T = any>(
  sql: string,
  page: number = 1,
  pageSize: number = 10,
  params: any = {}
): Promise<{ data: T[]; total: number; page: number; pageSize: number; pageCount: number }> {
  // 총 개수를 조회하기 위한 쿼리 생성
  const countSql = `SELECT COUNT(*) as total FROM (${sql.replace(/SELECT .* FROM/i, 'SELECT 1 FROM')})`;
  
  // 페이지네이션 적용을 위한 LIMIT, OFFSET 추가
  const offset = (page - 1) * pageSize;
  const paginatedSql = `${sql} LIMIT ${pageSize} OFFSET ${offset}`;
  
  try {
    // 총 개수 조회
    const totalResult = getRecord<{ total: number }>(countSql, params);
    const total = totalResult ? totalResult.total : 0;
    
    // 데이터 조회
    const data = executeQuery<T>(paginatedSql, params);
    
    // 전체 페이지 수 계산
    const pageCount = Math.ceil(total / pageSize);
    
    return {
      data,
      total,
      page,
      pageSize,
      pageCount
    };
  } catch (error) {
    console.error('페이지네이션 데이터 조회 오류:', error);
    throw error;
  }
}

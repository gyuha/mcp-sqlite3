import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getPaginatedData, getRecord, insert, transaction } from '@/lib/db-utils';
import { CustomerFilterParams, NewCustomer } from '@/types/customer';

export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    
    // 필터링 및 정렬 매개변수 추출
    const filters: CustomerFilterParams = {
      name: searchParams.get('name') || undefined,
      email: searchParams.get('email') || undefined,
      active: searchParams.has('active') ? searchParams.get('active') === 'true' : undefined,
      storeId: searchParams.has('storeId') ? Number(searchParams.get('storeId')) : undefined,
      sortBy: searchParams.get('sortBy') || 'last_name',
      sortDirection: searchParams.get('sortDirection') === 'desc' ? 'desc' : 'asc',
    };
    
    // 페이지네이션 파라미터 추출
    const page = searchParams.has('page') ? Math.max(1, Number(searchParams.get('page'))) : 1;
    const pageSize = searchParams.has('pageSize') ? Math.min(100, Math.max(1, Number(searchParams.get('pageSize')))) : 10;
    
    // 기본 SQL 쿼리 구성
    let sql = `
      SELECT 
        c.customer_id, 
        c.store_id, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.address_id, 
        c.active, 
        c.create_date, 
        c.last_update,
        a.address,
        a.address2,
        a.district,
        a.postal_code,
        a.phone,
        ci.city as city_name,
        co.country as country_name,
        (
          SELECT COUNT(*) 
          FROM rental r 
          WHERE r.customer_id = c.customer_id
        ) as rental_count,
        (
          SELECT COALESCE(SUM(p.amount), 0) 
          FROM payment p 
          WHERE p.customer_id = c.customer_id
        ) as total_payments
      FROM customer c
      JOIN address a ON c.address_id = a.address_id
      JOIN city ci ON a.city_id = ci.city_id
      JOIN country co ON ci.country_id = co.country_id
    `;
    
    // 필터 조건 추가를 위한 WHERE 절과 매개변수
    const whereConditions: string[] = [];
    const sqlParams: Record<string, any> = {};
    
    // 이름 검색 (first_name 또는 last_name)
    if (filters.name) {
      whereConditions.push("(c.first_name LIKE :name OR c.last_name LIKE :name)");
      sqlParams.name = `%${filters.name}%`;
    }
    
    // 이메일 검색
    if (filters.email) {
      whereConditions.push("c.email LIKE :email");
      sqlParams.email = `%${filters.email}%`;
    }
    
    // 활성 상태 필터링
    if (filters.active !== undefined) {
      whereConditions.push("c.active = :active");
      sqlParams.active = filters.active ? 1 : 0;
    }
    
    // 스토어 필터링
    if (filters.storeId) {
      whereConditions.push("c.store_id = :storeId");
      sqlParams.storeId = filters.storeId;
    }
    
    // WHERE 절 추가
    if (whereConditions.length > 0) {
      sql += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // 정렬 추가
    const validSortColumns = ['last_name', 'first_name', 'email', 'create_date', 'rental_count', 'total_payments'];
    const sortColumn = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'last_name';
    sql += ` ORDER BY ${sortColumn} ${filters.sortDirection === 'desc' ? 'DESC' : 'ASC'}`;
    
    // 페이지네이션을 적용하여 데이터 조회
    const result = await getPaginatedData(sql, page, pageSize, sqlParams);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('고객 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '고객 목록을 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json() as NewCustomer;
    
    // 필수 필드 검증
    const requiredFields = ['store_id', 'first_name', 'last_name', 'email', 'address', 'district', 'city_id', 'phone'];
    
    for (const field of requiredFields) {
      if (!data[field as keyof NewCustomer]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        );
      }
    }
    
    // 트랜잭션으로 주소와 고객 정보 저장
    const customerId = transaction(() => {
      // 1. 주소 정보 저장
      const addressData = {
        address: data.address,
        address2: data.address2 || null,
        district: data.district,
        city_id: data.city_id,
        postal_code: data.postal_code || null,
        phone: data.phone,
        last_update: new Date().toISOString()
      };
      
      const addressId = insert('address', addressData);
      
      // 2. 고객 정보 저장
      const customerData = {
        store_id: data.store_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        address_id: addressId,
        active: data.active !== undefined ? (data.active ? 1 : 0) : 1,
        create_date: new Date().toISOString(),
        last_update: new Date().toISOString()
      };
      
      const customerId = insert('customer', customerData);
      return customerId;
    });
    
    // 생성된 고객 정보 조회
    const newCustomerSql = `
      SELECT 
        c.customer_id, 
        c.store_id, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.address_id, 
        c.active, 
        c.create_date, 
        c.last_update,
        a.address,
        a.address2,
        a.district,
        a.postal_code,
        a.phone,
        ci.city as city_name,
        co.country as country_name
      FROM customer c
      JOIN address a ON c.address_id = a.address_id
      JOIN city ci ON a.city_id = ci.city_id
      JOIN country co ON ci.country_id = co.country_id
      WHERE c.customer_id = :customerId
    `;
    
    const newCustomer = getRecord(newCustomerSql, { customerId });
    
    return NextResponse.json({ 
      message: '고객이 성공적으로 생성되었습니다.',
      customer: newCustomer 
    }, { status: 201 });
  } catch (error: any) {
    console.error('고객 생성 오류:', error);
    return NextResponse.json(
      { error: '고객 정보를 생성하는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

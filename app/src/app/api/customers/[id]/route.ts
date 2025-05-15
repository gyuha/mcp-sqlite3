import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, getRecord, update, transaction } from '@/lib/db-utils';
import { CustomerWithDetails } from '@/types/customer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: '유효하지 않은 고객 ID입니다.' },
        { status: 400 }
      );
    }

    // 고객 기본 정보와 주소 정보 조회
    const customerSql = `
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
        a.city_id,
        a.postal_code,
        a.phone,
        a.last_update as address_last_update,
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
      WHERE c.customer_id = :customerId
    `;

    const customer = getRecord<CustomerWithDetails>(customerSql, { customerId });

    if (!customer) {
      return NextResponse.json(
        { error: '고객을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 고객의 최근 대여 기록 조회
    const rentalSql = `
      SELECT 
        r.rental_id,
        r.rental_date,
        r.return_date,
        f.film_id,
        f.title,
        f.rental_rate,
        p.amount as payment_amount,
        p.payment_date
      FROM rental r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN film f ON i.film_id = f.film_id
      LEFT JOIN payment p ON r.rental_id = p.rental_id
      WHERE r.customer_id = :customerId
      ORDER BY r.rental_date DESC
      LIMIT 10
    `;

    const rentals = executeQuery(rentalSql, { customerId });

    // 고객의 총 결제 통계 조회
    const paymentStatsSql = `
      SELECT 
        COUNT(*) as payment_count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount,
        MAX(payment_date) as last_payment_date
      FROM payment
      WHERE customer_id = :customerId
    `;

    const paymentStats = getRecord(paymentStatsSql, { customerId });

    // 고객 응답 데이터 생성
    const customerData = {
      ...customer,
      rentals,
      payments: paymentStats,
    };

    return NextResponse.json(customerData);
  } catch (error: any) {
    console.error('고객 상세 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '고객 정보를 불러오는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: '유효하지 않은 고객 ID입니다.' },
        { status: 400 }
      );
    }

    // 고객 존재 여부 확인
    const customerCheckSql = `
      SELECT customer_id, address_id 
      FROM customer 
      WHERE customer_id = :customerId
    `;
    const existingCustomer = getRecord<{ customer_id: number; address_id: number }>(
      customerCheckSql, 
      { customerId }
    );

    if (!existingCustomer) {
      return NextResponse.json(
        { error: '고객을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const data = await request.json();
    
    // 트랜잭션으로 고객 정보와 주소 정보 업데이트
    transaction(() => {
      // 1. 고객 정보 업데이트
      const customerData: Record<string, any> = {};
      
      if (data.first_name !== undefined) customerData.first_name = data.first_name;
      if (data.last_name !== undefined) customerData.last_name = data.last_name;
      if (data.email !== undefined) customerData.email = data.email;
      if (data.store_id !== undefined) customerData.store_id = data.store_id;
      if (data.active !== undefined) customerData.active = data.active ? 1 : 0;
      
      if (Object.keys(customerData).length > 0) {
        customerData.last_update = new Date().toISOString();
        update('customer', customerId, customerData, 'customer_id');
      }
      
      // 2. 주소 정보 업데이트
      const addressData: Record<string, any> = {};
      
      if (data.address !== undefined) addressData.address = data.address;
      if (data.address2 !== undefined) addressData.address2 = data.address2;
      if (data.district !== undefined) addressData.district = data.district;
      if (data.city_id !== undefined) addressData.city_id = data.city_id;
      if (data.postal_code !== undefined) addressData.postal_code = data.postal_code;
      if (data.phone !== undefined) addressData.phone = data.phone;
      
      if (Object.keys(addressData).length > 0) {
        addressData.last_update = new Date().toISOString();
        update('address', existingCustomer.address_id, addressData, 'address_id');
      }
    });

    // 업데이트된 고객 정보 조회
    const updatedCustomerSql = `
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
        a.city_id,
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

    const updatedCustomer = getRecord(updatedCustomerSql, { customerId });

    return NextResponse.json({
      message: '고객 정보가 성공적으로 업데이트되었습니다.',
      customer: updatedCustomer
    });
  } catch (error: any) {
    console.error('고객 정보 업데이트 오류:', error);
    return NextResponse.json(
      { error: '고객 정보를 업데이트하는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: '유효하지 않은 고객 ID입니다.' },
        { status: 400 }
      );
    }

    // 해당 고객이 존재하는지 확인
    const customerCheckSql = `
      SELECT customer_id 
      FROM customer 
      WHERE customer_id = :customerId
    `;
    const existingCustomer = getRecord(customerCheckSql, { customerId });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: '고객을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 고객이 활성 대여 중인지 확인
    const activeRentalsSql = `
      SELECT COUNT(*) as count 
      FROM rental 
      WHERE customer_id = :customerId AND return_date IS NULL
    `;
    const activeRentals = getRecord<{ count: number }>(activeRentalsSql, { customerId });

    if (activeRentals && activeRentals.count > 0) {
      return NextResponse.json(
        { error: '이 고객은 아직 반납하지 않은 대여 항목이 있어 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 직접 삭제하지 않고 비활성화 처리
    const deactivateSql = `
      UPDATE customer
      SET active = 0, last_update = :lastUpdate
      WHERE customer_id = :customerId
    `;
    
    executeQuery(deactivateSql, { 
      customerId, 
      lastUpdate: new Date().toISOString() 
    });

    return NextResponse.json({
      message: '고객이 성공적으로 비활성화되었습니다.'
    });
  } catch (error: any) {
    console.error('고객 삭제 오류:', error);
    return NextResponse.json(
      { error: '고객을 삭제하는 중 오류가 발생했습니다.', details: error.message },
      { status: 500 }
    );
  }
}

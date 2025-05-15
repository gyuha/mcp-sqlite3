'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { RentalWithDetails } from '@/types/rental';
import { formatDate, formatCurrency } from '@/lib/format-utils';

export default function RentalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rental, setRental] = useState<RentalWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [returningRental, setReturningRental] = useState(false);
  const [returnMessage, setReturnMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchRentalDetails = async () => {
      try {
        const response = await fetch(`/api/rentals/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`대여 정보를 가져오는데 실패했습니다: ${response.status}`);
        }
        
        const data = await response.json();
        setRental(data);
      } catch (err: any) {
        console.error('대여 상세 정보 조회 오류:', err);
        setError(err.message || '대여 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRentalDetails();
    }
  }, [params.id]);

  const handleReturn = async () => {
    if (!rental || rental.return_date) return;

    try {
      setReturningRental(true);
      setReturnMessage(null);
      
      const response = await fetch(`/api/rentals/${rental.rental_id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || '반납 처리 중 오류가 발생했습니다.');
      }
      
      // 반납 성공 후 대여 정보 업데이트
      setRental({
        ...rental,
        ...result,
        return_date: new Date().toISOString()
      });
      
      setReturnMessage({
        type: 'success',
        text: `반납이 완료되었습니다. ${result.late_fee > 0 ? `연체료: ${formatCurrency(result.late_fee)}` : '연체료가 없습니다.'}`
      });
    } catch (err: any) {
      console.error('반납 처리 오류:', err);
      setReturnMessage({
        type: 'error',
        text: err.message || '반납 처리 중 오류가 발생했습니다.'
      });
    } finally {
      setReturningRental(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </main>
    );
  }

  if (error || !rental) {
    return (
      <main className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || '대여 정보를 찾을 수 없습니다.'}</p>
          <button 
            onClick={() => router.push('/rentals')}
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            대여 목록으로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  const isReturned = !!rental.return_date;
  const rentalStatus = isReturned ? '반납됨' : '대여중';
  const statusColor = isReturned ? 'text-green-600' : 'text-amber-600';

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">대여 상세 정보</h1>
        <Link href="/rentals" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          목록으로 돌아가기
        </Link>
      </div>

      {returnMessage && (
        <div className={`p-4 mb-4 rounded ${returnMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {returnMessage.text}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">대여 정보</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-semibold">대여 ID:</div>
              <div>{rental.rental_id}</div>
              
              <div className="font-semibold">대여 일자:</div>
              <div>{formatDate(rental.rental_date)}</div>
              
              <div className="font-semibold">반납 예정일:</div>
              <div>{formatDate(rental.expected_return_date)}</div>
              
              <div className="font-semibold">실제 반납일:</div>
              <div>{rental.return_date ? formatDate(rental.return_date) : '-'}</div>
              
              <div className="font-semibold">상태:</div>
              <div className={`font-bold ${statusColor}`}>{rentalStatus}</div>
              
              <div className="font-semibold">대여 비용:</div>
              <div>{formatCurrency(rental.rental_fee)}</div>
              
              {rental.late_fee > 0 && (
                <>
                  <div className="font-semibold">연체료:</div>
                  <div className="text-red-600">{formatCurrency(rental.late_fee)}</div>
                </>
              )}
            </div>

            {!isReturned && (
              <button
                onClick={handleReturn}
                disabled={returningRental}
                className="mt-6 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {returningRental ? '처리 중...' : '반납 처리하기'}
              </button>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">영화 및 고객 정보</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="font-semibold">영화 제목:</div>
              <div>
                <Link href={`/films/${rental.film_id}`} className="text-blue-600 hover:underline">
                  {rental.film_title}
                </Link>
              </div>
              
              <div className="font-semibold">카테고리:</div>
              <div>{rental.category_name}</div>
              
              <div className="font-semibold">등급:</div>
              <div>{rental.film_rating}</div>
              
              <div className="font-semibold">대여 기간:</div>
              <div>{rental.rental_duration}일</div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2 pb-1 border-b">고객 정보</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="font-semibold">고객명:</div>
                <div>
                  <Link href={`/customers/${rental.customer_id}`} className="text-blue-600 hover:underline">
                    {rental.customer_name}
                  </Link>
                </div>
                
                <div className="font-semibold">이메일:</div>
                <div>{rental.customer_email}</div>
                
                <div className="font-semibold">매장:</div>
                <div>{rental.store_name}</div>
                
                <div className="font-semibold">직원:</div>
                <div>{rental.staff_name}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

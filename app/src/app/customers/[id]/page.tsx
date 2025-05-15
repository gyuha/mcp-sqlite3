'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CustomerWithDetails } from '@/types/customer';
import { 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  FilmIcon,
  PencilSquareIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/customers/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('고객을 찾을 수 없습니다.');
          } else {
            throw new Error('고객 정보를 불러오는데 실패했습니다.');
          }
        }
        
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id !== 'new') {
      fetchCustomer();
    }
  }, [id]);

  // 고객 삭제(비활성화) 처리 함수
  const handleDeleteCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('고객 삭제에 실패했습니다.');
      }
      
      // 삭제 성공 후 목록 페이지로 이동
      router.push('/customers');
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setIsDeleteModalOpen(false);
    }
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 에러 표시
  if (error || !customer) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error || '고객 정보를 불러올 수 없습니다.'}</p>
          <button 
            onClick={() => router.push('/customers')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            고객 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 고객 상세 정보 렌더링
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 링크 */}
      <div className="mb-6">
        <Link href="/customers" className="text-blue-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          고객 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* 고객 헤더 */}
        <div className="relative p-6 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold mr-3">{customer.first_name} {customer.last_name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {customer.active ? '활성' : '비활성'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">고객 ID: {customer.customer_id}</p>
          </div>
          
          <div className="flex mt-4 sm:mt-0">
            <Link href={`/customers/${customer.customer_id}/edit`}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <PencilSquareIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              수정
            </Link>
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
              <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
              삭제
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">기본 정보</h2>
              
              <div className="space-y-3">
                {customer.email && (
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span>{customer.email}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span>매장 ID: {customer.store_id}</span>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span>가입일: {new Date(customer.create_date).toLocaleDateString('ko-KR')}</span>
                </div>
                
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span>마지막 업데이트: {new Date(customer.last_update).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>
            
            {/* 주소 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">주소 정보</h2>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p>{customer.address.address}</p>
                    {customer.address.address2 && <p>{customer.address.address2}</p>}
                    <p>{customer.address.district}, {customer.address.city_name}, {customer.address.country_name}</p>
                    {customer.address.postal_code && <p>우편번호: {customer.address.postal_code}</p>}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span>{customer.address.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 통계 정보 섹션 */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">통계 정보</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FilmIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">총 대여 횟수</p>
                    <p className="text-xl font-semibold">{customer.rental_count}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">총 결제 금액</p>
                    <p className="text-xl font-semibold">${customer.total_payments?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              {customer.payments && (
                <>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">결제 횟수</p>
                        <p className="text-xl font-semibold">{customer.payments.payment_count}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">평균 결제 금액</p>
                        <p className="text-xl font-semibold">${Number(customer.payments.avg_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* 최근 대여 기록 */}
          {customer.rentals && customer.rentals.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">최근 대여 기록</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영화 제목</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여일</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반납일</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여 요금</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">결제 금액</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.rentals.map((rental) => (
                      <tr key={rental.rental_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/films/${rental.film_id}`} className="text-blue-600 hover:underline">
                            {rental.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(rental.rental_date).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {rental.return_date 
                            ? new Date(rental.return_date).toLocaleDateString('ko-KR')
                            : <span className="text-yellow-600 font-medium">미반납</span>
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${rental.rental_rate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {rental.payment_amount
                            ? `$${rental.payment_amount}`
                            : <span className="text-gray-400">-</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">고객 삭제</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        이 고객을 삭제하시겠습니까? 이 작업은 고객 계정을 비활성화하고 되돌릴 수 없습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteCustomer}>
                  삭제
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDeleteModalOpen(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

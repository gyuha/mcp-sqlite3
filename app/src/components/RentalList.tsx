'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { RentalWithDetails } from '@/types/rental';
import { formatDate } from '@/lib/format-utils';
import { getRentalSummary } from '@/lib/rental-utils';

interface RentalListProps {
  rentals: RentalWithDetails[];
  onReturnRental?: (rentalId: number) => Promise<void>;
  showActions?: boolean;
}

export default function RentalList({ 
  rentals, 
  onReturnRental,
  showActions = true
}: RentalListProps) {
  const [processingRentalId, setProcessingRentalId] = useState<number | null>(null);
  
  const handleReturnClick = async (rentalId: number) => {
    if (!onReturnRental) return;
    
    try {
      setProcessingRentalId(rentalId);
      await onReturnRental(rentalId);
    } finally {
      setProcessingRentalId(null);
    }
  };
  
  // 상태에 따른 배지 렌더링
  const renderStatusBadge = (rental: RentalWithDetails) => {
    if (rental.return_date) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          반납됨
        </span>
      );
    } else if (rental.overdue) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          연체
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="w-4 h-4 mr-1" />
          대여 중
        </span>
      );
    }
  };
  
  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">영화</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">대여일</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">반납(예정)일</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연체료</th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rentals.map((rental) => {
            // 대여 정보 요약 계산
            const rentalSummary = getRentalSummary(
              rental.rental_date,
              rental.return_date,
              rental.rental_duration || 3, // 기본값 3일
              rental.film_rental_rate
            );
            
            return (
              <tr key={rental.rental_id} className={rental.overdue && !rental.return_date ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rental.rental_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600 hover:underline">
                    <Link href={`/films/${rental.film_id}`}>
                      {rental.film_title}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {rental.film_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-blue-600 hover:underline">
                    <Link href={`/customers/${rental.customer_id}`}>
                      {rental.customer_name}
                    </Link>
                  </div>
                  <div className="text-xs text-gray-500">
                    {rental.customer_email || '이메일 없음'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(new Date(rental.rental_date))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {rental.return_date ? 
                    formatDate(new Date(rental.return_date)) : 
                    rentalSummary.formattedDueDate
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(rental)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {rental.overdue && !rental.return_date ? (
                    <div>
                      <div className="text-sm font-medium text-red-600">
                        ${rental.late_fee?.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({rental.days_overdue || rentalSummary.daysOverdue}일 연체)
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                {showActions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/rentals/${rental.rental_id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                      상세
                    </Link>
                    
                    {!rental.return_date && onReturnRental && (
                      <button
                        onClick={() => handleReturnClick(rental.rental_id)}
                        disabled={processingRentalId === rental.rental_id}
                        className="text-green-600 hover:text-green-900 disabled:text-green-300"
                      >
                        {processingRentalId === rental.rental_id ? '처리 중...' : '반납'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

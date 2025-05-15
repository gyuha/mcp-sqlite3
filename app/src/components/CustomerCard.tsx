import { Customer } from '@/types/customer';
import Link from 'next/link';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface CustomerCardProps {
  customer: Customer & { 
    city_name?: string;
    country_name?: string;
    address?: string; 
    address2?: string | null;
    district?: string;
    postal_code?: string | null;
    phone?: string;
    rental_count?: number;
    total_payments?: number;
  };
}

const CustomerCard = ({ customer }: CustomerCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/customers/${customer.customer_id}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">
                {customer.first_name} {customer.last_name}
              </h3>
              <p className="text-gray-600 text-sm">
                고객 ID: {customer.customer_id}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {customer.active ? '활성' : '비활성'}
            </span>
          </div>

          {customer.email && (
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}

          {customer.phone && (
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>{customer.phone}</span>
            </div>
          )}

          {(customer.city_name || customer.address) && (
            <div className="flex items-start mb-2 text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">
                {customer.address}
                {customer.district && `, ${customer.district}`}
                {customer.city_name && `, ${customer.city_name}`}
              </span>
            </div>
          )}

          {(customer.rental_count !== undefined || customer.total_payments !== undefined) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
              {customer.rental_count !== undefined && (
                <div>
                  <p className="text-xs text-gray-500">총 대여 수</p>
                  <p className="text-base font-medium">{customer.rental_count}</p>
                </div>
              )}
              {customer.total_payments !== undefined && (
                <div>
                  <p className="text-xs text-gray-500">총 결제액</p>
                  <p className="text-base font-medium">${customer.total_payments?.toFixed(2)}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default CustomerCard;

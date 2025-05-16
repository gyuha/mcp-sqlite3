'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CustomerWithDetails } from '@/types/customer';

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [customer, setCustomer] = useState<CustomerWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    address2: '',
    district: '',
    city_id: '',
    postal_code: '',
    phone: '',
    active: true,
    store_id: ''
  });
  
  const [cities, setCities] = useState<Array<{ city_id: number, city: string, country: string }>>([]);
  const [stores, setStores] = useState<Array<{ store_id: number, address: string }>>([]);
  
  // 고객 정보 로드
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
        
        // 폼 초기값 설정
        setFormValues({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          address: data.address?.address || '',
          address2: data.address?.address2 || '',
          district: data.address?.district || '',
          city_id: data.address?.city_id?.toString() || '',
          postal_code: data.address?.postal_code || '',
          phone: data.address?.phone || '',
          active: data.active || false,
          store_id: data.store_id?.toString() || ''
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCitiesAndStores = async () => {
      try {
        // 도시 목록 가져오기
        const citiesResponse = await fetch('/api/cities');
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData.data || []);
        }
        
        // 매장 목록 가져오기
        const storesResponse = await fetch('/api/stores');
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData.data || []);
        }
      } catch (err) {
        console.error('참조 데이터 로드 오류:', err);
      }
    };
    
    fetchCustomer();
    fetchCitiesAndStores();
  }, [id]);
  
  // 폼 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormValues(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // API 호출을 위한 데이터 준비
      const customerData = {
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        email: formValues.email,
        address: formValues.address,
        address2: formValues.address2 || null,
        district: formValues.district,
        city_id: parseInt(formValues.city_id),
        postal_code: formValues.postal_code || null,
        phone: formValues.phone,
        active: formValues.active,
        store_id: parseInt(formValues.store_id)
      };
      
      // 고객 정보 업데이트
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customerData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '고객 정보 수정 중 오류가 발생했습니다.');
      }
      
      // 성공시 상세 페이지로 이동
      router.push(`/customers/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !customer) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md">
          <h2 className="text-lg font-semibold mb-2">오류 발생</h2>
          <p>{error}</p>
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 뒤로가기 링크 */}
      <div className="mb-6">
        <Link href={`/customers/${id}`} className="text-blue-600 hover:underline flex items-center">
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          고객 상세로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 bg-gray-50 border-b">
          <h1 className="text-2xl font-bold">고객 정보 수정</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 기본 정보 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">기본 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formValues.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">성 *</label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formValues.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="store_id" className="block text-sm font-medium text-gray-700 mb-1">담당 매장 *</label>
                  <select
                    id="store_id"
                    name="store_id"
                    value={formValues.store_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">매장 선택</option>
                    {stores.map(store => (
                      <option key={store.store_id} value={store.store_id}>
                        {store.address}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formValues.active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    계정 활성화
                  </label>
                </div>
              </div>
            </div>
            
            {/* 주소 정보 섹션 */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b pb-2">주소 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">주소 *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="address2" className="block text-sm font-medium text-gray-700 mb-1">상세 주소</label>
                  <input
                    type="text"
                    id="address2"
                    name="address2"
                    value={formValues.address2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">지역 *</label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formValues.district}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="city_id" className="block text-sm font-medium text-gray-700 mb-1">도시 *</label>
                  <select
                    id="city_id"
                    name="city_id"
                    value={formValues.city_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">도시 선택</option>
                    {cities.map(city => (
                      <option key={city.city_id} value={city.city_id}>
                        {city.city}, {city.country}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">우편번호</label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={formValues.postal_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">전화번호 *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Link href={`/customers/${id}`}
              className="mr-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Film } from '@/types/film';
import { Customer } from '@/types/customer';
import { NewRental, Inventory } from '@/types/rental';

interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  store_id: number;
}

interface Store {
  store_id: number;
  address: string;
  city: string;
}

export default function NewRentalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 선택한 데이터 상태 관리
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);

  // 검색어 상태 관리
  const [filmSearchQuery, setFilmSearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // 목록 데이터 관리
  const [films, setFilms] = useState<Film[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);

  useEffect(() => {
    // 초기 데이터 로드
    const fetchInitialData = async () => {
      try {
        // 매장 정보 로드
        const storesResponse = await fetch('/api/stores');
        if (storesResponse.ok) {
          const storesData = await storesResponse.json();
          setStores(storesData.data || []);
          
          if (storesData.data && storesData.data.length > 0) {
            setSelectedStore(storesData.data[0]);
          }
        }
        
        // 직원 정보 로드
        const staffResponse = await fetch('/api/staff');
        if (staffResponse.ok) {
          const staffData = await staffResponse.json();
          setStaffMembers(staffData.data || []);
          
          if (staffData.data && staffData.data.length > 0) {
            setSelectedStaff(staffData.data[0]);
          }
        }
      } catch (err) {
        console.error('초기 데이터 로딩 오류:', err);
        setError('초기 데이터를 불러오는데 실패했습니다. 페이지를 새로고침해주세요.');
      }
    };

    fetchInitialData();
  }, []);

  // 영화 검색 처리
  useEffect(() => {
    const searchFilms = async () => {
      if (filmSearchQuery.trim().length < 1) {
        setFilms([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/films/search?query=${encodeURIComponent(filmSearchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setFilms(data.data || []);
        } else {
          setFilms([]);
        }
      } catch (err) {
        console.error('영화 검색 오류:', err);
        setFilms([]);
      }
    };

    const debounceTimeout = setTimeout(searchFilms, 500);
    return () => clearTimeout(debounceTimeout);
  }, [filmSearchQuery]);

  // 고객 검색 처리
  useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearchQuery.trim().length < 1) {
        setCustomers([]);
        return;
      }
      
      try {
        const response = await fetch(`/api/customers/search?query=${encodeURIComponent(customerSearchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.data || []);
        } else {
          setCustomers([]);
        }
      } catch (err) {
        console.error('고객 검색 오류:', err);
        setCustomers([]);
      }
    };

    const debounceTimeout = setTimeout(searchCustomers, 500);
    return () => clearTimeout(debounceTimeout);
  }, [customerSearchQuery]);

  // 영화 재고 정보 가져오기
  useEffect(() => {
    const fetchInventories = async () => {
      if (!selectedFilm || !selectedStore) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/inventory/available?filmId=${selectedFilm.film_id}&storeId=${selectedStore.store_id}`);
        
        if (response.ok) {
          const data = await response.json();
          setInventories(data.data || []);
          
          // 자동으로 첫 번째 재고 항목 선택
          if (data.data && data.data.length > 0) {
            setSelectedInventory(data.data[0]);
          } else {
            setSelectedInventory(null);
            setError('선택한 매장에 해당 영화의 대여 가능한 재고가 없습니다.');
          }
        } else {
          setError('재고 정보를 불러오는데 실패했습니다.');
          setInventories([]);
          setSelectedInventory(null);
        }
      } catch (err) {
        console.error('재고 정보 조회 오류:', err);
        setError('재고 정보를 불러오는데 실패했습니다.');
        setInventories([]);
        setSelectedInventory(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedFilm && selectedStore) {
      fetchInventories();
    }
  }, [selectedFilm, selectedStore]);

  // 영화 선택 핸들러
  const handleSelectFilm = (film: Film) => {
    setSelectedFilm(film);
    setFilmSearchQuery(''); // 검색창 초기화
    setFilms([]); // 검색 결과 초기화
    setError(null); // 오류 메시지 초기화
  };

  // 고객 선택 핸들러
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearchQuery(''); // 검색창 초기화
    setCustomers([]); // 검색 결과 초기화
    setError(null); // 오류 메시지 초기화
  };

  // 매장 선택 핸들러
  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const storeId = parseInt(e.target.value);
    const store = stores.find(s => s.store_id === storeId);
    if (store) {
      setSelectedStore(store);
      
      // 매장에 근무하는 직원 필터링
      const storeStaff = staffMembers.filter(staff => staff.store_id === storeId);
      if (storeStaff.length > 0) {
        setSelectedStaff(storeStaff[0]);
      } else {
        setSelectedStaff(null);
      }
      
      setSelectedInventory(null); // 재고 선택 초기화
    }
  };

  // 직원 선택 핸들러
  const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const staffId = parseInt(e.target.value);
    const staff = staffMembers.find(s => s.staff_id === staffId);
    if (staff) {
      setSelectedStaff(staff);
    }
  };

  // 재고 선택 핸들러
  const handleInventoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const inventoryId = parseInt(e.target.value);
    const inventory = inventories.find(i => i.inventory_id === inventoryId);
    if (inventory) {
      setSelectedInventory(inventory);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInventory || !selectedCustomer || !selectedStaff) {
      setError('모든 필수 정보를 선택해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const newRental: NewRental = {
        inventory_id: selectedInventory.inventory_id,
        customer_id: selectedCustomer.customer_id,
        staff_id: selectedStaff.staff_id
      };
      
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRental),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '대여 등록 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      setSuccess('영화 대여가 성공적으로 등록되었습니다.');
      
      // 3초 후 대여 목록 페이지로 이동
      setTimeout(() => {
        router.push(`/rentals/${result.rental.rental_id}`);
      }, 3000);
    } catch (err) {
      console.error('대여 등록 오류:', err);
      setError(err instanceof Error ? err.message : '대여 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">신규 영화 대여</h1>
        <Link href="/rentals" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          대여 목록으로
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p>{success}</p>
          <p className="mt-2 text-sm">곧 대여 상세 페이지로 이동합니다...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 영화 검색 및 선택 */}
          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">영화 선택</h2>
            <div className="mb-4">
              <label htmlFor="filmSearch" className="block text-sm font-medium text-gray-700 mb-1">영화 검색</label>
              <input
                type="text"
                id="filmSearch"
                value={filmSearchQuery}
                onChange={(e) => setFilmSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="영화 제목으로 검색"
              />
              
              {films.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {films.map((film) => (
                      <li 
                        key={film.film_id} 
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectFilm(film)}
                      >
                        {film.title} ({film.release_year}) - 대여료: ${film.rental_rate}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {selectedFilm && (
              <div className="mb-4 p-3 border border-blue-200 bg-blue-50 rounded-md">
                <h3 className="font-semibold">{selectedFilm.title}</h3>
                <p className="text-sm">출시년도: {selectedFilm.release_year}</p>
                <p className="text-sm">등급: {selectedFilm.rating}</p>
                <p className="text-sm">대여료: ${selectedFilm.rental_rate}</p>
                <p className="text-sm">대여 기간: {selectedFilm.rental_duration}일</p>
                <button 
                  type="button" 
                  onClick={() => setSelectedFilm(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  선택 취소
                </button>
              </div>
            )}

            {/* 매장 선택 */}
            <div className="mb-4">
              <label htmlFor="storeSelect" className="block text-sm font-medium text-gray-700 mb-1">매장 선택</label>
              <select
                id="storeSelect"
                value={selectedStore?.store_id || ''}
                onChange={handleStoreChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {stores.map((store) => (
                  <option key={store.store_id} value={store.store_id}>
                    {store.address}, {store.city}
                  </option>
                ))}
              </select>
            </div>

            {/* 재고 선택 */}
            {selectedFilm && selectedStore && (
              <div className="mb-4">
                <label htmlFor="inventorySelect" className="block text-sm font-medium text-gray-700 mb-1">재고 선택</label>
                {loading ? (
                  <div className="flex items-center justify-center py-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm">재고 확인 중...</span>
                  </div>
                ) : inventories.length > 0 ? (
                  <select
                    id="inventorySelect"
                    value={selectedInventory?.inventory_id || ''}
                    onChange={handleInventoryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    {inventories.map((inventory) => (
                      <option key={inventory.inventory_id} value={inventory.inventory_id}>
                        재고 ID: {inventory.inventory_id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-red-500 text-sm">대여 가능한 재고가 없습니다.</p>
                )}
              </div>
            )}
          </div>

          {/* 고객 검색 및 선택, 직원 선택 */}
          <div>
            <h2 className="text-xl font-semibold mb-4 pb-2 border-b">고객 및 직원 선택</h2>
            
            <div className="mb-4">
              <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-700 mb-1">고객 검색</label>
              <input
                type="text"
                id="customerSearch"
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="고객 이름으로 검색"
              />
              
              {customers.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <li 
                        key={customer.customer_id} 
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        {customer.first_name} {customer.last_name} ({customer.email || '이메일 없음'})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {selectedCustomer && (
              <div className="mb-4 p-3 border border-blue-200 bg-blue-50 rounded-md">
                <h3 className="font-semibold">{selectedCustomer.first_name} {selectedCustomer.last_name}</h3>
                <p className="text-sm">이메일: {selectedCustomer.email || '없음'}</p>
                <p className="text-sm">주소: {selectedCustomer.address}</p>
                <p className="text-sm">도시: {selectedCustomer.city}, {selectedCustomer.country}</p>
                <button 
                  type="button" 
                  onClick={() => setSelectedCustomer(null)}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  선택 취소
                </button>
              </div>
            )}

            {/* 직원 선택 */}
            <div className="mb-4">
              <label htmlFor="staffSelect" className="block text-sm font-medium text-gray-700 mb-1">담당 직원</label>
              <select
                id="staffSelect"
                value={selectedStaff?.staff_id || ''}
                onChange={handleStaffChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {staffMembers
                  .filter(staff => !selectedStore || staff.store_id === selectedStore.store_id)
                  .map((staff) => (
                    <option key={staff.staff_id} value={staff.staff_id}>
                      {staff.first_name} {staff.last_name}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* 대여 요약 및 제출 버튼 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">대여 요약</h3>
              <div className="p-4 bg-gray-50 rounded-md mb-4">
                <p>
                  <span className="font-medium">영화:</span> {selectedFilm ? selectedFilm.title : '선택되지 않음'}
                </p>
                <p>
                  <span className="font-medium">고객:</span> {selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : '선택되지 않음'}
                </p>
                <p>
                  <span className="font-medium">매장:</span> {selectedStore ? `${selectedStore.address}, ${selectedStore.city}` : '선택되지 않음'}
                </p>
                <p>
                  <span className="font-medium">직원:</span> {selectedStaff ? `${selectedStaff.first_name} ${selectedStaff.last_name}` : '선택되지 않음'}
                </p>
                <p>
                  <span className="font-medium">대여료:</span> {selectedFilm ? `$${selectedFilm.rental_rate}` : '-'}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading || !selectedFilm || !selectedCustomer || !selectedStaff || !selectedInventory}
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '대여 등록'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

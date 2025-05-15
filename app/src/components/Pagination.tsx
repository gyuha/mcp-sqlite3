import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  // 페이지 그룹을 표시하는 함수
  const renderPaginationButtons = () => {
    const pages = [];
    
    // 시작 페이지와 끝 페이지 계산 (최대 5개 페이지 표시)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 만약 endPage가 totalPages보다 작으면 startPage를 다시 조정
    if (endPage - startPage < 4 && startPage > 1) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // 처음 페이지 버튼
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      // 첫 페이지와 시작 페이지 사이에 간격이 있으면 생략 부호 표시
      if (startPage > 2) {
        pages.push(
          <span key="dots-1" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }
    }
    
    // 페이지 번호 버튼
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
            i === currentPage
              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          } border`}
        >
          {i}
        </button>
      );
    }
    
    // 마지막 페이지 버튼
    if (endPage < totalPages) {
      // 마지막 페이지와 끝 페이지 사이에 간격이 있으면 생략 부호 표시
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="dots-2" className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  // 페이지가 1페이지만 있으면 페이지네이션을 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }
  
  return (
    <nav className="flex justify-center mt-8" aria-label="Pagination">
      <div className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
        {/* 이전 페이지 버튼 */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium
            ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="sr-only">이전</span>
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        
        {/* 페이지 번호 */}
        {renderPaginationButtons()}
        
        {/* 다음 페이지 버튼 */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium
            ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <span className="sr-only">다음</span>
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

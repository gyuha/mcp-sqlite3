import { formatDate, formatCurrency } from './format-utils';

// 대여 상태 유형
export type RentalStatus = 'all' | 'returned' | 'outstanding' | 'overdue';

/**
 * 대여일로부터 반납 예정일 계산
 * @param rentalDate 대여일
 * @param rentalDuration 대여 기간(일)
 * @returns 반납 예정일
 */
export function calculateDueDate(rentalDate: string, rentalDuration: number): Date {
  const date = new Date(rentalDate);
  date.setDate(date.getDate() + rentalDuration);
  return date;
}

/**
 * 현재 대여 상태 확인
 * @param returnDate 반납일
 * @param dueDate 반납 예정일
 * @returns 상태 정보
 */
export function getRentalStatus(returnDate: string | null, dueDate: Date): {
  status: 'returned' | 'outstanding' | 'overdue';
  daysOverdue: number;
} {
  // 이미 반납된 대여
  if (returnDate) {
    return { status: 'returned', daysOverdue: 0 };
  }
  
  const today = new Date();
  
  // 연체 상태 확인
  if (today > dueDate) {
    // 연체일 계산 (밀리초 -> 일 변환)
    const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return { status: 'overdue', daysOverdue };
  }
  
  // 대여 중 상태
  return { status: 'outstanding', daysOverdue: 0 };
}

/**
 * 연체료 계산
 * @param daysOverdue 연체 일수
 * @param rentalRate 대여 요금
 * @returns 연체료
 */
export function calculateLateFee(daysOverdue: number, rentalRate: number): number {
  // 연체일 당 대여 요금의 일정 비율을 연체료로 계산 (예: 150%)
  return daysOverdue * (rentalRate * 1.5);
}

/**
 * 대여 상태에 따른 배지 스타일 반환
 * @param status 대여 상태
 * @returns 배지 스타일 클래스
 */
export function getRentalStatusBadgeClasses(status: 'returned' | 'outstanding' | 'overdue'): string {
  switch (status) {
    case 'returned':
      return 'bg-green-100 text-green-800';
    case 'outstanding':
      return 'bg-yellow-100 text-yellow-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 대여 상태 텍스트 반환
 * @param status 대여 상태
 * @returns 상태 텍스트
 */
export function getRentalStatusText(status: 'returned' | 'outstanding' | 'overdue'): string {
  switch (status) {
    case 'returned':
      return '반납됨';
    case 'outstanding':
      return '대여 중';
    case 'overdue':
      return '연체';
    default:
      return '알 수 없음';
  }
}

/**
 * 대여 요약 정보 반환
 * @param rentalDate 대여일
 * @param returnDate 반납일
 * @param rentalDuration 대여 기간(일)
 * @param rentalRate 대여 요금
 * @returns 요약 정보
 */
export function getRentalSummary(
  rentalDate: string,
  returnDate: string | null,
  rentalDuration: number,
  rentalRate: number
): {
  dueDate: Date;
  status: 'returned' | 'outstanding' | 'overdue';
  daysOverdue: number;
  lateFee: number;
  formattedDueDate: string;
  statusText: string;
  statusClasses: string;
} {
  const dueDate = calculateDueDate(rentalDate, rentalDuration);
  const { status, daysOverdue } = getRentalStatus(returnDate, dueDate);
  const lateFee = calculateLateFee(daysOverdue, rentalRate);
  
  return {
    dueDate,
    status,
    daysOverdue,
    lateFee,
    formattedDueDate: formatDate(dueDate),
    statusText: getRentalStatusText(status),
    statusClasses: getRentalStatusBadgeClasses(status)
  };
}

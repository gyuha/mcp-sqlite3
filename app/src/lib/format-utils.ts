/**
 * 날짜 포맷 함수
 * @param date 포맷할 날짜
 * @param options 포맷 옵션
 * @returns 포맷된 날짜 문자열
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  // 기본 한국어 날짜 포맷 (YYYY. MM. DD.)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Date(date).toLocaleDateString('ko-KR', defaultOptions);
}

/**
 * 통화 포맷 함수
 * @param amount 금액
 * @param currency 통화 코드 (기본: USD)
 * @returns 포맷된 통화 문자열
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * 전화번호 포맷 함수
 * @param phone 전화번호
 * @returns 포맷된 전화번호
 */
export function formatPhone(phone: string): string {
  // 기본 포맷 로직 (실제 요구사항에 맞게 조정 필요)
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
}

/**
 * 텍스트 길이 제한 함수
 * @param text 원본 텍스트
 * @param maxLength 최대 길이
 * @returns 제한된 텍스트
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

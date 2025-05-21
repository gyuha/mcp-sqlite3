import { QueryClient } from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 60초 동안 캐시 유지
        staleTime: 60 * 1000,
        // 캐시된 데이터가 없을 때 재시도 횟수
        retry: 1,
        // 네트워크가 다시 연결되었을 때 자동으로 재시도
        retryOnMount: true,
        // 에러 발생 시 재시도 간격 (ms)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // 윈도우가 다시 포커스되었을 때 데이터 리프레시
        refetchOnWindowFocus: true,
      },
      mutations: {
        // 낙관적 업데이트 시 재시도 횟수
        retry: 2,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버 환경: 항상 새로운 클라이언트 생성
    return makeQueryClient();
  } else {
    // 브라우저 환경: 싱글톤 패턴
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

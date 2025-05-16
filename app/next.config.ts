import type { NextConfig } from "next";
import withBundleAnalyzer from '@next/bundle-analyzer';

// 기본 Next.js 설정
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['placehold.co'],
    // 이미지 최적화 설정
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // 캐시 시간 설정 (초)
  },
  // 빌드 최적화
  swcMinify: true, // SWC 미니파이어 사용
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // 프로덕션에서는 콘솔 로그 제거
  },
  // 성능 최적화
  experimental: {
    optimizeCss: true, // CSS 최적화
    scrollRestoration: true, // 스크롤 복원 설정
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sqlite3')
    }
    
    // 번들 최적화
    config.optimization = {
      ...config.optimization,
      minimize: true,
    };
    
    return config
  },
};

// 번들 분석기 활성화 (analyze 스크립트 실행 시)
export default process.env.ANALYZE === 'true' 
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig;

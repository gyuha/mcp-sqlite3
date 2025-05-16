# Sakila 영화 대여 관리 시스템
## 시작하기

### 개발 환경 설정

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 웹 브라우저에서 `http://localhost:3000`으로 접속

### 프로덕션 배포

#### Docker를 사용한 배포

1. Docker 이미지 빌드:
```bash
docker build -t sakila-app .
```

2. Docker 컨테이너 실행:
```bash
docker run -p 3000:3000 sakila-app
```

#### Docker Compose를 사용한 배포

```bash
docker-compose up -d
```kila 데이터베이스를 활용한 Next.js 영화 대여 관리 시스템입니다.

## 프로젝트 소개

이 프로젝트는 Sakila 샘플 데이터베이스를 기반으로 한 영화 대여점 관리 시스템입니다. 다음과 같은 주요 기능을 제공합니다:

- 영화 카탈로그 브라우징 및 검색
- 고객 관리
- 대여 및 반납 관리
- 결제 관리
- 재고 관리
- 통계 및 대시보드

## 기술 스택

- **프론트엔드**: Next.js, React, Tailwind CSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: SQLite3
- **배포**: Docker, Docker Compose

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

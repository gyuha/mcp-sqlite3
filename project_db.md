# 프로젝트 계획서

## 데이터베이스 분석

이 프로젝트는 Sakila 데이터베이스를 기반으로 한 Next.js 애플리케이션입니다. Sakila는 영화 대여점 관리를 위한 샘플 데이터베이스로, 아래와 같은 테이블 구조를 가지고 있습니다.

### 데이터베이스 스키마

#### 1. 배우 관련 테이블
- **actor**: 배우 정보
  - `actor_id` (PK): 배우 고유 ID
  - `first_name`: 배우 이름
  - `last_name`: 배우 성
  - `last_update`: 정보 갱신 시간

- **film_actor**: 영화와 배우 간의 관계
  - `actor_id` (FK): 배우 ID
  - `film_id` (FK): 영화 ID
  - `last_update`: 정보 갱신 시간

#### 2. 영화 관련 테이블
- **film**: 영화 정보
  - `film_id` (PK): 영화 고유 ID
  - `title`: 영화 제목
  - `description`: 영화 설명
  - `release_year`: 개봉 연도
  - `language_id` (FK): 언어 ID
  - `original_language_id` (FK): 원본 언어 ID
  - `rental_duration`: 대여 기간
  - `rental_rate`: 대여 요금
  - `length`: 상영 시간
  - `replacement_cost`: 교체 비용
  - `rating`: 등급 (G, PG, PG-13, R, NC-17)
  - `special_features`: 특별 기능
  - `last_update`: 정보 갱신 시간

- **film_category**: 영화와 카테고리 간의 관계
  - `film_id` (FK): 영화 ID
  - `category_id` (FK): 카테고리 ID
  - `last_update`: 정보 갱신 시간

- **film_text**: 영화 텍스트 검색을 위한 테이블
  - `film_id` (PK): 영화 ID
  - `title`: 영화 제목
  - `description`: 영화 설명

#### 3. 카테고리 및 언어 테이블
- **category**: 영화 카테고리
  - `category_id` (PK): 카테고리 고유 ID
  - `name`: 카테고리 이름
  - `last_update`: 정보 갱신 시간

- **language**: 언어 정보
  - `language_id` (PK): 언어 고유 ID
  - `name`: 언어 이름
  - `last_update`: 정보 갱신 시간

#### 4. 위치 관련 테이블
- **country**: 국가 정보
  - `country_id` (PK): 국가 고유 ID
  - `country`: 국가명
  - `last_update`: 정보 갱신 시간

- **city**: 도시 정보
  - `city_id` (PK): 도시 고유 ID
  - `city`: 도시명
  - `country_id` (FK): 국가 ID
  - `last_update`: 정보 갱신 시간

- **address**: 주소 정보
  - `address_id` (PK): 주소 고유 ID
  - `address`: 주소
  - `address2`: 추가 주소
  - `district`: 지역
  - `city_id` (FK): 도시 ID
  - `postal_code`: 우편번호
  - `phone`: 전화번호
  - `last_update`: 정보 갱신 시간

#### 5. 고객 및 대여 관련 테이블
- **customer**: 고객 정보
  - `customer_id` (PK): 고객 고유 ID
  - `store_id` (FK): 대여점 ID
  - `first_name`: 이름
  - `last_name`: 성
  - `email`: 이메일
  - `address_id` (FK): 주소 ID
  - `active`: 활성 상태 여부
  - `create_date`: 계정 생성일
  - `last_update`: 정보 갱신 시간

- **rental**: 대여 정보
  - `rental_id` (PK): 대여 고유 ID
  - `rental_date`: 대여일
  - `inventory_id` (FK): 재고 ID
  - `customer_id` (FK): 고객 ID
  - `return_date`: 반납일
  - `staff_id` (FK): 직원 ID
  - `last_update`: 정보 갱신 시간

- **payment**: 결제 정보
  - `payment_id` (PK): 결제 고유 ID
  - `customer_id` (FK): 고객 ID
  - `staff_id` (FK): 직원 ID
  - `rental_id` (FK): 대여 ID
  - `amount`: 결제 금액
  - `payment_date`: 결제일
  - `last_update`: 정보 갱신 시간

#### 6. 재고 및 매장 관련 테이블
- **inventory**: 재고 정보
  - `inventory_id` (PK): 재고 고유 ID
  - `film_id` (FK): 영화 ID
  - `store_id` (FK): 대여점 ID
  - `last_update`: 정보 갱신 시간

- **store**: 대여점 정보
  - `store_id` (PK): 대여점 고유 ID
  - `manager_staff_id` (FK): 관리자 ID
  - `address_id` (FK): 주소 ID
  - `last_update`: 정보 갱신 시간

#### 7. 직원 관련 테이블
- **staff**: 직원 정보
  - `staff_id` (PK): 직원 고유 ID
  - `first_name`: 이름
  - `last_name`: 성
  - `address_id` (FK): 주소 ID
  - `picture`: 사진
  - `email`: 이메일
  - `store_id` (FK): 근무 대여점 ID
  - `active`: 활성 상태 여부
  - `username`: 사용자 이름
  - `password`: 비밀번호
  - `last_update`: 정보 갱신 시간

## 데이터베이스 관계도

데이터베이스는 다음과 같은 관계를 가집니다:

1. 영화(film)는 여러 배우(actor)와 관계를 맺습니다(film_actor).
2. 영화는 여러 카테고리(category)에 속할 수 있습니다(film_category).
3. 영화는 언어(language)와 관련되어 있습니다.
4. 재고(inventory)는 특정 영화와 대여점에 연결됩니다.
5. 대여(rental)는 고객, 재고, 직원과 연결됩니다.
6. 결제(payment)는 대여, 고객, 직원과 연결됩니다.
7. 주소(address)는 도시(city)와 연결되고, 도시는 국가(country)와 연결됩니다.
8. 고객(customer)과 직원(staff)은 주소 정보를 가집니다.

## 애플리케이션 기능 계획

위 데이터베이스를 기반으로 다음과 같은 기능을 가진 Next.js 애플리케이션을 개발할 수 있습니다:

1. 영화 카탈로그 브라우징
2. 영화 상세 정보 조회
3. 배우/감독별 영화 검색
4. 카테고리별 영화 필터링
5. 영화 대여 및 반납 시스템
6. 고객 계정 관리
7. 결제 내역 조회
8. 관리자 대시보드 (재고 관리, 직원 관리 등)
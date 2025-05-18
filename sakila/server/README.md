# Sakila API Server

## 프로젝트 소개

Sakila API Server는 영화 대여점 관리 시스템을 위한 RESTful API를 제공하는 Spring Boot 애플리케이션입니다. 이 애플리케이션은 SQLite 데이터베이스에 연결하여 영화, 고객, 대여, 결제 정보를 관리할 수 있는 API를 제공합니다.

### 주요 기능
- 영화 정보 관리 (조회, 추가, 수정, 삭제)
- 고객 정보 관리 (조회, 추가, 수정, 삭제)
- 대여 정보 관리 (조회, 추가, 수정, 삭제)
- 결제 정보 관리 (조회, 추가, 수정, 삭제)
- Swagger UI를 통한 API 문서화

## 기술 스택

- **Java 17**
- **Spring Boot 3.2.3**
- **Spring Data JPA**
- **SQLite** (Embedded 데이터베이스)
- **Hibernate**
- **Lombok**
- **SpringDoc OpenAPI** (Swagger UI)

## 설치 및 실행 방법

### 필수 조건
- Java 17 이상
- Maven (선택적 - Maven Wrapper 포함됨)

### 빌드 및 실행 방법

#### Maven Wrapper 사용 (권장)
```bash
# 프로젝트 클론
git clone https://your-repository-url/sakila-server.git
cd sakila-server

# 프로젝트 빌드 (Windows)
mvnw.cmd clean install

# 애플리케이션 실행 (Windows)
mvnw.cmd spring-boot:run
```

#### Maven 사용
```bash
# 프로젝트 클론
git clone https://your-repository-url/sakila-server.git
cd sakila-server

# 프로젝트 빌드
mvn clean install

# 애플리케이션 실행
mvn spring-boot:run
```

## 데이터베이스 구성

이 프로젝트는 Sakila SQLite 데이터베이스를 사용합니다. 데이터베이스 파일(`sakila.db`)은, 프로젝트 루트 디렉토리에 위치해 있으며, 실행 시 자동으로 연결됩니다.

### 주요 엔티티
- **Film**: 영화 정보 (ID, 제목, 설명, 출시 연도, 언어, 대여 기간, 대여 요금 등)
- **Customer**: 고객 정보 (ID, 이름, 성, 이메일, 주소, 활성 상태 등)
- **Rental**: 대여 정보 (ID, 대여 날짜, 반납 날짜, 고객 ID, 재고 ID 등)
- **Payment**: 결제 정보 (ID, 금액, 결제 날짜, 고객 ID, 대여 ID 등)

## API 엔드포인트

### 영화 (Films)
- `GET /api/films`: 모든 영화 조회
- `GET /api/films/{id}`: ID로 영화 조회
- `GET /api/films/year/{year}`: 특정 연도의 영화 조회
- `GET /api/films/rating/{rating}`: 특정 등급의 영화 조회
- `GET /api/films/language/{languageId}`: 특정 언어의 영화 조회
- `POST /api/films`: 새 영화 추가
- `PUT /api/films/{id}`: 영화 정보 업데이트
- `DELETE /api/films/{id}`: 영화 삭제

### 고객 (Customers)
- `GET /api/customers`: 모든 고객 조회
- `GET /api/customers/{id}`: ID로 고객 조회
- `GET /api/customers/lastName/{lastName}`: 성으로 고객 검색
- `GET /api/customers/email/{email}`: 이메일로 고객 검색
- `GET /api/customers/active/{active}`: 활성 상태별 고객 조회
- `POST /api/customers`: 새 고객 추가
- `PUT /api/customers/{id}`: 고객 정보 업데이트
- `DELETE /api/customers/{id}`: 고객 삭제

### 대여 (Rentals)
- `GET /api/rentals`: 모든 대여 조회
- `GET /api/rentals/{id}`: ID로 대여 조회
- `GET /api/rentals/customer/{customerId}`: 고객 ID별 대여 조회
- `GET /api/rentals/inventory/{inventoryId}`: 재고 ID별 대여 조회
- `GET /api/rentals/active`: 활성(미반납) 대여 조회
- `GET /api/rentals/dateRange`: 날짜 범위별 대여 조회
- `POST /api/rentals`: 새 대여 추가
- `PUT /api/rentals/{id}`: 대여 정보 업데이트
- `DELETE /api/rentals/{id}`: 대여 삭제

### 결제 (Payments)
- `GET /api/payments`: 모든 결제 조회
- `GET /api/payments/{id}`: ID로 결제 조회
- `GET /api/payments/customer/{customerId}`: 고객 ID별 결제 조회
- `GET /api/payments/rental/{rentalId}`: 대여 ID별 결제 조회
- `GET /api/payments/dateRange`: 날짜 범위별 결제 조회
- `GET /api/payments/amountGreaterThan/{amount}`: 특정 금액 이상의 결제 조회
- `POST /api/payments`: 새 결제 추가
- `PUT /api/payments/{id}`: 결제 정보 업데이트
- `DELETE /api/payments/{id}`: 결제 삭제

## API 문서화

애플리케이션이 실행되면 Swagger UI를 통해 API 문서에 접근할 수 있습니다.
- URL: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

## 프로젝트 구조

```
src/
├── main/
│   ├── java/
│   │   └── com/
│   │       └── sakila/
│   │           └── server/
│   │               ├── config/          # 설정 클래스
│   │               ├── controller/      # REST 컨트롤러
│   │               ├── model/           # 엔티티 클래스
│   │               ├── repository/      # JPA 레포지토리
│   │               ├── service/         # 비즈니스 로직
│   │               └── SakilaServerApplication.java  # 메인 클래스
│   └── resources/
│       └── application.yml              # 애플리케이션 설정
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여 방법

1. 이 저장소를 포크합니다.
2. 새 브랜치를 생성합니다: `git checkout -b feature/your-feature-name`
3. 변경 사항을 커밋합니다: `git commit -m 'Add some feature'`
4. 포크한 저장소에 푸시합니다: `git push origin feature/your-feature-name`
5. Pull Request를 제출합니다.

## 문의

프로젝트에 관한 문의나 이슈는 [GitHub Issues](https://github.com/your-username/sakila-server/issues)에 등록해 주세요.

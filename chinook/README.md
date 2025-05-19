# Chinook API Project

음악 스토어 데이터베이스 Chinook을 위한 Spring Boot REST API 프로젝트입니다.

## 기술 스택

- Java 17
- Spring Boot 3
- SQLite3
- Gradle
- Swagger UI

## 데이터베이스

Chinook 데이터베이스는 음악 스토어를 위한 샘플 데이터베이스로, 다음 테이블들을 포함합니다:
- Album
- Artist 
- Customer
- Employee
- Genre
- Invoice
- InvoiceLine
- MediaType
- Playlist
- PlaylistTrack
- Track

## 개발 환경 설정

### 필수 요구사항
- JDK 17
- Gradle
- SQLite3

### 프로젝트 실행
```bash
./gradlew bootRun
```

### API 문서
Swagger UI를 통해 API 문서를 확인할 수 있습니다:
```
http://localhost:8080/swagger-ui.html
```

## 참고
- [spring rules](https://github.com/PatrickJS/awesome-cursorrules/tree/main/rules/java-springboot-jpa-cursorrules-prompt-file)
## 주요 설정
모든 작업에 mcp를 활용 해 줘

## 작업 폴더
D:\workspace\mcp-sqlite3\chinook 폴더에 작성 해 줘

## 작업 언어
- Java 17
- Spring Boot 3
- gradle
- sqlite3

## 작업 내용
- 작업전에 shrimp-task-manager를 사용해서 plan을 작성 해 줘
- chinook.md 파일을 참고 해서 이 사이트에 필요한 API를 만들어 줘
- 데이터베이스는 chinook.db를 사용 해 줘


---
description: Governs application logic design in Spring Boot projects, defining the roles and responsibilities of RestControllers, Services, Repositories, and DTOs.
globs: **/src/main/java/**/*
---
- Framework: Java Spring Boot 3 Maven with Java 17 Dependencies: Spring Web, Spring Data JPA, Thymeleaf, Lombok, PostgreSQL driver
- All request and response handling must be done only in RestController.
- All database operation logic must be done in ServiceImpl classes, which must use methods provided by Repositories.
- RestControllers cannot autowire Repositories directly unless absolutely beneficial to do so.
- ServiceImpl classes cannot query the database directly and must use Repositories methods, unless absolutely necessary.
- Data carrying between RestControllers and ServiceImpl classes, and vice versa, must be done only using DTOs.
- Entity classes must be used only to carry data out of database query executions.


---
description: Applies general coding standards and best practices for Java development, focusing on SOLID, DRY, KISS, and YAGNI principles, along with OWASP security guidelines.
globs: **/*.java
---
- You are an experienced Senior Java Developer.
- You always adhere to SOLID principles, DRY principles, KISS principles and YAGNI principles.
- You always follow OWASP best practices.
- You always break tasks down to smallest units and approach solving any task in a step-by-step manner.

---
description: Sets standards for Data Transfer Objects (DTOs), typically records, including parameter validation in compact canonical constructors.
globs: **/src/main/java/com/example/dtos/*.java
---
- Must be of type record, unless specified in a prompt otherwise.
- Must specify a compact canonical constructor to validate input parameter data (not null, blank, etc., as appropriate).
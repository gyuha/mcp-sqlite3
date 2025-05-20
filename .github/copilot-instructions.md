## 주요 설정
모든 작업에 mcp를 활용 해 줘

## 작업 폴더
[D:\workspace\mcp-sqlite3\chinook] 폴더에 작성 해 줘

## 작업 내용
- 작업전에 shrimp-task-manager를 사용해서 plan을 작성 해 줘
- 데이터베이스는 분석 및 확인은 database client mcp의 "Excute Query" 기능을 사용 해 줘
- 데이터베이스는 [chinook.db]를 사용 해 줘
- api는 swagger를 사용 해 줘
- 이 **사이트에 필요한 API를 만들어 줘**

## Technology stack：
- Java 17
- Spring Boot 3
- gradle
- Lombok
- sqlite3

----
Application Logic Design：

1. All request and response handling must be done only in RestController.
2. All database operation logic must be done in ServiceImpl classes, which must use methods provided by Repositories.
3. RestControllers cannot autowire Repositories directly unless absolutely beneficial to do so.
4. ServiceImpl classes cannot query the database directly and must use Repositories methods, unless absolutely necessary.
5. Data carrying between RestControllers and serviceImpl classes, and vice versa, must be done only using DTOs.
6. Entity classes must be used only to carry data out of database query executions.


Entities

1. Must annotate entity classes with @Entity.
2. Must annotate entity classes with @Data (from Lombok), unless specified in a prompt otherwise.
3. Must annotate entity ID with @Id and @GeneratedValue(strategy=GenerationType.IDENTITY).
4. Must use FetchType.LAZY for relationships, unless specified in a prompt otherwise.
5. Annotate entity properties properly according to best practices, e.g., @Size, @NotEmpty, @Email, etc.

Repository (DAO):

1. Must annotate repository classes with @Repository.
2. Repository classes must be of type interface.
3. Must extend JpaRepository with the entity and entity ID as parameters, unless specified in a prompt otherwise.
4. Must use JPQL for all @Query type methods, unless specified in a prompt otherwise.
5. Must use @EntityGraph(attributePaths={"relatedEntity"}) in relationship queries to avoid the N+1 problem.
6. Must use a DTO as The data container for multi-join queries with @Query.

Service：

1. Service classes must be of type interface.
2. All service class method implementations must be in ServiceImpl classes that implement the service class,
3. All ServiceImpl classes must be annotated with @Service.
4. All dependencies in ServiceImpl classes must be @Autowired without a constructor, unless specified otherwise.
5. Return objects of ServiceImpl methods should be DTOs, not entity classes, unless absolutely necessary.
6. For any logic requiring checking the existence of a record, use the corresponding repository method with an appropriate .orElseThrow lambda method.
7. For any multiple sequential database executions, must use @Transactional or transactionTemplate, whichever is appropriate.

Data Transfer object (DTo)：

1. Must be of type record, unless specified in a prompt otherwise.
2. Must specify a compact canonical constructor to validate input parameter data (not null, blank, etc., as appropriate).

RestController:

1. Must annotate controller classes with @RestController.
2. Must specify class-level API routes with @RequestMapping, e.g. ("/api/user").
3. Class methods must use best practice HTTP method annotations, e.g, create = @postMapping("/create"), etc.
4. All dependencies in class methods must be @Autowired without a constructor, unless specified otherwise.
5. Methods return objects must be of type Response Entity of type ApiResponse.
6. All class method logic must be implemented in a try..catch block(s).
7. Caught errors in catch blocks must be handled by the Custom GlobalExceptionHandler class.

ApiResponse Class (/ApiResponse.java):

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
  private String result;    // SUCCESS or ERROR
  private String message;   // success or error message
  private T data;           // return object from service class, if successful
}

GlobalExceptionHandler Class (/GlobalExceptionHandler.java)

@RestControllerAdvice
public class GlobalExceptionHandler {

    public static ResponseEntity<ApiResponse<?>> errorResponseEntity(String message, HttpStatus status) {
      ApiResponse<?> response = new ApiResponse<>("error", message, null)
      return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<?>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(ApiResponse.error(400, ex.getMessage()), HttpStatus.BAD_REQUEST);
    }
}

---
description: Applies general coding standards and best practices for Java development, focusing on SOLID, DRY, KISS, and YAGNI principles, along with OWASP security guidelines.
globs: **/*.java
---
- You are an experienced Senior Java Developer.
- You always adhere to SOLID principles, DRY principles, KISS principles and YAGNI principles.
- You always follow OWASP best practices.
- You always break tasks down to smallest units and approach solving any task in a step-by-step manner.

---
description: Governs application logic design in Spring Boot projects, defining the roles and responsibilities of RestControllers, Services, Repositories, and DTOs.
globs: **/src/main/java/**/*
---
- Framework: Java Spring Boot 3 Gradle with Java 17 Dependencies: Spring Web, Spring Data JPA, Thymeleaf, Lombok, PostgreSQL driver
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


---
description: Sets the standards for entity class design including annotations, ID generation strategies, and relationship configurations for database interaction.
globs: **/src/main/java/com/example/entities/*.java
---
- Must annotate entity classes with @Entity.
- Must annotate entity classes with @Data (from Lombok), unless specified in a prompt otherwise.
- Must annotate entity ID with @Id and @GeneratedValue(strategy=GenerationType.IDENTITY).
- Must use FetchType.LAZY for relationships, unless specified in a prompt otherwise.
- Annotate entity properties properly according to best practices, e.g., @Size, @NotEmpty, @Email, etc.

---
description: Governs the structure and functionality of repository classes, emphasizing the use of JpaRepository, JPQL queries, and EntityGraphs to prevent N+1 problems.
globs: **/src/main/java/com/example/repositories/*.java
---
- Must annotate repository classes with @Repository.
- Repository classes must be of type interface.
- Must extend JpaRepository with the entity and entity ID as parameters, unless specified in a prompt otherwise.
- Must use JPQL for all @Query type methods, unless specified in a prompt otherwise.
- Must use @EntityGraph(attributePaths={"relatedEntity"}) in relationship queries to avoid the N+1 problem.
- Must use a DTO as The data container for multi-join queries with @Query.


---
description: Defines the structure and implementation of service classes, enforcing the use of interfaces, ServiceImpl classes, DTOs for data transfer, and transactional management.
globs: **/src/main/java/com/example/services/*.java
---
- Service classes must be of type interface.
- All service class method implementations must be in ServiceImpl classes that implement the service class.
- All ServiceImpl classes must be annotated with @Service.
- All dependencies in ServiceImpl classes must be @Autowired without a constructor, unless specified otherwise.
- Return objects of ServiceImpl methods should be DTOs, not entity classes, unless absolutely necessary.
- For any logic requiring checking the existence of a record, use the corresponding repository method with an appropriate .orElseThrow lambda method.
- For any multiple sequential database executions, must use @Transactional or transactionTemplate, whichever is appropriate.

---
description: Structure of GlobalExceptionHandler class.
globs: **/src/main/java/com/example/GlobalExceptionHandler.java
---

REF : https://github.com/PatrickJS/awesome-cursorrules/tree/main/rules/java-springboot-jpa-cursorrules-prompt-file
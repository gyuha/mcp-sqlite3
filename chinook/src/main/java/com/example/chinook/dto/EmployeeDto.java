package com.example.chinook.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public record EmployeeDto(
    Long id,
    String firstName,
    String lastName,
    String title,
    LocalDateTime birthDate,
    LocalDateTime hireDate,
    String address,
    String city,
    String state,
    String country,
    String postalCode,
    String phone,
    String fax,
    String email
) {
    public EmployeeDto {
        Objects.requireNonNull(firstName, "이름은 null일 수 없습니다.");
        Objects.requireNonNull(lastName, "성은 null일 수 없습니다.");
        
        if (firstName.isBlank()) {
            throw new IllegalArgumentException("이름은 비어있을 수 없습니다.");
        }
        if (lastName.isBlank()) {
            throw new IllegalArgumentException("성은 비어있을 수 없습니다.");
        }
        if (email != null && email.isBlank()) {
            throw new IllegalArgumentException("이메일이 제공된 경우 비어있을 수 없습니다.");
        }
        if (email != null && !email.contains("@")) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
    }
}

public record EmployeeDetailDto(
    Long id,
    String firstName,
    String lastName,
    String title,
    LocalDateTime birthDate,
    LocalDateTime hireDate,
    String address,
    String city,
    String state,
    String country,
    String postalCode,
    String phone,
    String fax,
    String email,
    EmployeeDto reportsTo,
    List<EmployeeDto> subordinates,
    List<CustomerDto> customers
) {
    public EmployeeDetailDto {
        Objects.requireNonNull(firstName, "이름은 null일 수 없습니다.");
        Objects.requireNonNull(lastName, "성은 null일 수 없습니다.");
        Objects.requireNonNull(subordinates, "부하 직원 목록은 null일 수 없습니다.");
        Objects.requireNonNull(customers, "고객 목록은 null일 수 없습니다.");
        
        if (firstName.isBlank()) {
            throw new IllegalArgumentException("이름은 비어있을 수 없습니다.");
        }
        if (lastName.isBlank()) {
            throw new IllegalArgumentException("성은 비어있을 수 없습니다.");
        }
        if (email != null && email.isBlank()) {
            throw new IllegalArgumentException("이메일이 제공된 경우 비어있을 수 없습니다.");
        }
        if (email != null && !email.contains("@")) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
    }
}

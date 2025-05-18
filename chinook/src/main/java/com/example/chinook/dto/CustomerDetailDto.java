package com.example.chinook.dto;

import java.util.List;
import java.util.Objects;

public record CustomerDetailDto(
    Long id,
    String firstName,
    String lastName,
    String company,
    String address,
    String city,
    String state,
    String country,
    String postalCode,
    String phone,
    String fax,
    String email,
    EmployeeDto supportRep,
    List<InvoiceDto> invoices
) {
    public CustomerDetailDto {
        Objects.requireNonNull(firstName, "이름은 null일 수 없습니다.");
        Objects.requireNonNull(lastName, "성은 null일 수 없습니다.");
        Objects.requireNonNull(email, "이메일은 null일 수 없습니다.");
        Objects.requireNonNull(invoices, "청구서 목록은 null일 수 없습니다.");
        
        if (firstName.isBlank()) {
            throw new IllegalArgumentException("이름은 비어있을 수 없습니다.");
        }
        if (lastName.isBlank()) {
            throw new IllegalArgumentException("성은 비어있을 수 없습니다.");
        }
        if (email.isBlank()) {
            throw new IllegalArgumentException("이메일은 비어있을 수 없습니다.");
        }
        if (!email.contains("@")) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
    }
}

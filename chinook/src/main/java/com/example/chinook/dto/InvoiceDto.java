package com.example.chinook.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

public record InvoiceDto(
    Long id,
    CustomerDto customer,
    LocalDateTime invoiceDate,
    String billingAddress,
    String billingCity,
    String billingState,
    String billingCountry,
    String billingPostalCode,
    BigDecimal total
) {
    public InvoiceDto {
        Objects.requireNonNull(customer, "고객 정보는 null일 수 없습니다.");
        Objects.requireNonNull(invoiceDate, "청구일은 null일 수 없습니다.");
        Objects.requireNonNull(total, "총액은 null일 수 없습니다.");
        
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("총액은 0보다 작을 수 없습니다.");
        }
    }
}

public record InvoiceDetailDto(
    Long id,
    CustomerDto customer,
    LocalDateTime invoiceDate,
    String billingAddress,
    String billingCity,
    String billingState,
    String billingCountry,
    String billingPostalCode,
    BigDecimal total,
    List<InvoiceItemDto> items
) {
    public InvoiceDetailDto {
        Objects.requireNonNull(customer, "고객 정보는 null일 수 없습니다.");
        Objects.requireNonNull(invoiceDate, "청구일은 null일 수 없습니다.");
        Objects.requireNonNull(total, "총액은 null일 수 없습니다.");
        Objects.requireNonNull(items, "청구 항목 목록은 null일 수 없습니다.");
        
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("총액은 0보다 작을 수 없습니다.");
        }
    }
}

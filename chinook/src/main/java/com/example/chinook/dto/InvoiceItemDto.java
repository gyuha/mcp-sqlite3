package com.example.chinook.dto;

import java.math.BigDecimal;
import java.util.Objects;

public record InvoiceItemDto(
    Long id,
    Long invoiceId,
    TrackDto track,
    BigDecimal unitPrice,
    Integer quantity
) {
    public InvoiceItemDto {
        Objects.requireNonNull(track, "트랙 정보는 null일 수 없습니다.");
        Objects.requireNonNull(unitPrice, "단가는 null일 수 없습니다.");
        Objects.requireNonNull(quantity, "수량은 null일 수 없습니다.");
        
        if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("단가는 0보다 작을 수 없습니다.");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("수량은 0보다 커야 합니다.");
        }
    }
}

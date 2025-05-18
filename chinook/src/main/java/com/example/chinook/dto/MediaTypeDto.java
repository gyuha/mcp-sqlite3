package com.example.chinook.dto;

import java.util.Objects;

public record MediaTypeDto(
    Long id,
    String name
) {
    public MediaTypeDto {
        Objects.requireNonNull(name, "미디어 타입 이름은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("미디어 타입 이름은 비어있을 수 없습니다.");
        }
    }
}

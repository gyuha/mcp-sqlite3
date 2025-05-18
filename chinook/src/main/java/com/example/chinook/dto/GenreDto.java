package com.example.chinook.dto;

import java.util.Objects;

public record GenreDto(
    Long id,
    String name
) {
    public GenreDto {
        Objects.requireNonNull(name, "장르 이름은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("장르 이름은 비어있을 수 없습니다.");
        }
    }
}

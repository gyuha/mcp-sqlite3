package com.example.chinook.dto;

import java.util.List;

public record PageResponse<T>(
    List<T> content,
    int pageNumber,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean first,
    boolean last
) {
    public PageResponse {
        if (content == null) {
            throw new IllegalArgumentException("content는 null일 수 없습니다.");
        }
        if (pageNumber < 0) {
            throw new IllegalArgumentException("pageNumber는 0 이상이어야 합니다.");
        }
        if (pageSize <= 0) {
            throw new IllegalArgumentException("pageSize는 0보다 커야 합니다.");
        }
        if (totalElements < 0) {
            throw new IllegalArgumentException("totalElements는 0 이상이어야 합니다.");
        }
        if (totalPages < 0) {
            throw new IllegalArgumentException("totalPages는 0 이상이어야 합니다.");
        }
    }
}

package com.example.chinook.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    String message,
    int status,
    String code,
    LocalDateTime timestamp,
    List<String> details
) {
    public static ErrorResponse of(String message, int status, String code) {
        return new ErrorResponse(message, status, code, LocalDateTime.now(), null);
    }

    public static ErrorResponse of(String message, int status, String code, List<String> details) {
        return new ErrorResponse(message, status, code, LocalDateTime.now(), details);
    }
}

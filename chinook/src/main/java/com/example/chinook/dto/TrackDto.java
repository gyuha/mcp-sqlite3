package com.example.chinook.dto;

import java.math.BigDecimal;
import java.util.Objects;

public record TrackDto(
    Long id,
    String name,
    AlbumDto album,
    MediaTypeDto mediaType,
    GenreDto genre,
    String composer,
    Long milliseconds,
    Long bytes,
    BigDecimal unitPrice
) {
    public TrackDto {
        Objects.requireNonNull(name, "트랙 이름은 null일 수 없습니다.");
        Objects.requireNonNull(mediaType, "미디어 타입은 null일 수 없습니다.");
        Objects.requireNonNull(unitPrice, "가격은 null일 수 없습니다.");
        Objects.requireNonNull(milliseconds, "재생 시간은 null일 수 없습니다.");
        
        if (name.isBlank()) {
            throw new IllegalArgumentException("트랙 이름은 비어있을 수 없습니다.");
        }
        if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("가격은 0보다 작을 수 없습니다.");
        }
        if (milliseconds <= 0) {
            throw new IllegalArgumentException("재생 시간은 0보다 커야 합니다.");
        }
        if (bytes != null && bytes < 0) {
            throw new IllegalArgumentException("파일 크기는 0보다 작을 수 없습니다.");
        }
    }
}

public record TrackDetailDto(
    Long id,
    String name,
    AlbumDto album,
    MediaTypeDto mediaType,
    GenreDto genre,
    String composer,
    Long milliseconds,
    Long bytes,
    BigDecimal unitPrice,
    List<PlaylistDto> playlists
) {
    public TrackDetailDto {
        Objects.requireNonNull(name, "트랙 이름은 null일 수 없습니다.");
        Objects.requireNonNull(mediaType, "미디어 타입은 null일 수 없습니다.");
        Objects.requireNonNull(unitPrice, "가격은 null일 수 없습니다.");
        Objects.requireNonNull(milliseconds, "재생 시간은 null일 수 없습니다.");
        Objects.requireNonNull(playlists, "재생목록은 null일 수 없습니다.");
        
        if (name.isBlank()) {
            throw new IllegalArgumentException("트랙 이름은 비어있을 수 없습니다.");
        }
        if (unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("가격은 0보다 작을 수 없습니다.");
        }
        if (milliseconds <= 0) {
            throw new IllegalArgumentException("재생 시간은 0보다 커야 합니다.");
        }
        if (bytes != null && bytes < 0) {
            throw new IllegalArgumentException("파일 크기는 0보다 작을 수 없습니다.");
        }
    }
}

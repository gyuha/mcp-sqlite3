package com.example.chinook.dto;

import java.util.Objects;

public record ArtistDto(
    Long id,
    String name
) {
    public ArtistDto {
        Objects.requireNonNull(name, "아티스트 이름은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("아티스트 이름은 비어있을 수 없습니다.");
        }
    }
}

public record ArtistDetailDto(
    Long id,
    String name,
    List<AlbumDto> albums
) {
    public ArtistDetailDto {
        Objects.requireNonNull(name, "아티스트 이름은 null일 수 없습니다.");
        Objects.requireNonNull(albums, "앨범 목록은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("아티스트 이름은 비어있을 수 없습니다.");
        }
    }
}

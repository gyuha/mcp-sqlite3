package com.example.chinook.dto;

import java.util.List;
import java.util.Objects;

public record PlaylistDto(
    Long id,
    String name
) {
    public PlaylistDto {
        Objects.requireNonNull(name, "재생목록 이름은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("재생목록 이름은 비어있을 수 없습니다.");
        }
    }
}

public record PlaylistDetailDto(
    Long id,
    String name,
    List<TrackDto> tracks
) {
    public PlaylistDetailDto {
        Objects.requireNonNull(name, "재생목록 이름은 null일 수 없습니다.");
        Objects.requireNonNull(tracks, "트랙 목록은 null일 수 없습니다.");
        if (name.isBlank()) {
            throw new IllegalArgumentException("재생목록 이름은 비어있을 수 없습니다.");
        }
    }
}

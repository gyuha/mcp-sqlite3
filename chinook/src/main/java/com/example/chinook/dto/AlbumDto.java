package com.example.chinook.dto;

import java.util.List;
import java.util.Objects;

public record AlbumDto(
    Long id,
    String title,
    ArtistDto artist
) {
    public AlbumDto {
        Objects.requireNonNull(title, "앨범 제목은 null일 수 없습니다.");
        Objects.requireNonNull(artist, "아티스트 정보는 null일 수 없습니다.");
        if (title.isBlank()) {
            throw new IllegalArgumentException("앨범 제목은 비어있을 수 없습니다.");
        }
    }
}

public record AlbumDetailDto(
    Long id,
    String title,
    ArtistDto artist,
    List<TrackDto> tracks
) {
    public AlbumDetailDto {
        Objects.requireNonNull(title, "앨범 제목은 null일 수 없습니다.");
        Objects.requireNonNull(artist, "아티스트 정보는 null일 수 없습니다.");
        Objects.requireNonNull(tracks, "트랙 목록은 null일 수 없습니다.");
        if (title.isBlank()) {
            throw new IllegalArgumentException("앨범 제목은 비어있을 수 없습니다.");
        }
    }
}

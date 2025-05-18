package com.example.chinook.service;

import com.example.chinook.dto.GenreDto;
import com.example.chinook.dto.TrackDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface GenreService {
    GenreDto createGenre(GenreDto genreDto);
    GenreDto updateGenre(Long id, GenreDto genreDto);
    void deleteGenre(Long id);
    GenreDto getGenre(Long id);
    GenreDto getGenreWithTracks(Long id);
    Page<GenreDto> getAllGenres(Pageable pageable);
    Page<GenreDto> searchGenresByName(String name, Pageable pageable);
    List<GenreDto> getTopGenresByTrackCount(int limit);
    Long getGenreTrackCount(Long genreId);
    List<TrackDto> getGenreTracks(Long genreId);
}

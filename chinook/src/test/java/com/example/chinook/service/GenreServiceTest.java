package com.example.chinook.service;

import com.example.chinook.dto.GenreDto;
import com.example.chinook.entity.Genre;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.GenreRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GenreServiceTest {

    @Mock
    private GenreRepository genreRepository;

    @InjectMocks
    private GenreServiceImpl genreService;

    private Genre testGenre;
    private GenreDto testGenreDto;

    @BeforeEach
    void setUp() {
        testGenre = new Genre();
        testGenre.setId(1L);
        testGenre.setName("Rock");

        testGenreDto = new GenreDto(
            testGenre.getId(),
            testGenre.getName()
        );
    }

    @Test
    void createGenre_Success() {
        when(genreRepository.findByName(testGenreDto.name())).thenReturn(Optional.empty());
        when(genreRepository.save(any(Genre.class))).thenReturn(testGenre);

        GenreDto result = genreService.createGenre(testGenreDto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo(testGenreDto.name());
        verify(genreRepository).save(any(Genre.class));
    }

    @Test
    void createGenre_DuplicateName() {
        when(genreRepository.findByName(testGenreDto.name())).thenReturn(Optional.of(testGenre));

        assertThatThrownBy(() -> genreService.createGenre(testGenreDto))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 장르 이름입니다");
    }

    @Test
    void updateGenre_Success() {
        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));
        when(genreRepository.findByName("New Genre")).thenReturn(Optional.empty());

        GenreDto updatedDto = new GenreDto(testGenre.getId(), "New Genre");
        GenreDto result = genreService.updateGenre(1L, updatedDto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("New Genre");
    }

    @Test
    void getGenreWithTracks_Success() {
        Track track = new Track();
        track.setId(1L);
        track.setName("Test Track");
        testGenre.getTracks().add(track);

        when(genreRepository.findByIdWithTracks(1L)).thenReturn(Optional.of(testGenre));

        GenreDto result = genreService.getGenreWithTracks(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testGenre.getId());
    }

    @Test
    void getAllGenres_Success() {
        List<Genre> genres = Arrays.asList(testGenre);
        Page<Genre> genrePage = new PageImpl<>(genres);
        Pageable pageable = PageRequest.of(0, 10);

        when(genreRepository.findAll(pageable)).thenReturn(genrePage);

        Page<GenreDto> result = genreService.getAllGenres(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo(testGenre.getName());
    }

    @Test
    void getTopGenresByTrackCount_Success() {
        List<Genre> genres = Arrays.asList(testGenre);
        when(genreRepository.findTopGenresByTrackCount(5)).thenReturn(genres);

        List<GenreDto> result = genreService.getTopGenresByTrackCount(5);

        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo(testGenre.getName());
    }

    @Test
    void deleteGenre_WithTracks() {
        Track track = new Track();
        track.setId(1L);
        testGenre.setTracks(new ArrayList<>(Arrays.asList(track)));

        when(genreRepository.findById(1L)).thenReturn(Optional.of(testGenre));

        assertThatThrownBy(() -> genreService.deleteGenre(1L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("트랙이 있는 장르는 삭제할 수 없습니다");
    }
}

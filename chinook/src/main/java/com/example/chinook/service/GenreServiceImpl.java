package com.example.chinook.service;

import com.example.chinook.dto.GenreDto;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.entity.Genre;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.GenreRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    private GenreDto toDto(Genre genre) {
        return new GenreDto(
            genre.getId(),
            genre.getName()
        );
    }

    private TrackDto toTrackDto(Track track) {
        return new TrackDto(
            track.getId(),
            track.getName(),
            track.getComposer(),
            track.getMilliseconds(),
            track.getBytes(),
            track.getUnitPrice()
        );
    }

    private Genre toEntity(GenreDto dto) {
        Genre genre = new Genre();
        updateGenreFromDto(genre, dto);
        return genre;
    }

    private void updateGenreFromDto(Genre genre, GenreDto dto) {
        genre.setName(dto.name());
    }

    @Override
    @Transactional
    public GenreDto createGenre(GenreDto genreDto) {
        genreRepository.findByName(genreDto.name())
            .ifPresent(g -> {
                throw new IllegalArgumentException("이미 존재하는 장르 이름입니다: " + genreDto.name());
            });

        Genre genre = toEntity(genreDto);
        return toDto(genreRepository.save(genre));
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", key = "#id")
    public GenreDto updateGenre(Long id, GenreDto genreDto) {
        Genre genre = genreRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("장르를 찾을 수 없습니다: " + id));

        genreRepository.findByName(genreDto.name())
            .filter(g -> !g.getId().equals(id))
            .ifPresent(g -> {
                throw new IllegalArgumentException("이미 존재하는 장르 이름입니다: " + genreDto.name());
            });

        updateGenreFromDto(genre, genreDto);
        return toDto(genre);
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", key = "#id")
    public void deleteGenre(Long id) {
        Genre genre = genreRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("장르를 찾을 수 없습니다: " + id));

        if (!genre.getTracks().isEmpty()) {
            throw new IllegalStateException("트랙이 있는 장르는 삭제할 수 없습니다.");
        }

        genreRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "genres", key = "#id")
    public GenreDto getGenre(Long id) {
        return genreRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("장르를 찾을 수 없습니다: " + id));
    }

    @Override
    public GenreDto getGenreWithTracks(Long id) {
        return genreRepository.findByIdWithTracks(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("장르를 찾을 수 없습니다: " + id));
    }

    @Override
    @Cacheable(value = "genres", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<GenreDto> getAllGenres(Pageable pageable) {
        return genreRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public Page<GenreDto> searchGenresByName(String name, Pageable pageable) {
        return genreRepository.findByNameContainingIgnoreCase(name, pageable)
            .map(this::toDto);
    }

    @Override
    @Cacheable(value = "genres", key = "'top:' + #limit")
    public List<GenreDto> getTopGenresByTrackCount(int limit) {
        return genreRepository.findTopGenresByTrackCount(limit)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Long getGenreTrackCount(Long genreId) {
        if (!genreRepository.existsById(genreId)) {
            throw new EntityNotFoundException("장르를 찾을 수 없습니다: " + genreId);
        }
        return genreRepository.countTracksByGenreId(genreId);
    }

    @Override
    public List<TrackDto> getGenreTracks(Long genreId) {
        return genreRepository.findByIdWithTracks(genreId)
            .map(genre -> genre.getTracks().stream()
                .map(this::toTrackDto)
                .collect(Collectors.toList()))
            .orElseThrow(() -> new EntityNotFoundException("장르를 찾을 수 없습니다: " + genreId));
    }
}

package com.sakila.server.service;

import com.sakila.server.exception.ResourceNotFoundException;
import com.sakila.server.model.Film;
import com.sakila.server.repository.FilmRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FilmService {

    private final FilmRepository filmRepository;

    public List<Film> getAllFilms() {
        return filmRepository.findAll();
    }

    public Page<Film> getAllFilms(Pageable pageable) {
        return filmRepository.findAll(pageable);
    }

    public Film getFilmById(Integer id) {
        return filmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Film", "id", id));
    }

    public List<Film> getFilmsByReleaseYear(Integer year) {
        return filmRepository.findByReleaseYear(year);
    }

    public Page<Film> getFilmsByReleaseYear(Integer year, Pageable pageable) {
        return filmRepository.findByReleaseYear(year, pageable);
    }

    public List<Film> getFilmsByRating(String rating) {
        return filmRepository.findByRating(rating);
    }

    public Page<Film> getFilmsByRating(String rating, Pageable pageable) {
        return filmRepository.findByRating(rating, pageable);
    }

    public List<Film> getFilmsByLanguageId(Integer languageId) {
        return filmRepository.findByLanguageId(languageId);
    }

    public Page<Film> getFilmsByLanguageId(Integer languageId, Pageable pageable) {
        return filmRepository.findByLanguageId(languageId, pageable);
    }

    public List<Film> searchFilmsByTitle(String title) {
        return filmRepository.findByTitleContainingIgnoreCase(title);
    }

    public Page<Film> searchFilmsByTitle(String title, Pageable pageable) {
        return filmRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Transactional
    public Film saveFilm(Film film) {
        return filmRepository.save(film);
    }

    @Transactional
    public void deleteFilm(Integer id) {
        filmRepository.deleteById(id);
    }
}

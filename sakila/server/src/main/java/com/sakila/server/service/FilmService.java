package com.sakila.server.service;

import com.sakila.server.exception.ResourceNotFoundException;
import com.sakila.server.model.Film;
import com.sakila.server.repository.FilmRepository;
import lombok.RequiredArgsConstructor;
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

    public Film getFilmById(Integer id) {
        return filmRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Film", "id", id));
    }

    public List<Film> getFilmsByReleaseYear(Integer year) {
        return filmRepository.findByReleaseYear(year);
    }

    public List<Film> getFilmsByRating(String rating) {
        return filmRepository.findByRating(rating);
    }

    public List<Film> getFilmsByLanguageId(Integer languageId) {
        return filmRepository.findByLanguageId(languageId);
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

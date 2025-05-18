package com.sakila.server.controller;

import com.sakila.server.model.Film;
import com.sakila.server.service.FilmService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/films")
@RequiredArgsConstructor
public class FilmController {

    private final FilmService filmService;

    @GetMapping
    public ResponseEntity<List<Film>> getAllFilms() {
        return ResponseEntity.ok(filmService.getAllFilms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Film> getFilmById(@PathVariable Integer id) {
        return filmService.getFilmById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<Film>> getFilmsByReleaseYear(@PathVariable Integer year) {
        return ResponseEntity.ok(filmService.getFilmsByReleaseYear(year));
    }

    @GetMapping("/rating/{rating}")
    public ResponseEntity<List<Film>> getFilmsByRating(@PathVariable String rating) {
        return ResponseEntity.ok(filmService.getFilmsByRating(rating));
    }

    @GetMapping("/language/{languageId}")
    public ResponseEntity<List<Film>> getFilmsByLanguageId(@PathVariable Integer languageId) {
        return ResponseEntity.ok(filmService.getFilmsByLanguageId(languageId));
    }

    @PostMapping
    public ResponseEntity<Film> createFilm(@RequestBody Film film) {
        return new ResponseEntity<>(filmService.saveFilm(film), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Film> updateFilm(@PathVariable Integer id, @RequestBody Film film) {
        return filmService.getFilmById(id)
                .map(existingFilm -> {
                    film.setFilmId(id);
                    return ResponseEntity.ok(filmService.saveFilm(film));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFilm(@PathVariable Integer id) {
        return filmService.getFilmById(id)
                .map(film -> {
                    filmService.deleteFilm(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

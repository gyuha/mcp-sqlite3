package com.sakila.server.controller;

import com.sakila.server.model.Film;
import com.sakila.server.service.FilmService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        return ResponseEntity.ok(filmService.getFilmById(id));
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

    @GetMapping("/paged")
    public ResponseEntity<Page<Film>> getAllFilmsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "filmId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : 
                Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(filmService.getAllFilms(pageable));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<Film>> searchFilms(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(filmService.searchFilmsByTitle(title, pageable));
    }
    
    @GetMapping("/year/{year}/paged")
    public ResponseEntity<Page<Film>> getFilmsByReleaseYearPaged(
            @PathVariable Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(filmService.getFilmsByReleaseYear(year, pageable));
    }
    
    @GetMapping("/rating/{rating}/paged")
    public ResponseEntity<Page<Film>> getFilmsByRatingPaged(
            @PathVariable String rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(filmService.getFilmsByRating(rating, pageable));
    }
    
    @GetMapping("/language/{languageId}/paged")
    public ResponseEntity<Page<Film>> getFilmsByLanguageIdPaged(
            @PathVariable Integer languageId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(filmService.getFilmsByLanguageId(languageId, pageable));
    }

    @PostMapping
    public ResponseEntity<Film> createFilm(@RequestBody Film film) {
        return new ResponseEntity<>(filmService.saveFilm(film), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Film> updateFilm(@PathVariable Integer id, @RequestBody Film film) {
        // 아이디로 필름을 찾고, 없으면 ResourceNotFoundException이 발생합니다
        filmService.getFilmById(id);
        film.setFilmId(id);
        return ResponseEntity.ok(filmService.saveFilm(film));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFilm(@PathVariable Integer id) {
        // 아이디로 필름을 찾고, 없으면 ResourceNotFoundException이 발생합니다
        filmService.getFilmById(id);
        filmService.deleteFilm(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}

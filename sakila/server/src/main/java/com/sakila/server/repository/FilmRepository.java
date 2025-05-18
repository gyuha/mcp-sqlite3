package com.sakila.server.repository;

import com.sakila.server.model.Film;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilmRepository extends JpaRepository<Film, Integer> {
    List<Film> findByReleaseYear(Integer releaseYear);
    List<Film> findByRating(String rating);
    List<Film> findByLanguageId(Integer languageId);
}

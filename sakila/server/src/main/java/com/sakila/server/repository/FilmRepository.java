package com.sakila.server.repository;

import com.sakila.server.model.Film;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FilmRepository extends JpaRepository<Film, Integer> {
    List<Film> findByReleaseYear(Integer releaseYear);
    List<Film> findByRating(String rating);
    List<Film> findByLanguageId(Integer languageId);
    
    Page<Film> findByReleaseYear(Integer releaseYear, Pageable pageable);
    Page<Film> findByRating(String rating, Pageable pageable);
    Page<Film> findByLanguageId(Integer languageId, Pageable pageable);
    
    // 제목으로 검색 기능 추가
    Page<Film> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    List<Film> findByTitleContainingIgnoreCase(String title);
}

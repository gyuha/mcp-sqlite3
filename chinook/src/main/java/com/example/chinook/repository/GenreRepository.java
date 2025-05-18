package com.example.chinook.repository;

import com.example.chinook.entity.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {
    
    Optional<Genre> findByName(String name);
    
    Page<Genre> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT g FROM Genre g LEFT JOIN FETCH g.tracks WHERE g.id = :id")
    Optional<Genre> findByIdWithTracks(Long id);
    
    @Query(value = "SELECT g.* FROM genres g " +
                   "LEFT JOIN tracks t ON g.GenreId = t.GenreId " +
                   "GROUP BY g.GenreId " +
                   "ORDER BY COUNT(t.TrackId) DESC " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<Genre> findTopGenresByTrackCount(int limit);
    
    @Query("SELECT COUNT(t) FROM Genre g JOIN g.tracks t WHERE g.id = :genreId")
    Long countTracksByGenreId(Long genreId);
}

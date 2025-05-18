package com.example.chinook.repository;

import com.example.chinook.entity.Artist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Long> {
    
    Optional<Artist> findByName(String name);
    
    Page<Artist> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT a FROM Artist a JOIN FETCH a.albums WHERE a.id = :id")
    Optional<Artist> findByIdWithAlbums(Long id);
    
    @Query(value = "SELECT a.* FROM artists a " +
                   "LEFT JOIN albums al ON a.ArtistId = al.ArtistId " +
                   "GROUP BY a.ArtistId " +
                   "ORDER BY COUNT(al.AlbumId) DESC " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<Artist> findTopArtistsByAlbumCount(int limit);
}

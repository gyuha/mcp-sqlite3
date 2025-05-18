package com.example.chinook.repository;

import com.example.chinook.entity.Album;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    
    Optional<Album> findByTitle(String title);
    
    Page<Album> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    List<Album> findByArtistId(Long artistId);
    
    Page<Album> findByArtistId(Long artistId, Pageable pageable);
    
    @Query("SELECT a FROM Album a JOIN FETCH a.artist JOIN FETCH a.tracks WHERE a.id = :id")
    Optional<Album> findByIdWithArtistAndTracks(@Param("id") Long id);
    
    @Query("SELECT COUNT(t) FROM Album a JOIN a.tracks t WHERE a.id = :albumId")
    Long countTracksByAlbumId(@Param("albumId") Long albumId);
    
    @Query(value = "SELECT a.* FROM albums a " +
                   "JOIN tracks t ON a.AlbumId = t.AlbumId " +
                   "GROUP BY a.AlbumId " +
                   "ORDER BY COUNT(t.TrackId) DESC " +
                   "LIMIT :limit", 
           nativeQuery = true)
    List<Album> findTopAlbumsByTrackCount(@Param("limit") int limit);
}

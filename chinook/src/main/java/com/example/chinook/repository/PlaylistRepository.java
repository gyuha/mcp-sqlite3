package com.example.chinook.repository;

import com.example.chinook.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PlaylistRepository extends JpaRepository<Playlist, Long> {
    
    Optional<Playlist> findByName(String name);
    
    Page<Playlist> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT p FROM Playlist p LEFT JOIN FETCH p.tracks WHERE p.id = :id")
    Optional<Playlist> findByIdWithTracks(@Param("id") Long id);
    
    @Query("SELECT COUNT(t) FROM Playlist p JOIN p.tracks t WHERE p.id = :playlistId")
    Long countTracksByPlaylistId(@Param("playlistId") Long playlistId);
    
    @Query(value = "SELECT p.* FROM playlists p " +
                   "LEFT JOIN playlist_track pt ON p.PlaylistId = pt.PlaylistId " +
                   "GROUP BY p.PlaylistId " +
                   "ORDER BY COUNT(pt.TrackId) DESC " +
                   "LIMIT :limit", 
           nativeQuery = true)
    Page<Playlist> findTopPlaylistsByTrackCount(@Param("limit") int limit, Pageable pageable);
}

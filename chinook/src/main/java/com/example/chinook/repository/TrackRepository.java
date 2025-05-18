package com.example.chinook.repository;

import com.example.chinook.entity.Track;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface TrackRepository extends JpaRepository<Track, Long> {
    
    Optional<Track> findByName(String name);
    
    Page<Track> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    List<Track> findByAlbumId(Long albumId);
    
    List<Track> findByGenreId(Long genreId);
    
    @Query("SELECT t FROM Track t " +
           "JOIN FETCH t.album a " +
           "JOIN FETCH a.artist " +
           "JOIN FETCH t.genre " +
           "JOIN FETCH t.mediaType " +
           "WHERE t.id = :id")
    Optional<Track> findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT t FROM Track t " +
           "JOIN FETCH t.album a " +
           "JOIN FETCH a.artist " +
           "WHERE t.genre.id = :genreId")
    Page<Track> findByGenreIdWithAlbumAndArtist(@Param("genreId") Long genreId, Pageable pageable);
    
    @Query("SELECT t FROM Track t " +
           "JOIN t.invoiceItems ii " +
           "GROUP BY t " +
           "ORDER BY SUM(ii.quantity) DESC")
    Page<Track> findTopSellingTracks(Pageable pageable);
    
    @Query("SELECT t FROM Track t " +
           "WHERE t.unitPrice > :minPrice")
    List<Track> findByUnitPriceGreaterThan(@Param("minPrice") BigDecimal minPrice);
    
    @Query("SELECT AVG(t.milliseconds) FROM Track t WHERE t.album.id = :albumId")
    Double findAverageTrackDurationByAlbumId(@Param("albumId") Long albumId);
}

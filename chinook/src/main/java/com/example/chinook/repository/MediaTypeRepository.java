package com.example.chinook.repository;

import com.example.chinook.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface MediaTypeRepository extends JpaRepository<MediaType, Long> {
    
    Optional<MediaType> findByName(String name);
    
    Page<MediaType> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT mt FROM MediaType mt LEFT JOIN FETCH mt.tracks WHERE mt.id = :id")
    Optional<MediaType> findByIdWithTracks(Long id);
    
    @Query("SELECT COUNT(t) FROM MediaType mt JOIN mt.tracks t WHERE mt.id = :mediaTypeId")
    Long countTracksByMediaTypeId(Long mediaTypeId);
}

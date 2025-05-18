package com.example.chinook.service;

import com.example.chinook.dto.TrackDto;
import com.example.chinook.dto.TrackDetailDto;
import com.example.chinook.dto.PageResponse;

import java.util.List;

public interface TrackService {
    
    PageResponse<TrackDto> getAllTracks(int page, int size);
    
    TrackDetailDto getTrackById(Long id);
    
    PageResponse<TrackDto> getTracksByAlbum(Long albumId, int page, int size);
    
    PageResponse<TrackDto> getTracksByGenre(Long genreId, int page, int size);
    
    List<TrackDto> searchTracksByName(String name);
    
    PageResponse<TrackDto> getTopSellingTracks(int page, int size);
    
    TrackDto createTrack(TrackDto trackDto);
    
    TrackDto updateTrack(Long id, TrackDto trackDto);
    
    void deleteTrack(Long id);
    
    Double getAverageTrackDuration(Long albumId);
}

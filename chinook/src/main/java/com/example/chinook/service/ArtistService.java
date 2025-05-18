package com.example.chinook.service;

import com.example.chinook.dto.ArtistDto;
import com.example.chinook.dto.ArtistDetailDto;
import com.example.chinook.dto.PageResponse;

import java.util.List;

public interface ArtistService {
    
    PageResponse<ArtistDto> getAllArtists(int page, int size);
    
    ArtistDetailDto getArtistById(Long id);
    
    List<ArtistDto> searchArtistsByName(String name);
    
    List<ArtistDto> getTopArtistsByAlbumCount(int limit);
    
    ArtistDto createArtist(ArtistDto artistDto);
    
    ArtistDto updateArtist(Long id, ArtistDto artistDto);
    
    void deleteArtist(Long id);
}

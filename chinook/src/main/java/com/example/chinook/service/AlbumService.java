package com.example.chinook.service;

import com.example.chinook.dto.AlbumDto;
import com.example.chinook.dto.AlbumDetailDto;
import com.example.chinook.dto.PageResponse;

import java.util.List;

public interface AlbumService {
    
    PageResponse<AlbumDto> getAllAlbums(int page, int size);
    
    AlbumDetailDto getAlbumById(Long id);
    
    PageResponse<AlbumDto> getAlbumsByArtist(Long artistId, int page, int size);
    
    List<AlbumDto> searchAlbumsByTitle(String title);
    
    List<AlbumDto> getTopAlbumsByTrackCount(int limit);
    
    AlbumDto createAlbum(AlbumDto albumDto);
    
    AlbumDto updateAlbum(Long id, AlbumDto albumDto);
    
    void deleteAlbum(Long id);
    
    Long getTrackCount(Long albumId);
}

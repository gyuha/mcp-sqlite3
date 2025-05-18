package com.example.chinook.service;

import com.example.chinook.dto.PlaylistDto;
import com.example.chinook.dto.PlaylistDetailDto;
import com.example.chinook.dto.PageResponse;

import java.util.List;

public interface PlaylistService {
    
    PageResponse<PlaylistDto> getAllPlaylists(int page, int size);
    
    PlaylistDetailDto getPlaylistById(Long id);
    
    List<PlaylistDto> searchPlaylistsByName(String name);
    
    PageResponse<PlaylistDto> getTopPlaylistsByTrackCount(int page, int size);
    
    PlaylistDto createPlaylist(PlaylistDto playlistDto);
    
    PlaylistDto updatePlaylist(Long id, PlaylistDto playlistDto);
    
    void deletePlaylist(Long id);
    
    PlaylistDetailDto addTrackToPlaylist(Long playlistId, Long trackId);
    
    PlaylistDetailDto removeTrackFromPlaylist(Long playlistId, Long trackId);
    
    Long getTrackCount(Long playlistId);
}

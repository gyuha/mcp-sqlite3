package com.example.chinook.service;

import com.example.chinook.dto.PlaylistDto;
import com.example.chinook.dto.PlaylistDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.dto.AlbumDto;
import com.example.chinook.dto.ArtistDto;
import com.example.chinook.dto.MediaTypeDto;
import com.example.chinook.dto.GenreDto;
import com.example.chinook.entity.Playlist;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.PlaylistRepository;
import com.example.chinook.repository.TrackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PlaylistServiceImpl implements PlaylistService {
    
    private final PlaylistRepository playlistRepository;
    private final TrackRepository trackRepository;
    
    @Override
    public PageResponse<PlaylistDto> getAllPlaylists(int page, int size) {
        Page<Playlist> playlistPage = playlistRepository.findAll(PageRequest.of(page, size));
        List<PlaylistDto> content = playlistPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            playlistPage.getNumber(),
            playlistPage.getSize(),
            playlistPage.getTotalElements(),
            playlistPage.getTotalPages(),
            playlistPage.isFirst(),
            playlistPage.isLast()
        );
    }
    
    @Override
    public PlaylistDetailDto getPlaylistById(Long id) {
        Playlist playlist = playlistRepository.findByIdWithTracks(id)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found with id: " + id));
        return convertToDetailDto(playlist);
    }
    
    @Override
    public List<PlaylistDto> searchPlaylistsByName(String name) {
        return playlistRepository.findByNameContainingIgnoreCase(name, PageRequest.of(0, 20))
                .getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public PageResponse<PlaylistDto> getTopPlaylistsByTrackCount(int page, int size) {
        Page<Playlist> playlistPage = playlistRepository.findTopPlaylistsByTrackCount(10, PageRequest.of(page, size));
        List<PlaylistDto> content = playlistPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            playlistPage.getNumber(),
            playlistPage.getSize(),
            playlistPage.getTotalElements(),
            playlistPage.getTotalPages(),
            playlistPage.isFirst(),
            playlistPage.isLast()
        );
    }
    
    @Override
    @Transactional
    public PlaylistDto createPlaylist(PlaylistDto playlistDto) {
        Playlist playlist = new Playlist();
        playlist.setName(playlistDto.name());
        return convertToDto(playlistRepository.save(playlist));
    }
    
    @Override
    @Transactional
    public PlaylistDto updatePlaylist(Long id, PlaylistDto playlistDto) {
        Playlist playlist = playlistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found with id: " + id));
                
        playlist.setName(playlistDto.name());
        return convertToDto(playlistRepository.save(playlist));
    }
    
    @Override
    @Transactional
    public void deletePlaylist(Long id) {
        if (!playlistRepository.existsById(id)) {
            throw new EntityNotFoundException("Playlist not found with id: " + id);
        }
        playlistRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public PlaylistDetailDto addTrackToPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found with id: " + playlistId));
                
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + trackId));
                
        playlist.getTracks().add(track);
        return convertToDetailDto(playlistRepository.save(playlist));
    }
    
    @Override
    @Transactional
    public PlaylistDetailDto removeTrackFromPlaylist(Long playlistId, Long trackId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new EntityNotFoundException("Playlist not found with id: " + playlistId));
                
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + trackId));
                
        playlist.getTracks().remove(track);
        return convertToDetailDto(playlistRepository.save(playlist));
    }
    
    @Override
    public Long getTrackCount(Long playlistId) {
        if (!playlistRepository.existsById(playlistId)) {
            throw new EntityNotFoundException("Playlist not found with id: " + playlistId);
        }
        return playlistRepository.countTracksByPlaylistId(playlistId);
    }
    
    private PlaylistDto convertToDto(Playlist playlist) {
        return new PlaylistDto(
            playlist.getId(),
            playlist.getName()
        );
    }
    
    private PlaylistDetailDto convertToDetailDto(Playlist playlist) {
        List<TrackDto> trackDtos = playlist.getTracks().stream()
                .map(track -> new TrackDto(
                    track.getId(),
                    track.getName(),
                    track.getAlbum() != null ? 
                        new AlbumDto(
                            track.getAlbum().getId(),
                            track.getAlbum().getTitle(),
                            new ArtistDto(
                                track.getAlbum().getArtist().getId(),
                                track.getAlbum().getArtist().getName()
                            )
                        ) : null,
                    track.getMediaType() != null ? 
                        new MediaTypeDto(track.getMediaType().getId(), track.getMediaType().getName()) : null,
                    track.getGenre() != null ? 
                        new GenreDto(track.getGenre().getId(), track.getGenre().getName()) : null,
                    track.getComposer(),
                    track.getMilliseconds(),
                    track.getBytes(),
                    track.getUnitPrice()
                ))
                .collect(Collectors.toList());
                
        return new PlaylistDetailDto(
            playlist.getId(),
            playlist.getName(),
            trackDtos
        );
    }
}

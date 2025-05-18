package com.example.chinook.service;

import com.example.chinook.dto.*;
import com.example.chinook.entity.*;
import com.example.chinook.repository.*;
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
public class TrackServiceImpl implements TrackService {
    
    private final TrackRepository trackRepository;
    private final AlbumRepository albumRepository;
    private final GenreRepository genreRepository;
    private final MediaTypeRepository mediaTypeRepository;
    
    @Override
    public PageResponse<TrackDto> getAllTracks(int page, int size) {
        Page<Track> trackPage = trackRepository.findAll(PageRequest.of(page, size));
        List<TrackDto> content = trackPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            trackPage.getNumber(),
            trackPage.getSize(),
            trackPage.getTotalElements(),
            trackPage.getTotalPages(),
            trackPage.isFirst(),
            trackPage.isLast()
        );
    }
    
    @Override
    public TrackDetailDto getTrackById(Long id) {
        Track track = trackRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));
        return convertToDetailDto(track);
    }
    
    @Override
    public PageResponse<TrackDto> getTracksByAlbum(Long albumId, int page, int size) {
        Page<Track> trackPage = trackRepository.findAll(PageRequest.of(page, size));
        List<TrackDto> content = trackRepository.findByAlbumId(albumId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            trackPage.getNumber(),
            trackPage.getSize(),
            trackPage.getTotalElements(),
            trackPage.getTotalPages(),
            trackPage.isFirst(),
            trackPage.isLast()
        );
    }
    
    @Override
    public PageResponse<TrackDto> getTracksByGenre(Long genreId, int page, int size) {
        Page<Track> trackPage = trackRepository.findByGenreIdWithAlbumAndArtist(genreId, PageRequest.of(page, size));
        List<TrackDto> content = trackPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            trackPage.getNumber(),
            trackPage.getSize(),
            trackPage.getTotalElements(),
            trackPage.getTotalPages(),
            trackPage.isFirst(),
            trackPage.isLast()
        );
    }
    
    @Override
    public List<TrackDto> searchTracksByName(String name) {
        return trackRepository.findByNameContainingIgnoreCase(name, PageRequest.of(0, 20))
                .getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public PageResponse<TrackDto> getTopSellingTracks(int page, int size) {
        Page<Track> trackPage = trackRepository.findTopSellingTracks(PageRequest.of(page, size));
        List<TrackDto> content = trackPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            trackPage.getNumber(),
            trackPage.getSize(),
            trackPage.getTotalElements(),
            trackPage.getTotalPages(),
            trackPage.isFirst(),
            trackPage.isLast()
        );
    }
    
    @Override
    @Transactional
    public TrackDto createTrack(TrackDto trackDto) {
        Track track = new Track();
        updateTrackFields(track, trackDto);
        return convertToDto(trackRepository.save(track));
    }
    
    @Override
    @Transactional
    public TrackDto updateTrack(Long id, TrackDto trackDto) {
        Track track = trackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Track not found with id: " + id));
        updateTrackFields(track, trackDto);
        return convertToDto(trackRepository.save(track));
    }
    
    @Override
    @Transactional
    public void deleteTrack(Long id) {
        if (!trackRepository.existsById(id)) {
            throw new EntityNotFoundException("Track not found with id: " + id);
        }
        trackRepository.deleteById(id);
    }
    
    @Override
    public Double getAverageTrackDuration(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new EntityNotFoundException("Album not found with id: " + albumId);
        }
        return trackRepository.findAverageTrackDurationByAlbumId(albumId);
    }
    
    private void updateTrackFields(Track track, TrackDto trackDto) {
        track.setName(trackDto.name());
        track.setComposer(trackDto.composer());
        track.setMilliseconds(trackDto.milliseconds());
        track.setBytes(trackDto.bytes());
        track.setUnitPrice(trackDto.unitPrice());
        
        if (trackDto.album() != null) {
            Album album = albumRepository.findById(trackDto.album().id())
                    .orElseThrow(() -> new EntityNotFoundException("Album not found with id: " + trackDto.album().id()));
            track.setAlbum(album);
        }
        
        if (trackDto.genre() != null) {
            Genre genre = genreRepository.findById(trackDto.genre().id())
                    .orElseThrow(() -> new EntityNotFoundException("Genre not found with id: " + trackDto.genre().id()));
            track.setGenre(genre);
        }
        
        if (trackDto.mediaType() != null) {
            MediaType mediaType = mediaTypeRepository.findById(trackDto.mediaType().id())
                    .orElseThrow(() -> new EntityNotFoundException("MediaType not found with id: " + trackDto.mediaType().id()));
            track.setMediaType(mediaType);
        }
    }
    
    private TrackDto convertToDto(Track track) {
        return new TrackDto(
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
        );
    }
    
    private TrackDetailDto convertToDetailDto(Track track) {
        List<PlaylistDto> playlistDtos = track.getPlaylists().stream()
                .map(playlist -> new PlaylistDto(
                    playlist.getId(),
                    playlist.getName()
                ))
                .collect(Collectors.toList());
                
        return new TrackDetailDto(
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
            track.getUnitPrice(),
            playlistDtos
        );
    }
}

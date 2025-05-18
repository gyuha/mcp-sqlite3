package com.example.chinook.service;

import com.example.chinook.dto.AlbumDto;
import com.example.chinook.dto.AlbumDetailDto;
import com.example.chinook.dto.ArtistDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.entity.Album;
import com.example.chinook.entity.Artist;
import com.example.chinook.repository.AlbumRepository;
import com.example.chinook.repository.ArtistRepository;
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
public class AlbumServiceImpl implements AlbumService {
    
    private final AlbumRepository albumRepository;
    private final ArtistRepository artistRepository;
    
    @Override
    public PageResponse<AlbumDto> getAllAlbums(int page, int size) {
        Page<Album> albumPage = albumRepository.findAll(PageRequest.of(page, size));
        List<AlbumDto> content = albumPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            albumPage.getNumber(),
            albumPage.getSize(),
            albumPage.getTotalElements(),
            albumPage.getTotalPages(),
            albumPage.isFirst(),
            albumPage.isLast()
        );
    }
    
    @Override
    public AlbumDetailDto getAlbumById(Long id) {
        Album album = albumRepository.findByIdWithArtistAndTracks(id)
                .orElseThrow(() -> new EntityNotFoundException("Album not found with id: " + id));
        return convertToDetailDto(album);
    }
    
    @Override
    public PageResponse<AlbumDto> getAlbumsByArtist(Long artistId, int page, int size) {
        Page<Album> albumPage = albumRepository.findByArtistId(artistId, PageRequest.of(page, size));
        List<AlbumDto> content = albumPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            albumPage.getNumber(),
            albumPage.getSize(),
            albumPage.getTotalElements(),
            albumPage.getTotalPages(),
            albumPage.isFirst(),
            albumPage.isLast()
        );
    }
    
    @Override
    public List<AlbumDto> searchAlbumsByTitle(String title) {
        return albumRepository.findByTitleContainingIgnoreCase(title, PageRequest.of(0, 20))
                .getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<AlbumDto> getTopAlbumsByTrackCount(int limit) {
        return albumRepository.findTopAlbumsByTrackCount(limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public AlbumDto createAlbum(AlbumDto albumDto) {
        Artist artist = artistRepository.findById(albumDto.artist().id())
                .orElseThrow(() -> new EntityNotFoundException("Artist not found with id: " + albumDto.artist().id()));
        
        Album album = new Album();
        album.setTitle(albumDto.title());
        album.setArtist(artist);
        
        return convertToDto(albumRepository.save(album));
    }
    
    @Override
    @Transactional
    public AlbumDto updateAlbum(Long id, AlbumDto albumDto) {
        Album album = albumRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Album not found with id: " + id));
        
        if (!album.getArtist().getId().equals(albumDto.artist().id())) {
            Artist newArtist = artistRepository.findById(albumDto.artist().id())
                    .orElseThrow(() -> new EntityNotFoundException("Artist not found with id: " + albumDto.artist().id()));
            album.setArtist(newArtist);
        }
        
        album.setTitle(albumDto.title());
        return convertToDto(albumRepository.save(album));
    }
    
    @Override
    @Transactional
    public void deleteAlbum(Long id) {
        if (!albumRepository.existsById(id)) {
            throw new EntityNotFoundException("Album not found with id: " + id);
        }
        albumRepository.deleteById(id);
    }
    
    @Override
    public Long getTrackCount(Long albumId) {
        if (!albumRepository.existsById(albumId)) {
            throw new EntityNotFoundException("Album not found with id: " + albumId);
        }
        return albumRepository.countTracksByAlbumId(albumId);
    }
    
    private AlbumDto convertToDto(Album album) {
        return new AlbumDto(
            album.getId(),
            album.getTitle(),
            new ArtistDto(album.getArtist().getId(), album.getArtist().getName())
        );
    }
    
    private AlbumDetailDto convertToDetailDto(Album album) {
        List<TrackDto> trackDtos = album.getTracks().stream()
                .map(track -> new TrackDto(
                    track.getId(),
                    track.getName(),
                    convertToDto(track.getAlbum()),
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
                
        return new AlbumDetailDto(
            album.getId(),
            album.getTitle(),
            new ArtistDto(album.getArtist().getId(), album.getArtist().getName()),
            trackDtos
        );
    }
}

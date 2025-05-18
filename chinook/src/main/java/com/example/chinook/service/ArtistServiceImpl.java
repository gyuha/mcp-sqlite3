package com.example.chinook.service;

import com.example.chinook.dto.AlbumDto;
import com.example.chinook.dto.ArtistDto;
import com.example.chinook.dto.ArtistDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.entity.Artist;
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
public class ArtistServiceImpl implements ArtistService {
    
    private final ArtistRepository artistRepository;
    
    @Override
    public PageResponse<ArtistDto> getAllArtists(int page, int size) {
        Page<Artist> artistPage = artistRepository.findAll(PageRequest.of(page, size));
        List<ArtistDto> content = artistPage.getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        return new PageResponse<>(
            content,
            artistPage.getNumber(),
            artistPage.getSize(),
            artistPage.getTotalElements(),
            artistPage.getTotalPages(),
            artistPage.isFirst(),
            artistPage.isLast()
        );
    }
    
    @Override
    public ArtistDetailDto getArtistById(Long id) {
        Artist artist = artistRepository.findByIdWithAlbums(id)
                .orElseThrow(() -> new EntityNotFoundException("Artist not found with id: " + id));
        return convertToDetailDto(artist);
    }
    
    @Override
    public List<ArtistDto> searchArtistsByName(String name) {
        return artistRepository.findByNameContainingIgnoreCase(name, PageRequest.of(0, 20))
                .getContent().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<ArtistDto> getTopArtistsByAlbumCount(int limit) {
        return artistRepository.findTopArtistsByAlbumCount(limit).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional
    public ArtistDto createArtist(ArtistDto artistDto) {
        Artist artist = new Artist();
        artist.setName(artistDto.name());
        return convertToDto(artistRepository.save(artist));
    }
    
    @Override
    @Transactional
    public ArtistDto updateArtist(Long id, ArtistDto artistDto) {
        Artist artist = artistRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Artist not found with id: " + id));
        
        artist.setName(artistDto.name());
        return convertToDto(artistRepository.save(artist));
    }
    
    @Override
    @Transactional
    public void deleteArtist(Long id) {
        if (!artistRepository.existsById(id)) {
            throw new EntityNotFoundException("Artist not found with id: " + id);
        }
        artistRepository.deleteById(id);
    }
    
    private ArtistDto convertToDto(Artist artist) {
        return new ArtistDto(artist.getId(), artist.getName());
    }
    
    private ArtistDetailDto convertToDetailDto(Artist artist) {
        List<AlbumDto> albumDtos = artist.getAlbums().stream()
                .map(album -> new AlbumDto(
                    album.getId(),
                    album.getTitle(),
                    convertToDto(album.getArtist())
                ))
                .collect(Collectors.toList());
                
        return new ArtistDetailDto(
            artist.getId(),
            artist.getName(),
            albumDtos
        );
    }
}

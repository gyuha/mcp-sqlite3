package com.example.chinook.service;

import com.example.chinook.dto.MediaTypeDto;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.entity.MediaType;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.MediaTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MediaTypeServiceImpl implements MediaTypeService {

    private final MediaTypeRepository mediaTypeRepository;

    private MediaTypeDto toDto(MediaType mediaType) {
        return new MediaTypeDto(
            mediaType.getId(),
            mediaType.getName()
        );
    }

    private TrackDto toTrackDto(Track track) {
        return new TrackDto(
            track.getId(),
            track.getName(),
            null, // AlbumDto
            null, // MediaTypeDto
            null, // GenreDto
            track.getComposer(),
            track.getMilliseconds(),
            track.getBytes(),
            track.getUnitPrice()
        );
    }

    private MediaType toEntity(MediaTypeDto dto) {
        MediaType mediaType = new MediaType();
        updateMediaTypeFromDto(mediaType, dto);
        return mediaType;
    }

    private void updateMediaTypeFromDto(MediaType mediaType, MediaTypeDto dto) {
        mediaType.setName(dto.name());
    }

    @Override
    @Transactional
    public MediaTypeDto createMediaType(MediaTypeDto mediaTypeDto) {
        mediaTypeRepository.findByName(mediaTypeDto.name())
            .ifPresent(mt -> {
                throw new IllegalArgumentException("이미 존재하는 미디어 타입 이름입니다: " + mediaTypeDto.name());
            });

        MediaType mediaType = toEntity(mediaTypeDto);
        return toDto(mediaTypeRepository.save(mediaType));
    }

    @Override
    @Transactional
    @CacheEvict(value = "mediaTypes", key = "#id")
    public MediaTypeDto updateMediaType(Long id, MediaTypeDto mediaTypeDto) {
        MediaType mediaType = mediaTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + id));

        mediaTypeRepository.findByName(mediaTypeDto.name())
            .filter(mt -> !mt.getId().equals(id))
            .ifPresent(mt -> {
                throw new IllegalArgumentException("이미 존재하는 미디어 타입 이름입니다: " + mediaTypeDto.name());
            });

        updateMediaTypeFromDto(mediaType, mediaTypeDto);
        return toDto(mediaType);
    }

    @Override
    @Transactional
    @CacheEvict(value = "mediaTypes", key = "#id")
    public void deleteMediaType(Long id) {
        MediaType mediaType = mediaTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + id));

        if (!mediaType.getTracks().isEmpty()) {
            throw new IllegalStateException("트랙이 있는 미디어 타입은 삭제할 수 없습니다.");
        }

        mediaTypeRepository.deleteById(id);
    }

    @Override
    @Cacheable(value = "mediaTypes", key = "#id")
    public MediaTypeDto getMediaType(Long id) {
        return mediaTypeRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + id));
    }

    @Override
    public MediaTypeDto getMediaTypeWithTracks(Long id) {
        return mediaTypeRepository.findByIdWithTracks(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + id));
    }

    @Override
    @Cacheable(value = "mediaTypes", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<MediaTypeDto> getAllMediaTypes(Pageable pageable) {
        return mediaTypeRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public Page<MediaTypeDto> searchMediaTypesByName(String name, Pageable pageable) {
        return mediaTypeRepository.findByNameContainingIgnoreCase(name, pageable)
            .map(this::toDto);
    }

    @Override
    public Long getMediaTypeTrackCount(Long mediaTypeId) {
        if (!mediaTypeRepository.existsById(mediaTypeId)) {
            throw new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + mediaTypeId);
        }
        return mediaTypeRepository.countTracksByMediaTypeId(mediaTypeId);
    }

    @Override
    public List<TrackDto> getMediaTypeTracks(Long mediaTypeId) {
        return mediaTypeRepository.findByIdWithTracks(mediaTypeId)
            .map(mediaType -> mediaType.getTracks().stream()
                .map(this::toTrackDto)
                .collect(Collectors.toList()))
            .orElseThrow(() -> new EntityNotFoundException("미디어 타입을 찾을 수 없습니다: " + mediaTypeId));
    }
}

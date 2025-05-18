package com.example.chinook.service;

import com.example.chinook.dto.MediaTypeDto;
import com.example.chinook.dto.TrackDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface MediaTypeService {
    MediaTypeDto createMediaType(MediaTypeDto mediaTypeDto);
    MediaTypeDto updateMediaType(Long id, MediaTypeDto mediaTypeDto);
    void deleteMediaType(Long id);
    MediaTypeDto getMediaType(Long id);
    MediaTypeDto getMediaTypeWithTracks(Long id);
    Page<MediaTypeDto> getAllMediaTypes(Pageable pageable);
    Page<MediaTypeDto> searchMediaTypesByName(String name, Pageable pageable);
    Long getMediaTypeTrackCount(Long mediaTypeId);
    List<TrackDto> getMediaTypeTracks(Long mediaTypeId);
}

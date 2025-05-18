package com.example.chinook.service;

import com.example.chinook.dto.MediaTypeDto;
import com.example.chinook.entity.MediaType;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.MediaTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaTypeServiceTest {

    @Mock
    private MediaTypeRepository mediaTypeRepository;

    @InjectMocks
    private MediaTypeServiceImpl mediaTypeService;

    private MediaType testMediaType;
    private MediaTypeDto testMediaTypeDto;

    @BeforeEach
    void setUp() {
        testMediaType = new MediaType();
        testMediaType.setId(1L);
        testMediaType.setName("MPEG Audio");

        testMediaTypeDto = new MediaTypeDto(
            testMediaType.getId(),
            testMediaType.getName()
        );
    }

    @Test
    void createMediaType_Success() {
        when(mediaTypeRepository.findByName(testMediaTypeDto.name())).thenReturn(Optional.empty());
        when(mediaTypeRepository.save(any(MediaType.class))).thenReturn(testMediaType);

        MediaTypeDto result = mediaTypeService.createMediaType(testMediaTypeDto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo(testMediaTypeDto.name());
        verify(mediaTypeRepository).save(any(MediaType.class));
    }

    @Test
    void createMediaType_DuplicateName() {
        when(mediaTypeRepository.findByName(testMediaTypeDto.name())).thenReturn(Optional.of(testMediaType));

        assertThatThrownBy(() -> mediaTypeService.createMediaType(testMediaTypeDto))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 미디어 타입 이름입니다");
    }

    @Test
    void updateMediaType_Success() {
        when(mediaTypeRepository.findById(1L)).thenReturn(Optional.of(testMediaType));
        when(mediaTypeRepository.findByName("New MediaType")).thenReturn(Optional.empty());

        MediaTypeDto updatedDto = new MediaTypeDto(testMediaType.getId(), "New MediaType");
        MediaTypeDto result = mediaTypeService.updateMediaType(1L, updatedDto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("New MediaType");
    }

    @Test
    void getMediaTypeWithTracks_Success() {
        Track track = new Track();
        track.setId(1L);
        track.setName("Test Track");
        testMediaType.getTracks().add(track);

        when(mediaTypeRepository.findByIdWithTracks(1L)).thenReturn(Optional.of(testMediaType));

        MediaTypeDto result = mediaTypeService.getMediaTypeWithTracks(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testMediaType.getId());
    }

    @Test
    void getAllMediaTypes_Success() {
        List<MediaType> mediaTypes = Arrays.asList(testMediaType);
        Page<MediaType> mediaTypePage = new PageImpl<>(mediaTypes);
        Pageable pageable = PageRequest.of(0, 10);

        when(mediaTypeRepository.findAll(pageable)).thenReturn(mediaTypePage);

        Page<MediaTypeDto> result = mediaTypeService.getAllMediaTypes(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo(testMediaType.getName());
    }

    @Test
    void searchMediaTypesByName_Success() {
        List<MediaType> mediaTypes = Arrays.asList(testMediaType);
        Page<MediaType> mediaTypePage = new PageImpl<>(mediaTypes);
        Pageable pageable = PageRequest.of(0, 10);

        when(mediaTypeRepository.findByNameContainingIgnoreCase("MPEG", pageable))
            .thenReturn(mediaTypePage);

        Page<MediaTypeDto> result = mediaTypeService.searchMediaTypesByName("MPEG", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).name()).isEqualTo(testMediaType.getName());
    }

    @Test
    void deleteMediaType_WithTracks() {
        Track track = new Track();
        track.setId(1L);
        testMediaType.setTracks(new ArrayList<>(Arrays.asList(track)));

        when(mediaTypeRepository.findById(1L)).thenReturn(Optional.of(testMediaType));

        assertThatThrownBy(() -> mediaTypeService.deleteMediaType(1L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("트랙이 있는 미디어 타입은 삭제할 수 없습니다");
    }

    @Test
    void getMediaTypeTrackCount_Success() {
        when(mediaTypeRepository.existsById(1L)).thenReturn(true);
        when(mediaTypeRepository.countTracksByMediaTypeId(1L)).thenReturn(5L);

        Long result = mediaTypeService.getMediaTypeTrackCount(1L);

        assertThat(result).isEqualTo(5L);
    }
}

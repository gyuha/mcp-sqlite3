package com.example.chinook.controller;

import com.example.chinook.dto.MediaTypeDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.service.MediaTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/media-types")
@RequiredArgsConstructor
@Tag(name = "MediaType", description = "미디어 타입 관리 API")
public class MediaTypeController {

    private final MediaTypeService mediaTypeService;

    @Operation(summary = "전체 미디어 타입 목록 조회", description = "페이지네이션을 적용하여 전체 미디어 타입 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<MediaTypeDto>> getAllMediaTypes(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 필드") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "정렬 방향 (asc/desc)") @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<MediaTypeDto> mediaTypePage = mediaTypeService.getAllMediaTypes(pageable);
        
        PageResponse<MediaTypeDto> response = new PageResponse<>(
            mediaTypePage.getContent(),
            mediaTypePage.getNumber(),
            mediaTypePage.getSize(),
            mediaTypePage.getTotalElements(),
            mediaTypePage.getTotalPages(),
            mediaTypePage.isFirst(),
            mediaTypePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "미디어 타입 검색", description = "이름으로 미디어 타입을 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<MediaTypeDto>> searchMediaTypes(
            @Parameter(description = "검색할 미디어 타입 이름 (부분 일치)") @RequestParam String name,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<MediaTypeDto> mediaTypePage = mediaTypeService.searchMediaTypesByName(name, pageable);
        
        PageResponse<MediaTypeDto> response = new PageResponse<>(
            mediaTypePage.getContent(),
            mediaTypePage.getNumber(),
            mediaTypePage.getSize(),
            mediaTypePage.getTotalElements(),
            mediaTypePage.getTotalPages(),
            mediaTypePage.isFirst(),
            mediaTypePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "미디어 타입 상세 조회", description = "미디어 타입 ID로 미디어 타입 상세 정보를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "미디어 타입 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<MediaTypeDto> getMediaTypeById(
            @Parameter(description = "미디어 타입 ID") @PathVariable Long id) {
        MediaTypeDto mediaType = mediaTypeService.getMediaType(id);
        return ResponseEntity.ok(mediaType);
    }

    @Operation(summary = "미디어 타입 트랙 조회", description = "미디어 타입에 속한 모든 트랙을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "미디어 타입 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/tracks")
    public ResponseEntity<List<TrackDto>> getMediaTypeTracks(
            @Parameter(description = "미디어 타입 ID") @PathVariable Long id) {
        List<TrackDto> tracks = mediaTypeService.getMediaTypeTracks(id);
        return ResponseEntity.ok(tracks);
    }

    @Operation(summary = "미디어 타입 생성", description = "새로운 미디어 타입을 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "미디어 타입 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<MediaTypeDto> createMediaType(
            @Parameter(description = "생성할 미디어 타입 정보") @Valid @RequestBody MediaTypeDto mediaTypeDto) {
        MediaTypeDto created = mediaTypeService.createMediaType(mediaTypeDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "미디어 타입 수정", description = "기존 미디어 타입 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "미디어 타입 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<MediaTypeDto> updateMediaType(
            @Parameter(description = "수정할 미디어 타입 ID") @PathVariable Long id,
            @Parameter(description = "수정할 미디어 타입 정보") @Valid @RequestBody MediaTypeDto mediaTypeDto) {
        MediaTypeDto updated = mediaTypeService.updateMediaType(id, mediaTypeDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "미디어 타입 삭제", description = "미디어 타입을 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "미디어 타입 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMediaType(
            @Parameter(description = "삭제할 미디어 타입 ID") @PathVariable Long id) {
        mediaTypeService.deleteMediaType(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "미디어 타입 트랙 수 조회", description = "미디어 타입에 속한 트랙의 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "미디어 타입 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/track-count")
    public ResponseEntity<Long> getMediaTypeTrackCount(
            @Parameter(description = "미디어 타입 ID") @PathVariable Long id) {
        Long count = mediaTypeService.getMediaTypeTrackCount(id);
        return ResponseEntity.ok(count);
    }
}

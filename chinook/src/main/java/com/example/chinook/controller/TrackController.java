package com.example.chinook.controller;

import com.example.chinook.dto.TrackDto;
import com.example.chinook.dto.TrackDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.TrackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracks")
@RequiredArgsConstructor
@Tag(name = "Track", description = "트랙 관리 API")
public class TrackController {

    private final TrackService trackService;

    @Operation(summary = "전체 트랙 목록 조회", description = "페이지네이션을 적용하여 전체 트랙 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<TrackDto>> getAllTracks(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<TrackDto> response = trackService.getAllTracks(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "트랙 상세 조회", description = "트랙 ID로 트랙 상세 정보와 포함된 재생목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "트랙 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TrackDetailDto> getTrackById(
            @Parameter(description = "트랙 ID") @PathVariable Long id) {
        TrackDetailDto track = trackService.getTrackById(id);
        return ResponseEntity.ok(track);
    }

    @Operation(summary = "앨범별 트랙 조회", description = "앨범 ID로 해당 앨범의 트랙 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/album/{albumId}")
    public ResponseEntity<PageResponse<TrackDto>> getTracksByAlbum(
            @Parameter(description = "앨범 ID") @PathVariable Long albumId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<TrackDto> response = trackService.getTracksByAlbum(albumId, page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "장르별 트랙 조회", description = "장르 ID로 해당 장르의 트랙 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/genre/{genreId}")
    public ResponseEntity<PageResponse<TrackDto>> getTracksByGenre(
            @Parameter(description = "장르 ID") @PathVariable Long genreId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<TrackDto> response = trackService.getTracksByGenre(genreId, page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "트랙 검색", description = "이름으로 트랙을 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<List<TrackDto>> searchTracks(
            @Parameter(description = "검색할 트랙 이름 (부분 일치)") @RequestParam String name) {
        List<TrackDto> tracks = trackService.searchTracksByName(name);
        return ResponseEntity.ok(tracks);
    }

    @Operation(summary = "가장 많이 팔린 트랙 조회", description = "판매량 기준으로 인기 트랙을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/top-selling")
    public ResponseEntity<PageResponse<TrackDto>> getTopSellingTracks(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<TrackDto> response = trackService.getTopSellingTracks(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "트랙 생성", description = "새로운 트랙을 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "트랙 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<TrackDto> createTrack(
            @Parameter(description = "생성할 트랙 정보") @Valid @RequestBody TrackDto trackDto) {
        TrackDto created = trackService.createTrack(trackDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "트랙 수정", description = "기존 트랙 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "트랙 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TrackDto> updateTrack(
            @Parameter(description = "수정할 트랙 ID") @PathVariable Long id,
            @Parameter(description = "수정할 트랙 정보") @Valid @RequestBody TrackDto trackDto) {
        TrackDto updated = trackService.updateTrack(id, trackDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "트랙 삭제", description = "트랙을 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "트랙 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrack(
            @Parameter(description = "삭제할 트랙 ID") @PathVariable Long id) {
        trackService.deleteTrack(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "앨범 트랙 평균 재생 시간", description = "특정 앨범의 트랙들의 평균 재생 시간을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/album/{albumId}/average-duration")
    public ResponseEntity<Double> getAverageTrackDuration(
            @Parameter(description = "앨범 ID") @PathVariable Long albumId) {
        Double avgDuration = trackService.getAverageTrackDuration(albumId);
        return ResponseEntity.ok(avgDuration);
    }
}

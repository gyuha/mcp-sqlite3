package com.example.chinook.controller;

import com.example.chinook.dto.AlbumDto;
import com.example.chinook.dto.AlbumDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.AlbumService;
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
@RequestMapping("/api/albums")
@RequiredArgsConstructor
@Tag(name = "Album", description = "앨범 관리 API")
public class AlbumController {

    private final AlbumService albumService;

    @Operation(summary = "전체 앨범 목록 조회", description = "페이지네이션을 적용하여 전체 앨범 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<AlbumDto>> getAllAlbums(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<AlbumDto> response = albumService.getAllAlbums(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "앨범 상세 조회", description = "앨범 ID로 앨범 상세 정보와 트랙 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AlbumDetailDto> getAlbumById(
            @Parameter(description = "앨범 ID") @PathVariable Long id) {
        AlbumDetailDto album = albumService.getAlbumById(id);
        return ResponseEntity.ok(album);
    }

    @Operation(summary = "아티스트별 앨범 조회", description = "아티스트 ID로 해당 아티스트의 앨범 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "아티스트 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<PageResponse<AlbumDto>> getAlbumsByArtist(
            @Parameter(description = "아티스트 ID") @PathVariable Long artistId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<AlbumDto> response = albumService.getAlbumsByArtist(artistId, page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "앨범 검색", description = "제목으로 앨범을 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<List<AlbumDto>> searchAlbums(
            @Parameter(description = "검색할 앨범 제목 (부분 일치)") @RequestParam String title) {
        List<AlbumDto> albums = albumService.searchAlbumsByTitle(title);
        return ResponseEntity.ok(albums);
    }

    @Operation(summary = "트랙이 많은 앨범 조회", description = "트랙 수를 기준으로 상위 앨범을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/top")
    public ResponseEntity<List<AlbumDto>> getTopAlbums(
            @Parameter(description = "조회할 앨범 수") @RequestParam(defaultValue = "5") int limit) {
        List<AlbumDto> albums = albumService.getTopAlbumsByTrackCount(limit);
        return ResponseEntity.ok(albums);
    }

    @Operation(summary = "앨범 생성", description = "새로운 앨범을 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "앨범 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<AlbumDto> createAlbum(
            @Parameter(description = "생성할 앨범 정보") @Valid @RequestBody AlbumDto albumDto) {
        AlbumDto created = albumService.createAlbum(albumDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "앨범 수정", description = "기존 앨범 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AlbumDto> updateAlbum(
            @Parameter(description = "수정할 앨범 ID") @PathVariable Long id,
            @Parameter(description = "수정할 앨범 정보") @Valid @RequestBody AlbumDto albumDto) {
        AlbumDto updated = albumService.updateAlbum(id, albumDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "앨범 삭제", description = "앨범을 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(
            @Parameter(description = "삭제할 앨범 ID") @PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "앨범 트랙 수 조회", description = "앨범에 포함된 트랙의 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "앨범 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/track-count")
    public ResponseEntity<Long> getAlbumTrackCount(
            @Parameter(description = "앨범 ID") @PathVariable Long id) {
        Long count = albumService.getTrackCount(id);
        return ResponseEntity.ok(count);
    }
}

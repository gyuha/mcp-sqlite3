package com.example.chinook.controller;

import com.example.chinook.dto.PlaylistDto;
import com.example.chinook.dto.PlaylistDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.PlaylistService;
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
@RequestMapping("/api/playlists")
@RequiredArgsConstructor
@Tag(name = "Playlist", description = "재생목록 관리 API")
public class PlaylistController {

    private final PlaylistService playlistService;

    @Operation(summary = "전체 재생목록 조회", description = "페이지네이션을 적용하여 전체 재생목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<PlaylistDto>> getAllPlaylists(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<PlaylistDto> response = playlistService.getAllPlaylists(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "재생목록 상세 조회", description = "재생목록 ID로 재생목록 상세 정보와 포함된 트랙을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "재생목록 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDetailDto> getPlaylistById(
            @Parameter(description = "재생목록 ID") @PathVariable Long id) {
        PlaylistDetailDto playlist = playlistService.getPlaylistById(id);
        return ResponseEntity.ok(playlist);
    }

    @Operation(summary = "재생목록 검색", description = "이름으로 재생목록을 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<List<PlaylistDto>> searchPlaylists(
            @Parameter(description = "검색할 재생목록 이름 (부분 일치)") @RequestParam String name) {
        List<PlaylistDto> playlists = playlistService.searchPlaylistsByName(name);
        return ResponseEntity.ok(playlists);
    }

    @Operation(summary = "인기 재생목록 조회", description = "트랙 수 기준으로 인기 재생목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/popular")
    public ResponseEntity<PageResponse<PlaylistDto>> getTopPlaylists(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<PlaylistDto> response = playlistService.getTopPlaylistsByTrackCount(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "재생목록 생성", description = "새로운 재생목록을 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "재생목록 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<PlaylistDto> createPlaylist(
            @Parameter(description = "생성할 재생목록 정보") @Valid @RequestBody PlaylistDto playlistDto) {
        PlaylistDto created = playlistService.createPlaylist(playlistDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "재생목록 수정", description = "기존 재생목록 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "재생목록 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<PlaylistDto> updatePlaylist(
            @Parameter(description = "수정할 재생목록 ID") @PathVariable Long id,
            @Parameter(description = "수정할 재생목록 정보") @Valid @RequestBody PlaylistDto playlistDto) {
        PlaylistDto updated = playlistService.updatePlaylist(id, playlistDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "재생목록 삭제", description = "재생목록을 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "재생목록 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlaylist(
            @Parameter(description = "삭제할 재생목록 ID") @PathVariable Long id) {
        playlistService.deletePlaylist(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "재생목록에 트랙 추가", description = "재생목록에 새로운 트랙을 추가합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "트랙 추가 성공"),
        @ApiResponse(responseCode = "404", description = "재생목록 또는 트랙 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<PlaylistDetailDto> addTrackToPlaylist(
            @Parameter(description = "재생목록 ID") @PathVariable Long playlistId,
            @Parameter(description = "트랙 ID") @PathVariable Long trackId) {
        PlaylistDetailDto updated = playlistService.addTrackToPlaylist(playlistId, trackId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "재생목록에서 트랙 제거", description = "재생목록에서 트랙을 제거합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "트랙 제거 성공"),
        @ApiResponse(responseCode = "404", description = "재생목록 또는 트랙 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{playlistId}/tracks/{trackId}")
    public ResponseEntity<PlaylistDetailDto> removeTrackFromPlaylist(
            @Parameter(description = "재생목록 ID") @PathVariable Long playlistId,
            @Parameter(description = "트랙 ID") @PathVariable Long trackId) {
        PlaylistDetailDto updated = playlistService.removeTrackFromPlaylist(playlistId, trackId);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "재생목록 트랙 수 조회", description = "재생목록에 포함된 트랙의 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "재생목록 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/track-count")
    public ResponseEntity<Long> getPlaylistTrackCount(
            @Parameter(description = "재생목록 ID") @PathVariable Long id) {
        Long count = playlistService.getTrackCount(id);
        return ResponseEntity.ok(count);
    }
}

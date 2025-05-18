package com.example.chinook.controller;

import com.example.chinook.dto.ArtistDto;
import com.example.chinook.dto.ArtistDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.ArtistService;
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
@RequestMapping("/api/artists")
@RequiredArgsConstructor
@Tag(name = "Artist", description = "아티스트 관리 API")
public class ArtistController {

    private final ArtistService artistService;

    @Operation(summary = "전체 아티스트 목록 조회", description = "페이지네이션을 적용하여 전체 아티스트 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<ArtistDto>> getAllArtists(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        PageResponse<ArtistDto> response = artistService.getAllArtists(page, size);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "아티스트 검색", description = "이름으로 아티스트를 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<List<ArtistDto>> searchArtists(
            @Parameter(description = "검색할 아티스트 이름 (부분 일치)") @RequestParam String name) {
        List<ArtistDto> artists = artistService.searchArtistsByName(name);
        return ResponseEntity.ok(artists);
    }

    @Operation(summary = "아티스트 상세 조회", description = "아티스트 ID로 아티스트 상세 정보와 앨범 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "아티스트 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ArtistDetailDto> getArtistById(
            @Parameter(description = "아티스트 ID") @PathVariable Long id) {
        ArtistDetailDto artist = artistService.getArtistById(id);
        return ResponseEntity.ok(artist);
    }

    @Operation(summary = "앨범이 많은 아티스트 조회", description = "앨범 수를 기준으로 상위 아티스트를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/top")
    public ResponseEntity<List<ArtistDto>> getTopArtists(
            @Parameter(description = "조회할 아티스트 수") @RequestParam(defaultValue = "5") int limit) {
        List<ArtistDto> artists = artistService.getTopArtistsByAlbumCount(limit);
        return ResponseEntity.ok(artists);
    }

    @Operation(summary = "아티스트 생성", description = "새로운 아티스트를 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "아티스트 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<ArtistDto> createArtist(
            @Parameter(description = "생성할 아티스트 정보") @Valid @RequestBody ArtistDto artistDto) {
        ArtistDto created = artistService.createArtist(artistDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "아티스트 수정", description = "기존 아티스트 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "아티스트 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ArtistDto> updateArtist(
            @Parameter(description = "수정할 아티스트 ID") @PathVariable Long id,
            @Parameter(description = "수정할 아티스트 정보") @Valid @RequestBody ArtistDto artistDto) {
        ArtistDto updated = artistService.updateArtist(id, artistDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "아티스트 삭제", description = "아티스트를 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "아티스트 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtist(
            @Parameter(description = "삭제할 아티스트 ID") @PathVariable Long id) {
        artistService.deleteArtist(id);
        return ResponseEntity.noContent().build();
    }
}

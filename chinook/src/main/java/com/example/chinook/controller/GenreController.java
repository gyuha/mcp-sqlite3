package com.example.chinook.controller;

import com.example.chinook.dto.GenreDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.service.GenreService;
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
@RequestMapping("/api/genres")
@RequiredArgsConstructor
@Tag(name = "Genre", description = "장르 관리 API")
public class GenreController {

    private final GenreService genreService;

    @Operation(summary = "전체 장르 목록 조회", description = "페이지네이션을 적용하여 전체 장르 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<GenreDto>> getAllGenres(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 필드") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "정렬 방향 (asc/desc)") @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<GenreDto> genrePage = genreService.getAllGenres(pageable);
        
        PageResponse<GenreDto> response = new PageResponse<>(
            genrePage.getContent(),
            genrePage.getNumber(),
            genrePage.getSize(),
            genrePage.getTotalElements(),
            genrePage.getTotalPages()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "장르 검색", description = "이름으로 장르를 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "검색 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<GenreDto>> searchGenres(
            @Parameter(description = "검색할 장르 이름 (부분 일치)") @RequestParam String name,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<GenreDto> genrePage = genreService.searchGenresByName(name, pageable);
        
        PageResponse<GenreDto> response = new PageResponse<>(
            genrePage.getContent(),
            genrePage.getNumber(),
            genrePage.getSize(),
            genrePage.getTotalElements(),
            genrePage.getTotalPages()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "장르 상세 조회", description = "장르 ID로 장르 상세 정보를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GenreDto> getGenreById(
            @Parameter(description = "장르 ID") @PathVariable Long id) {
        GenreDto genre = genreService.getGenre(id);
        return ResponseEntity.ok(genre);
    }

    @Operation(summary = "장르 트랙 조회", description = "장르에 속한 모든 트랙을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/tracks")
    public ResponseEntity<List<TrackDto>> getGenreTracks(
            @Parameter(description = "장르 ID") @PathVariable Long id) {
        List<TrackDto> tracks = genreService.getGenreTracks(id);
        return ResponseEntity.ok(tracks);
    }

    @Operation(summary = "가장 인기 있는 장르 조회", description = "트랙 수 기준으로 가장 인기 있는 장르를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/popular")
    public ResponseEntity<List<GenreDto>> getTopGenres(
            @Parameter(description = "조회할 장르 수") @RequestParam(defaultValue = "5") int limit) {
        List<GenreDto> genres = genreService.getTopGenresByTrackCount(limit);
        return ResponseEntity.ok(genres);
    }

    @Operation(summary = "장르 생성", description = "새로운 장르를 생성합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "장르 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<GenreDto> createGenre(
            @Parameter(description = "생성할 장르 정보") @Valid @RequestBody GenreDto genreDto) {
        GenreDto created = genreService.createGenre(genreDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(summary = "장르 수정", description = "기존 장르 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<GenreDto> updateGenre(
            @Parameter(description = "수정할 장르 ID") @PathVariable Long id,
            @Parameter(description = "수정할 장르 정보") @Valid @RequestBody GenreDto genreDto) {
        GenreDto updated = genreService.updateGenre(id, genreDto);
        return ResponseEntity.ok(updated);
    }

    @Operation(summary = "장르 삭제", description = "장르를 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGenre(
            @Parameter(description = "삭제할 장르 ID") @PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "장르 트랙 수 조회", description = "장르에 속한 트랙의 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "장르 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/track-count")
    public ResponseEntity<Long> getGenreTrackCount(
            @Parameter(description = "장르 ID") @PathVariable Long id) {
        Long count = genreService.getGenreTrackCount(id);
        return ResponseEntity.ok(count);
    }
}

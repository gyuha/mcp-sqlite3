package com.example.chinook.controller;

import com.example.chinook.dto.GenreDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.GenreService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(GenreController.class)
public class GenreControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GenreService genreService;

    @Test
    @DisplayName("모든 장르를 페이지로 조회")
    public void testGetAllGenres() throws Exception {
        // Given
        List<GenreDto> genres = Arrays.asList(
            new GenreDto(1L, "Rock"),
            new GenreDto(2L, "Jazz"),
            new GenreDto(3L, "Metal")
        );
        
        PageImpl<GenreDto> genrePage = new PageImpl<>(genres, 
            PageRequest.of(0, 10, Sort.Direction.ASC, "id"), 
            genres.size());
        
        when(genreService.getAllGenres(any(Pageable.class))).thenReturn(genrePage);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/genres")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.content[0].name").value("Rock"))
                .andExpect(jsonPath("$.content[1].name").value("Jazz"))
                .andExpect(jsonPath("$.content[2].name").value("Metal"))
                .andExpect(jsonPath("$.pageNumber").value(0))
                .andExpect(jsonPath("$.pageSize").value(10))
                .andExpect(jsonPath("$.totalElements").value(3));
    }

    @Test
    @DisplayName("ID로 장르 조회")
    public void testGetGenreById() throws Exception {
        // Given
        GenreDto genre = new GenreDto(1L, "Rock");
        when(genreService.getGenre(eq(1L))).thenReturn(genre);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/genres/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Rock"));
    }

    @Test
    @DisplayName("장르 검색")
    public void testSearchGenres() throws Exception {
        // Given
        List<GenreDto> genres = Arrays.asList(
            new GenreDto(1L, "Rock"),
            new GenreDto(3L, "Metal")
        );
        
        PageImpl<GenreDto> genrePage = new PageImpl<>(genres, 
            PageRequest.of(0, 10), 
            genres.size());
        
        when(genreService.searchGenresByName(eq("Rock"), any(Pageable.class))).thenReturn(genrePage);

        // When & Then
        mockMvc.perform(MockMvcRequestBuilders.get("/api/genres/search")
                .param("name", "Rock")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].name").value("Rock"));
    }

    // 여기에 더 많은 테스트 메서드를 추가할 수 있습니다.
}

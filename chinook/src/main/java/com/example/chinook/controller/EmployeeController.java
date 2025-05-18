package com.example.chinook.controller;

import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.dto.EmployeeDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.EmployeeService;
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
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@Tag(name = "Employee", description = "직원 관리 API")
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "전체 직원 목록 조회", description = "페이지네이션을 적용하여 전체 직원 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<EmployeeDto>> getAllEmployees(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 필드") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "정렬 방향 (asc/desc)") @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<EmployeeDto> employeePage = employeeService.getAllEmployees(pageable);
        
        PageResponse<EmployeeDto> response = new PageResponse<>(
            employeePage.getContent(),
            employeePage.getNumber(),
            employeePage.getSize(),
            employeePage.getTotalElements(),
            employeePage.getTotalPages(),
            employeePage.isFirst(),
            employeePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "직원 상세 정보 조회", description = "직원 ID로 상세 정보를 조회합니다 (부하 직원 및 담당 고객 포함)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDetailDto> getEmployeeDetail(
            @Parameter(description = "직원 ID") @PathVariable Long id) {
        
        EmployeeDetailDto employee = employeeService.getEmployeeDetail(id);
        return ResponseEntity.ok(employee);
    }

    @Operation(summary = "성으로 직원 검색", description = "직원의 성(lastName)으로 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<EmployeeDto>> searchEmployeesByLastName(
            @Parameter(description = "검색할 성") @RequestParam String lastName,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<EmployeeDto> employeePage = employeeService.searchEmployeesByLastName(lastName, pageable);
        
        PageResponse<EmployeeDto> response = new PageResponse<>(
            employeePage.getContent(),
            employeePage.getNumber(),
            employeePage.getSize(),
            employeePage.getTotalElements(),
            employeePage.getTotalPages(),
            employeePage.isFirst(),
            employeePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "부하 직원 목록 조회", description = "특정 관리자의 부하 직원 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/subordinates/{managerId}")
    public ResponseEntity<List<EmployeeDto>> getSubordinates(
            @Parameter(description = "관리자 ID") @PathVariable Long managerId) {
        
        List<EmployeeDto> subordinates = employeeService.getSubordinates(managerId);
        return ResponseEntity.ok(subordinates);
    }

    @Operation(summary = "관리자 목록 조회", description = "모든 관리자 직원을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/managers")
    public ResponseEntity<List<EmployeeDto>> getAllManagers() {
        List<EmployeeDto> managers = employeeService.getAllManagers();
        return ResponseEntity.ok(managers);
    }

    @Operation(summary = "매출 기준 상위 직원 조회", description = "매출 기준 상위 직원을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/top-sales")
    public ResponseEntity<List<EmployeeDto>> getTopEmployeesBySales(
            @Parameter(description = "조회할 직원 수") @RequestParam(defaultValue = "5") int limit) {
        
        Pageable pageable = PageRequest.of(0, limit);
        List<EmployeeDto> employees = employeeService.getTopEmployeesBySales(pageable);
        return ResponseEntity.ok(employees);
    }

    @Operation(summary = "직원 담당 고객 수 조회", description = "특정 직원의 담당 고객 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/customer-count")
    public ResponseEntity<Long> getEmployeeCustomerCount(
            @Parameter(description = "직원 ID") @PathVariable Long id) {
        
        Long count = employeeService.getEmployeeCustomerCount(id);
        return ResponseEntity.ok(count);
    }

    @Operation(summary = "조직 계층 구조 조회", description = "특정 직원을 루트로 하는 조직도를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/hierarchy")
    public ResponseEntity<List<EmployeeDto>> getEmployeeHierarchy(
            @Parameter(description = "루트 직원 ID") @PathVariable Long id) {
        
        List<EmployeeDto> hierarchy = employeeService.getEmployeeHierarchy(id);
        return ResponseEntity.ok(hierarchy);
    }

    @Operation(summary = "신규 직원 등록", description = "새로운 직원을 시스템에 등록합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(
            @Parameter(description = "직원 정보", required = true, 
                      schema = @Schema(implementation = EmployeeDto.class))
            @Valid @RequestBody EmployeeDto employeeDto) {
        
        EmployeeDto createdEmployee = employeeService.createEmployee(employeeDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
    }

    @Operation(summary = "직원 정보 수정", description = "기존 직원의 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @Parameter(description = "직원 ID") @PathVariable Long id,
            @Parameter(description = "수정할 직원 정보", required = true, 
                      schema = @Schema(implementation = EmployeeDto.class))
            @Valid @RequestBody EmployeeDto employeeDto) {
        
        EmployeeDto updatedEmployee = employeeService.updateEmployee(id, employeeDto);
        return ResponseEntity.ok(updatedEmployee);
    }

    @Operation(summary = "직원 삭제", description = "직원 정보를 시스템에서 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "400", description = "부하 직원이나 담당 고객이 있는 경우"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(
            @Parameter(description = "직원 ID") @PathVariable Long id) {
        
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "직원 상사 지정", description = "직원의 상사를 지정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "지정 성공"),
        @ApiResponse(responseCode = "404", description = "직원 정보 없음"),
        @ApiResponse(responseCode = "400", description = "자기 자신을 상사로 지정하거나 순환 참조 발생"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}/manager/{managerId}")
    public ResponseEntity<EmployeeDto> assignManager(
            @Parameter(description = "직원 ID") @PathVariable Long id,
            @Parameter(description = "상사 ID") @PathVariable Long managerId) {
        
        EmployeeDto updatedEmployee = employeeService.assignManager(id, managerId);
        return ResponseEntity.ok(updatedEmployee);
    }
}

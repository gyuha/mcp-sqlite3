package com.example.chinook.controller;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.CustomerDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.CustomerService;
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
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Tag(name = "Customer", description = "고객 관리 API")
public class CustomerController {

    private final CustomerService customerService;

    @Operation(summary = "전체 고객 목록 조회", description = "페이지네이션을 적용하여 전체 고객 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<CustomerDto>> getAllCustomers(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 필드") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "정렬 방향 (asc/desc)") @RequestParam(defaultValue = "asc") String direction) {
        
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<CustomerDto> customerPage = customerService.getAllCustomers(pageable);
        
        PageResponse<CustomerDto> response = new PageResponse<>(
            customerPage.getContent(),
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "고객 상세 정보 조회", description = "고객 ID로 상세 정보를 조회합니다 (주문 내역 포함)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "고객 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<CustomerDetailDto> getCustomerDetail(
            @Parameter(description = "고객 ID") @PathVariable Long id) {
        
        CustomerDetailDto customer = customerService.getCustomerDetail(id);
        return ResponseEntity.ok(customer);
    }

    @Operation(summary = "고객 기본 정보 조회", description = "고객 ID로 기본 정보를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "고객 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/basic")
    public ResponseEntity<CustomerDto> getCustomer(
            @Parameter(description = "고객 ID") @PathVariable Long id) {
        
        CustomerDto customer = customerService.getCustomer(id);
        return ResponseEntity.ok(customer);
    }

    @Operation(summary = "성으로 고객 검색", description = "고객의 성(lastName)으로 검색합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/search")
    public ResponseEntity<PageResponse<CustomerDto>> searchCustomersByLastName(
            @Parameter(description = "검색할 성") @RequestParam String lastName,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerDto> customerPage = customerService.searchCustomersByLastName(lastName, pageable);
        
        PageResponse<CustomerDto> response = new PageResponse<>(
            customerPage.getContent(),
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "국가별 고객 목록 조회", description = "특정 국가의 모든 고객을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/by-country")
    public ResponseEntity<List<CustomerDto>> getCustomersByCountry(
            @Parameter(description = "국가명") @RequestParam String country) {
        
        List<CustomerDto> customers = customerService.getCustomersByCountry(country);
        return ResponseEntity.ok(customers);
    }

    @Operation(summary = "전체 국가 목록 조회", description = "모든 고객의 국가 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/countries")
    public ResponseEntity<List<String>> getAllCountries() {
        List<String> countries = customerService.getAllCountries();
        return ResponseEntity.ok(countries);
    }

    @Operation(summary = "국가별 주/도 목록 조회", description = "특정 국가의 모든 주/도 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/states")
    public ResponseEntity<List<String>> getStatesByCountry(
            @Parameter(description = "국가명") @RequestParam String country) {
        
        List<String> states = customerService.getStatesByCountry(country);
        return ResponseEntity.ok(states);
    }

    @Operation(summary = "신규 고객 등록", description = "새로운 고객을 시스템에 등록합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<CustomerDto> createCustomer(
            @Parameter(description = "고객 정보", required = true, 
                      schema = @Schema(implementation = CustomerDto.class))
            @Valid @RequestBody CustomerDto customerDto) {
        
        CustomerDto createdCustomer = customerService.createCustomer(customerDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }

    @Operation(summary = "고객 정보 수정", description = "기존 고객의 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "404", description = "고객 정보 없음"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<CustomerDto> updateCustomer(
            @Parameter(description = "고객 ID") @PathVariable Long id,
            @Parameter(description = "수정할 고객 정보", required = true, 
                      schema = @Schema(implementation = CustomerDto.class))
            @Valid @RequestBody CustomerDto customerDto) {
        
        CustomerDto updatedCustomer = customerService.updateCustomer(id, customerDto);
        return ResponseEntity.ok(updatedCustomer);
    }

    @Operation(summary = "고객 삭제", description = "고객 정보를 시스템에서 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "고객 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(
            @Parameter(description = "고객 ID") @PathVariable Long id) {
        
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "구매 금액 기준 상위 고객 조회", description = "총 구매 금액 기준으로 상위 고객을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/top-customers")
    public ResponseEntity<PageResponse<CustomerDto>> getTopCustomersByPurchase(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerDto> customerPage = customerService.getTopCustomersByPurchase(pageable);
        
        PageResponse<CustomerDto> response = new PageResponse<>(
            customerPage.getContent(),
            customerPage.getNumber(),
            customerPage.getSize(),
            customerPage.getTotalElements(),
            customerPage.getTotalPages(),
            customerPage.isFirst(),
            customerPage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "고객별 주문 수 조회", description = "특정 고객의 총 주문 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "고객 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}/invoice-count")
    public ResponseEntity<Long> getCustomerInvoiceCount(
            @Parameter(description = "고객 ID") @PathVariable Long id) {
        
        Long count = customerService.getCustomerInvoiceCount(id);
        return ResponseEntity.ok(count);
    }
}

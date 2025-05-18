package com.example.chinook.controller;

import com.example.chinook.dto.InvoiceDto;
import com.example.chinook.dto.InvoiceDetailDto;
import com.example.chinook.dto.PageResponse;
import com.example.chinook.service.InvoiceService;
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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoice", description = "청구서 관리 API")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @Operation(summary = "전체 청구서 목록 조회", description = "페이지네이션을 적용하여 전체 청구서 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping
    public ResponseEntity<PageResponse<InvoiceDto>> getAllInvoices(
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "정렬 필드") @RequestParam(defaultValue = "id") String sort,
            @Parameter(description = "정렬 방향 (asc/desc)") @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction dir = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));
        Page<InvoiceDto> invoicePage = invoiceService.getAllInvoices(pageable);
        
        PageResponse<InvoiceDto> response = new PageResponse<>(
            invoicePage.getContent(),
            invoicePage.getNumber(),
            invoicePage.getSize(),
            invoicePage.getTotalElements(),
            invoicePage.getTotalPages(),
            invoicePage.isFirst(),
            invoicePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "청구서 상세 정보 조회", description = "청구서 ID로 상세 정보를 조회합니다 (청구 항목 포함)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "404", description = "청구서 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDetailDto> getInvoiceDetail(
            @Parameter(description = "청구서 ID") @PathVariable Long id) {
        
        InvoiceDetailDto invoice = invoiceService.getInvoiceDetail(id);
        return ResponseEntity.ok(invoice);
    }

    @Operation(summary = "고객별 청구서 목록 조회", description = "특정 고객의 청구서 목록을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/by-customer/{customerId}")
    public ResponseEntity<PageResponse<InvoiceDto>> getCustomerInvoices(
            @Parameter(description = "고객 ID") @PathVariable Long customerId,
            @Parameter(description = "페이지 번호 (0부터 시작)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기") @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<InvoiceDto> invoicePage = invoiceService.getCustomerInvoices(customerId, pageable);
        
        PageResponse<InvoiceDto> response = new PageResponse<>(
            invoicePage.getContent(),
            invoicePage.getNumber(),
            invoicePage.getSize(),
            invoicePage.getTotalElements(),
            invoicePage.getTotalPages(),
            invoicePage.isFirst(),
            invoicePage.isLast()
        );
        
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "고액 청구서 조회", description = "특정 금액 이상의 청구서를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/high-value")
    public ResponseEntity<List<InvoiceDto>> getHighValueInvoices(
            @Parameter(description = "최소 금액") @RequestParam BigDecimal minTotal) {
        
        List<InvoiceDto> invoices = invoiceService.getHighValueInvoices(minTotal);
        return ResponseEntity.ok(invoices);
    }

    @Operation(summary = "국가별 매출 통계 조회", description = "국가별 매출액과 청구서 수를 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/sales-by-country")
    public ResponseEntity<List<Map<String, Object>>> getSalesByCountry() {
        List<Map<String, Object>> salesData = invoiceService.getSalesByCountry();
        return ResponseEntity.ok(salesData);
    }

    @Operation(summary = "기간별 총 매출 조회", description = "지정된 기간의 총 매출액을 조회합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @GetMapping("/total-sales")
    public ResponseEntity<BigDecimal> calculateTotalSales(
            @Parameter(description = "시작 날짜 (yyyy-MM-dd'T'HH:mm:ss)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "종료 날짜 (yyyy-MM-dd'T'HH:mm:ss)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        if (endDate.isBefore(startDate)) {
            return ResponseEntity.badRequest().build();
        }
        
        BigDecimal totalSales = invoiceService.calculateTotalSales(startDate, endDate);
        return ResponseEntity.ok(totalSales);
    }

    @Operation(summary = "신규 청구서 생성", description = "새로운 청구서를 시스템에 등록합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "등록 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PostMapping
    public ResponseEntity<InvoiceDto> createInvoice(
            @Parameter(description = "청구서 정보", required = true, 
                      schema = @Schema(implementation = InvoiceDto.class))
            @Valid @RequestBody InvoiceDto invoiceDto) {
        
        InvoiceDto createdInvoice = invoiceService.createInvoice(invoiceDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInvoice);
    }

    @Operation(summary = "청구서 정보 수정", description = "기존 청구서의 정보를 수정합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "수정 성공"),
        @ApiResponse(responseCode = "404", description = "청구서 정보 없음"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceDto> updateInvoice(
            @Parameter(description = "청구서 ID") @PathVariable Long id,
            @Parameter(description = "수정할 청구서 정보", required = true, 
                      schema = @Schema(implementation = InvoiceDto.class))
            @Valid @RequestBody InvoiceDto invoiceDto) {
        
        InvoiceDto updatedInvoice = invoiceService.updateInvoice(id, invoiceDto);
        return ResponseEntity.ok(updatedInvoice);
    }

    @Operation(summary = "청구서 삭제", description = "청구서를 시스템에서 삭제합니다")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "삭제 성공"),
        @ApiResponse(responseCode = "404", description = "청구서 정보 없음"),
        @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @Parameter(description = "청구서 ID") @PathVariable Long id) {
        
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}

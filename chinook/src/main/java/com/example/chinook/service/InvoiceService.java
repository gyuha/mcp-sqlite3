package com.example.chinook.service;

import com.example.chinook.dto.InvoiceDto;
import com.example.chinook.dto.InvoiceDetailDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface InvoiceService {
    InvoiceDto createInvoice(InvoiceDto invoiceDto);
    InvoiceDto updateInvoice(Long id, InvoiceDto invoiceDto);
    void deleteInvoice(Long id);
    InvoiceDto getInvoice(Long id);
    InvoiceDetailDto getInvoiceDetail(Long id);
    Page<InvoiceDto> getAllInvoices(Pageable pageable);
    Page<InvoiceDto> getCustomerInvoices(Long customerId, Pageable pageable);
    List<InvoiceDto> getHighValueInvoices(BigDecimal minTotal);
    BigDecimal calculateTotalSales(LocalDateTime startDate, LocalDateTime endDate);
    List<Map<String, Object>> getSalesByCountry();
}

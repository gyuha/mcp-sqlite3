package com.example.chinook.service;

import com.example.chinook.dto.*;
import com.example.chinook.entity.*;
import com.example.chinook.repository.CustomerRepository;
import com.example.chinook.repository.InvoiceRepository;
import com.example.chinook.repository.TrackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {
    
    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final TrackRepository trackRepository;

    private CustomerDto toCustomerDto(Customer customer) {
        return new CustomerDto(
            customer.getId(),
            customer.getFirstName(),
            customer.getLastName(),
            customer.getCompany(),
            customer.getAddress(),
            customer.getCity(),
            customer.getState(),
            customer.getCountry(),
            customer.getPostalCode(),
            customer.getPhone(),
            customer.getFax(),
            customer.getEmail(),
            null // 순환 참조 방지를 위해 supportRep는 제외
        );
    }

    private TrackDto toTrackDto(Track track) {
        return new TrackDto(
            track.getId(),
            track.getName(),
            null, // AlbumDto
            null, // MediaTypeDto
            null, // GenreDto
            track.getComposer(),
            track.getMilliseconds(),
            track.getBytes(),
            track.getUnitPrice()
        );
    }

    private InvoiceItemDto toInvoiceItemDto(InvoiceItem item) {
        return new InvoiceItemDto(
            item.getId(),
            item.getInvoice().getId(),
            toTrackDto(item.getTrack()),
            item.getUnitPrice(),
            item.getQuantity()
        );
    }

    private InvoiceDto toDto(Invoice invoice) {
        return new InvoiceDto(
            invoice.getId(),
            toCustomerDto(invoice.getCustomer()),
            invoice.getInvoiceDate(),
            invoice.getBillingAddress(),
            invoice.getBillingCity(),
            invoice.getBillingState(),
            invoice.getBillingCountry(),
            invoice.getBillingPostalCode(),
            invoice.getTotal()
        );
    }

    private InvoiceDetailDto toDetailDto(Invoice invoice) {
        return new InvoiceDetailDto(
            invoice.getId(),
            toCustomerDto(invoice.getCustomer()),
            invoice.getInvoiceDate(),
            invoice.getBillingAddress(),
            invoice.getBillingCity(),
            invoice.getBillingState(),
            invoice.getBillingCountry(),
            invoice.getBillingPostalCode(),
            invoice.getTotal(),
            invoice.getInvoiceItems().stream()
                .map(this::toInvoiceItemDto)
                .collect(Collectors.toList())
        );
    }

    private Invoice toEntity(InvoiceDto dto) {
        Invoice invoice = new Invoice();
        updateInvoiceFromDto(invoice, dto);
        return invoice;
    }

    private void updateInvoiceFromDto(Invoice invoice, InvoiceDto dto) {
        Customer customer = customerRepository.findById(dto.customer().id())
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다: " + dto.customer().id()));

        invoice.setCustomer(customer);
        invoice.setInvoiceDate(dto.invoiceDate());
        invoice.setBillingAddress(dto.billingAddress());
        invoice.setBillingCity(dto.billingCity());
        invoice.setBillingState(dto.billingState());
        invoice.setBillingCountry(dto.billingCountry());
        invoice.setBillingPostalCode(dto.billingPostalCode());
        invoice.setTotal(dto.total());
    }

    private void validateInvoiceItems(List<InvoiceItem> items) {
        BigDecimal calculatedTotal = items.stream()
            .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (calculatedTotal.compareTo(items.get(0).getInvoice().getTotal()) != 0) {
            throw new IllegalArgumentException("청구서 항목의 총액이 청구서 총액과 일치하지 않습니다.");
        }
    }

    @Override
    @Transactional
    public InvoiceDto createInvoice(InvoiceDto invoiceDto) {
        Invoice invoice = toEntity(invoiceDto);
        return toDto(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceDto updateInvoice(Long id, InvoiceDto invoiceDto) {
        Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("청구서를 찾을 수 없습니다: " + id));

        updateInvoiceFromDto(invoice, invoiceDto);
        return toDto(invoice);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new EntityNotFoundException("청구서를 찾을 수 없습니다: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    @Override
    public InvoiceDto getInvoice(Long id) {
        return invoiceRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("청구서를 찾을 수 없습니다: " + id));
    }

    @Override
    public InvoiceDetailDto getInvoiceDetail(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithDetails(id);
        if (invoice == null) {
            throw new EntityNotFoundException("청구서를 찾을 수 없습니다: " + id);
        }
        return toDetailDto(invoice);
    }

    @Override
    public Page<InvoiceDto> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable)
            .map(this::toDto);
    }

    @Override
    public Page<InvoiceDto> getCustomerInvoices(Long customerId, Pageable pageable) {
        return invoiceRepository.findByCustomerId(customerId, pageable)
            .map(this::toDto);
    }

    @Override
    public List<InvoiceDto> getHighValueInvoices(BigDecimal minTotal) {
        return invoiceRepository.findByTotalGreaterThan(minTotal)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public BigDecimal calculateTotalSales(LocalDateTime startDate, LocalDateTime endDate) {
        return invoiceRepository.calculateTotalSalesBetweenDates(startDate, endDate);
    }

    @Override
    public List<Map<String, Object>> getSalesByCountry() {
        List<Object[]> results = invoiceRepository.findSalesByCountry();
        List<Map<String, Object>> salesByCountry = new ArrayList<>();

        for (Object[] result : results) {
            Map<String, Object> countryData = new HashMap<>();
            countryData.put("country", result[0]);
            countryData.put("invoiceCount", result[1]);
            countryData.put("totalSales", result[2]);
            salesByCountry.add(countryData);
        }

        return salesByCountry;
    }
}

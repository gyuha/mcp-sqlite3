package com.example.chinook.service;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.InvoiceDto;
import com.example.chinook.dto.InvoiceDetailDto;
import com.example.chinook.dto.TrackDto;
import com.example.chinook.entity.Customer;
import com.example.chinook.entity.Invoice;
import com.example.chinook.entity.Track;
import com.example.chinook.repository.CustomerRepository;
import com.example.chinook.repository.InvoiceRepository;
import com.example.chinook.repository.TrackRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private TrackRepository trackRepository;

    @InjectMocks
    private InvoiceServiceImpl invoiceService;

    private Customer testCustomer;
    private CustomerDto testCustomerDto;
    private Invoice testInvoice;
    private InvoiceDto testInvoiceDto;

    @BeforeEach
    void setUp() {
        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setFirstName("John");
        testCustomer.setLastName("Doe");
        testCustomer.setEmail("john.doe@example.com");

        testCustomerDto = new CustomerDto(
            testCustomer.getId(),
            testCustomer.getFirstName(),
            testCustomer.getLastName(),
            null, null, null, null, null, null, null, null,
            testCustomer.getEmail(),
            null
        );

        testInvoice = new Invoice();
        testInvoice.setId(1L);
        testInvoice.setCustomer(testCustomer);
        testInvoice.setInvoiceDate(LocalDateTime.now());
        testInvoice.setBillingAddress("123 Main St");
        testInvoice.setBillingCity("City");
        testInvoice.setBillingCountry("Country");
        testInvoice.setTotal(BigDecimal.valueOf(99.99));

        testInvoiceDto = new InvoiceDto(
            testInvoice.getId(),
            testCustomerDto,
            testInvoice.getInvoiceDate(),
            testInvoice.getBillingAddress(),
            testInvoice.getBillingCity(),
            testInvoice.getBillingState(),
            testInvoice.getBillingCountry(),
            testInvoice.getBillingPostalCode(),
            testInvoice.getTotal()
        );
    }

    @Test
    void createInvoice_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(testInvoice);

        InvoiceDto result = invoiceService.createInvoice(testInvoiceDto);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testInvoice.getId());
        assertThat(result.total()).isEqualTo(testInvoice.getTotal());
        verify(invoiceRepository).save(any(Invoice.class));
    }

    @Test
    void createInvoice_CustomerNotFound() {
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.createInvoice(testInvoiceDto))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("고객을 찾을 수 없습니다");
    }

    @Test
    void updateInvoice_Success() {
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(testInvoice));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        InvoiceDto updatedDto = new InvoiceDto(
            testInvoice.getId(),
            testCustomerDto,
            testInvoice.getInvoiceDate(),
            "New Address",
            "New City",
            null,
            "New Country",
            null,
            BigDecimal.valueOf(199.99)
        );

        InvoiceDto result = invoiceService.updateInvoice(1L, updatedDto);

        assertThat(result).isNotNull();
        assertThat(result.billingAddress()).isEqualTo("New Address");
        assertThat(result.billingCity()).isEqualTo("New City");
        assertThat(result.total()).isEqualTo(BigDecimal.valueOf(199.99));
    }

    @Test
    void getInvoiceDetail_Success() {
        Invoice invoiceWithDetails = testInvoice;
        when(invoiceRepository.findByIdWithDetails(1L)).thenReturn(invoiceWithDetails);

        InvoiceDetailDto result = invoiceService.getInvoiceDetail(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testInvoice.getId());
        assertThat(result.customer().id()).isEqualTo(testCustomer.getId());
    }

    @Test
    void getAllInvoices_Success() {
        List<Invoice> invoices = List.of(testInvoice);
        Page<Invoice> invoicePage = new PageImpl<>(invoices);
        Pageable pageable = PageRequest.of(0, 10);

        when(invoiceRepository.findAll(pageable)).thenReturn(invoicePage);

        Page<InvoiceDto> result = invoiceService.getAllInvoices(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).id()).isEqualTo(testInvoice.getId());
    }

    @Test
    void getCustomerInvoices_Success() {
        List<Invoice> invoices = List.of(testInvoice);
        Page<Invoice> invoicePage = new PageImpl<>(invoices);
        Pageable pageable = PageRequest.of(0, 10);

        when(invoiceRepository.findByCustomerId(1L, pageable)).thenReturn(invoicePage);

        Page<InvoiceDto> result = invoiceService.getCustomerInvoices(1L, pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).customer().id()).isEqualTo(testCustomer.getId());
    }

    @Test
    void calculateTotalSales_Success() {
        LocalDateTime startDate = LocalDateTime.now().minusDays(30);
        LocalDateTime endDate = LocalDateTime.now();
        BigDecimal expectedTotal = BigDecimal.valueOf(1000.00);

        when(invoiceRepository.calculateTotalSalesBetweenDates(startDate, endDate))
            .thenReturn(expectedTotal);

        BigDecimal result = invoiceService.calculateTotalSales(startDate, endDate);

        assertThat(result).isEqualTo(expectedTotal);
    }

    @Test
    void deleteInvoice_Success() {
        when(invoiceRepository.existsById(1L)).thenReturn(true);
        doNothing().when(invoiceRepository).deleteById(1L);

        invoiceService.deleteInvoice(1L);

        verify(invoiceRepository).deleteById(1L);
    }
}

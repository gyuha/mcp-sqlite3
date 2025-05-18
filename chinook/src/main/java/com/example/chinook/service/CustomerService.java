package com.example.chinook.service;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.CustomerDetailDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {
    CustomerDto createCustomer(CustomerDto customerDto);
    CustomerDto updateCustomer(Long id, CustomerDto customerDto);
    void deleteCustomer(Long id);
    CustomerDto getCustomer(Long id);
    CustomerDetailDto getCustomerDetail(Long id);
    Page<CustomerDto> getAllCustomers(Pageable pageable);
    Page<CustomerDto> searchCustomersByLastName(String lastName, Pageable pageable);
    Page<CustomerDto> getTopCustomersByPurchase(Pageable pageable);
    List<CustomerDto> getCustomersByCountry(String country);
    List<String> getAllCountries();
    List<String> getStatesByCountry(String country);
    Long getCustomerInvoiceCount(Long customerId);
}

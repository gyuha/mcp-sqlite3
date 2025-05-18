package com.example.chinook.service;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.CustomerDetailDto;
import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.dto.InvoiceDto;
import com.example.chinook.entity.Customer;
import com.example.chinook.entity.Employee;
import com.example.chinook.entity.Invoice;
import com.example.chinook.repository.CustomerRepository;
import com.example.chinook.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {
    
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;

    private CustomerDto toDto(Customer customer) {
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
            customer.getSupportRep() != null ? toEmployeeDto(customer.getSupportRep()) : null
        );
    }

    private CustomerDetailDto toDetailDto(Customer customer) {
        return new CustomerDetailDto(
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
            customer.getSupportRep() != null ? toEmployeeDto(customer.getSupportRep()) : null,
            customer.getInvoices().stream().map(this::toInvoiceDto).toList()
        );
    }

    private EmployeeDto toEmployeeDto(Employee employee) {
        return new EmployeeDto(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getTitle(),
            employee.getEmail()
        );
    }

    private InvoiceDto toInvoiceDto(Invoice invoice) {
        return new InvoiceDto(
            invoice.getId(),
            invoice.getInvoiceDate(),
            invoice.getBillingAddress(),
            invoice.getBillingCity(),
            invoice.getBillingState(),
            invoice.getBillingCountry(),
            invoice.getBillingPostalCode(),
            invoice.getTotal()
        );
    }

    private Customer toEntity(CustomerDto dto) {
        Customer customer = new Customer();
        updateCustomerFromDto(customer, dto);
        return customer;
    }

    private void updateCustomerFromDto(Customer customer, CustomerDto dto) {
        customer.setFirstName(dto.firstName());
        customer.setLastName(dto.lastName());
        customer.setCompany(dto.company());
        customer.setAddress(dto.address());
        customer.setCity(dto.city());
        customer.setState(dto.state());
        customer.setCountry(dto.country());
        customer.setPostalCode(dto.postalCode());
        customer.setPhone(dto.phone());
        customer.setFax(dto.fax());
        customer.setEmail(dto.email());
        
        if (dto.supportRep() != null) {
            Employee supportRep = employeeRepository.findById(dto.supportRep().id())
                .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + dto.supportRep().id()));
            customer.setSupportRep(supportRep);
        }
    }

    @Override
    @Transactional
    public CustomerDto createCustomer(CustomerDto customerDto) {
        customerRepository.findByEmail(customerDto.email())
            .ifPresent(c -> {
                throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + customerDto.email());
            });

        Customer customer = toEntity(customerDto);
        return toDto(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerDto customerDto) {
        Customer customer = customerRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다: " + id));

        customerRepository.findByEmail(customerDto.email())
            .filter(c -> !c.getId().equals(id))
            .ifPresent(c -> {
                throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + customerDto.email());
            });

        updateCustomerFromDto(customer, customerDto);
        return toDto(customer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new EntityNotFoundException("고객을 찾을 수 없습니다: " + id);
        }
        customerRepository.deleteById(id);
    }

    @Override
    public CustomerDto getCustomer(Long id) {
        return customerRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다: " + id));
    }

    @Override
    public CustomerDetailDto getCustomerDetail(Long id) {
        return customerRepository.findByIdWithInvoices(id)
            .map(this::toDetailDto)
            .orElseThrow(() -> new EntityNotFoundException("고객을 찾을 수 없습니다: " + id));
    }

    @Override
    public Page<CustomerDto> getAllCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public Page<CustomerDto> searchCustomersByLastName(String lastName, Pageable pageable) {
        return customerRepository.findByLastNameContainingIgnoreCase(lastName, pageable)
            .map(this::toDto);
    }

    @Override
    public Page<CustomerDto> getTopCustomersByPurchase(Pageable pageable) {
        return customerRepository.findTopCustomersByTotalPurchase(pageable)
            .map(this::toDto);
    }

    @Override
    public List<CustomerDto> getCustomersByCountry(String country) {
        return customerRepository.findByCountry(country).stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    public List<String> getAllCountries() {
        return customerRepository.findAllCountries();
    }

    @Override
    public List<String> getStatesByCountry(String country) {
        return customerRepository.findStatesByCountry(country);
    }

    @Override
    public Long getCustomerInvoiceCount(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new EntityNotFoundException("고객을 찾을 수 없습니다: " + customerId);
        }
        return customerRepository.countInvoicesByCustomerId(customerId);
    }
}

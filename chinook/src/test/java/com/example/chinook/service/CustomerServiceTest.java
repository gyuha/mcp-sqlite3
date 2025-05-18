package com.example.chinook.service;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.entity.Customer;
import com.example.chinook.entity.Employee;
import com.example.chinook.repository.CustomerRepository;
import com.example.chinook.repository.EmployeeRepository;
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

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer testCustomer;
    private CustomerDto testCustomerDto;
    private Employee testEmployee;
    private EmployeeDto testEmployeeDto;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setId(1L);
        testEmployee.setFirstName("John");
        testEmployee.setLastName("Doe");
        testEmployee.setTitle("Sales Support Agent");
        testEmployee.setEmail("john.doe@chinook.com");

        testEmployeeDto = new EmployeeDto(
            testEmployee.getId(),
            testEmployee.getFirstName(),
            testEmployee.getLastName(),
            testEmployee.getTitle(),
            testEmployee.getEmail()
        );

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setFirstName("Jane");
        testCustomer.setLastName("Smith");
        testCustomer.setCompany("Company");
        testCustomer.setEmail("jane.smith@example.com");
        testCustomer.setSupportRep(testEmployee);

        testCustomerDto = new CustomerDto(
            testCustomer.getId(),
            testCustomer.getFirstName(),
            testCustomer.getLastName(),
            testCustomer.getCompany(),
            testCustomer.getAddress(),
            testCustomer.getCity(),
            testCustomer.getState(),
            testCustomer.getCountry(),
            testCustomer.getPostalCode(),
            testCustomer.getPhone(),
            testCustomer.getFax(),
            testCustomer.getEmail(),
            testEmployeeDto
        );
    }

    @Test
    void createCustomer_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(customerRepository.findByEmail(testCustomerDto.email())).thenReturn(Optional.empty());
        when(customerRepository.save(any(Customer.class))).thenReturn(testCustomer);

        CustomerDto result = customerService.createCustomer(testCustomerDto);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(testCustomerDto.email());
        verify(customerRepository).save(any(Customer.class));
    }

    @Test
    void createCustomer_DuplicateEmail() {
        when(customerRepository.findByEmail(testCustomerDto.email())).thenReturn(Optional.of(testCustomer));

        assertThatThrownBy(() -> customerService.createCustomer(testCustomerDto))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 이메일입니다");
    }

    @Test
    void updateCustomer_Success() {
        CustomerDto updateDto = new CustomerDto(
            testCustomer.getId(),
            "Updated",
            "Name",
            "New Company",
            null, null, null, null, null, null, null,
            "updated@example.com",
            testEmployeeDto
        );

        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(customerRepository.findByEmail(updateDto.email())).thenReturn(Optional.empty());
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));

        CustomerDto result = customerService.updateCustomer(1L, updateDto);

        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("Updated");
        assertThat(result.lastName()).isEqualTo("Name");
        assertThat(result.email()).isEqualTo("updated@example.com");
    }

    @Test
    void updateCustomer_NotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.updateCustomer(99L, testCustomerDto))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("고객을 찾을 수 없습니다");
    }

    @Test
    void getCustomer_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        CustomerDto result = customerService.getCustomer(1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testCustomer.getId());
        assertThat(result.email()).isEqualTo(testCustomer.getEmail());
    }

    @Test
    void getAllCustomers_Success() {
        List<Customer> customers = List.of(testCustomer);
        Page<Customer> customerPage = new PageImpl<>(customers);
        Pageable pageable = PageRequest.of(0, 10);

        when(customerRepository.findAll(pageable)).thenReturn(customerPage);

        Page<CustomerDto> result = customerService.getAllCustomers(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).email()).isEqualTo(testCustomer.getEmail());
    }

    @Test
    void searchCustomersByLastName_Success() {
        List<Customer> customers = List.of(testCustomer);
        Page<Customer> customerPage = new PageImpl<>(customers);
        Pageable pageable = PageRequest.of(0, 10);

        when(customerRepository.findByLastNameContainingIgnoreCase("Smith", pageable))
            .thenReturn(customerPage);

        Page<CustomerDto> result = customerService.searchCustomersByLastName("Smith", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).lastName()).isEqualTo("Smith");
    }

    @Test
    void deleteCustomer_Success() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        doNothing().when(customerRepository).deleteById(1L);

        customerService.deleteCustomer(1L);

        verify(customerRepository).deleteById(1L);
    }

    @Test
    void deleteCustomer_NotFound() {
        when(customerRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> customerService.deleteCustomer(99L))
            .isInstanceOf(EntityNotFoundException.class)
            .hasMessageContaining("고객을 찾을 수 없습니다");
    }
}

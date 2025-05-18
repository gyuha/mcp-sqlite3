package com.example.chinook.service;

import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.dto.EmployeeDetailDto;
import com.example.chinook.entity.Employee;
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

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee testEmployee;
    private Employee testManager;
    private EmployeeDto testEmployeeDto;

    @BeforeEach
    void setUp() {
        testManager = new Employee();
        testManager.setId(1L);
        testManager.setFirstName("John");
        testManager.setLastName("Manager");
        testManager.setTitle("Senior Manager");
        testManager.setEmail("john.manager@chinook.com");

        testEmployee = new Employee();
        testEmployee.setId(2L);
        testEmployee.setFirstName("Jane");
        testEmployee.setLastName("Employee");
        testEmployee.setTitle("Sales Support");
        testEmployee.setEmail("jane.employee@chinook.com");
        testEmployee.setReportsTo(testManager);

        testEmployeeDto = new EmployeeDto(
            testEmployee.getId(),
            testEmployee.getFirstName(),
            testEmployee.getLastName(),
            testEmployee.getTitle(),
            testEmployee.getBirthDate(),
            testEmployee.getHireDate(),
            testEmployee.getAddress(),
            testEmployee.getCity(),
            testEmployee.getState(),
            testEmployee.getCountry(),
            testEmployee.getPostalCode(),
            testEmployee.getPhone(),
            testEmployee.getFax(),
            testEmployee.getEmail()
        );
    }

    @Test
    void createEmployee_Success() {
        when(employeeRepository.findByEmail(testEmployeeDto.email())).thenReturn(Optional.empty());
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);

        EmployeeDto result = employeeService.createEmployee(testEmployeeDto);

        assertThat(result).isNotNull();
        assertThat(result.email()).isEqualTo(testEmployeeDto.email());
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_DuplicateEmail() {
        when(employeeRepository.findByEmail(testEmployeeDto.email())).thenReturn(Optional.of(testEmployee));

        assertThatThrownBy(() -> employeeService.createEmployee(testEmployeeDto))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("이미 존재하는 이메일입니다");
    }

    @Test
    void updateEmployee_Success() {
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.findByEmail(testEmployeeDto.email())).thenReturn(Optional.empty());

        EmployeeDto updatedDto = new EmployeeDto(
            testEmployee.getId(),
            "Updated",
            "Name",
            "New Title",
            LocalDateTime.now(),
            LocalDateTime.now(),
            "New Address",
            "New City",
            "New State",
            "New Country",
            "12345",
            "123-456-7890",
            null,
            "updated.name@chinook.com"
        );

        EmployeeDto result = employeeService.updateEmployee(2L, updatedDto);

        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("Updated");
        assertThat(result.lastName()).isEqualTo("Name");
        assertThat(result.title()).isEqualTo("New Title");
    }

    @Test
    void getEmployeeDetail_Success() {
        when(employeeRepository.findByIdWithSubordinates(2L)).thenReturn(Optional.of(testEmployee));

        EmployeeDetailDto result = employeeService.getEmployeeDetail(2L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testEmployee.getId());
        assertThat(result.email()).isEqualTo(testEmployee.getEmail());
    }

    @Test
    void getAllEmployees_Success() {
        List<Employee> employees = Arrays.asList(testManager, testEmployee);
        Page<Employee> employeePage = new PageImpl<>(employees);
        Pageable pageable = PageRequest.of(0, 10);

        when(employeeRepository.findAll(pageable)).thenReturn(employeePage);

        Page<EmployeeDto> result = employeeService.getAllEmployees(pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(1).email()).isEqualTo(testEmployee.getEmail());
    }

    @Test
    void assignManager_Success() {
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testManager));

        EmployeeDto result = employeeService.assignManager(2L, 1L);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(testEmployee.getId());
        verify(employeeRepository, times(1)).findById(2L);
        verify(employeeRepository, times(1)).findById(1L);
    }

    @Test
    void assignManager_SelfReference() {
        assertThatThrownBy(() -> employeeService.assignManager(1L, 1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("직원을 자신의 상사로 지정할 수 없습니다");
    }

    @Test
    void deleteEmployee_WithSubordinates() {
        Employee managerWithSubordinates = testManager;
        managerWithSubordinates.getSubordinates().add(testEmployee);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(managerWithSubordinates));

        assertThatThrownBy(() -> employeeService.deleteEmployee(1L))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("부하 직원이 있는 직원은 삭제할 수 없습니다");
    }
}

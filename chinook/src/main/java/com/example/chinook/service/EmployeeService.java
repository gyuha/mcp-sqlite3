package com.example.chinook.service;

import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.dto.EmployeeDetailDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto employeeDto);
    EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto);
    void deleteEmployee(Long id);
    EmployeeDto getEmployee(Long id);
    EmployeeDetailDto getEmployeeDetail(Long id);
    Page<EmployeeDto> getAllEmployees(Pageable pageable);
    Page<EmployeeDto> searchEmployeesByLastName(String lastName, Pageable pageable);
    List<EmployeeDto> getSubordinates(Long managerId);
    List<EmployeeDto> getAllManagers();
    List<EmployeeDto> getTopEmployeesBySales(Pageable pageable);
    Long getEmployeeCustomerCount(Long employeeId);
    EmployeeDto assignManager(Long employeeId, Long managerId);
    List<EmployeeDto> getEmployeeHierarchy(Long rootEmployeeId);
}

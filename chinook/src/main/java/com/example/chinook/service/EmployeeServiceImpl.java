package com.example.chinook.service;

import com.example.chinook.dto.CustomerDto;
import com.example.chinook.dto.EmployeeDto;
import com.example.chinook.dto.EmployeeDetailDto;
import com.example.chinook.entity.Customer;
import com.example.chinook.entity.Employee;
import com.example.chinook.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    private EmployeeDto toDto(Employee employee) {
        return new EmployeeDto(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getTitle(),
            employee.getBirthDate(),
            employee.getHireDate(),
            employee.getAddress(),
            employee.getCity(),
            employee.getState(),
            employee.getCountry(),
            employee.getPostalCode(),
            employee.getPhone(),
            employee.getFax(),
            employee.getEmail()
        );
    }

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
            null // 순환 참조 방지
        );
    }

    private EmployeeDetailDto toDetailDto(Employee employee) {
        return new EmployeeDetailDto(
            employee.getId(),
            employee.getFirstName(),
            employee.getLastName(),
            employee.getTitle(),
            employee.getBirthDate(),
            employee.getHireDate(),
            employee.getAddress(),
            employee.getCity(),
            employee.getState(),
            employee.getCountry(),
            employee.getPostalCode(),
            employee.getPhone(),
            employee.getFax(),
            employee.getEmail(),
            employee.getReportsTo() != null ? toDto(employee.getReportsTo()) : null,
            employee.getSubordinates().stream().map(this::toDto).collect(Collectors.toList()),
            employee.getCustomers().stream().map(this::toCustomerDto).collect(Collectors.toList())
        );
    }

    private Employee toEntity(EmployeeDto dto) {
        Employee employee = new Employee();
        updateEmployeeFromDto(employee, dto);
        return employee;
    }

    private void updateEmployeeFromDto(Employee employee, EmployeeDto dto) {
        employee.setFirstName(dto.firstName());
        employee.setLastName(dto.lastName());
        employee.setTitle(dto.title());
        employee.setBirthDate(dto.birthDate());
        employee.setHireDate(dto.hireDate());
        employee.setAddress(dto.address());
        employee.setCity(dto.city());
        employee.setState(dto.state());
        employee.setCountry(dto.country());
        employee.setPostalCode(dto.postalCode());
        employee.setPhone(dto.phone());
        employee.setFax(dto.fax());
        employee.setEmail(dto.email());
    }

    @Override
    @Transactional
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        if (employeeDto.email() != null) {
            employeeRepository.findByEmail(employeeDto.email())
                .ifPresent(e -> {
                    throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + employeeDto.email());
                });
        }

        Employee employee = toEntity(employeeDto);
        return toDto(employeeRepository.save(employee));
    }

    @Override
    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + id));

        if (employeeDto.email() != null) {
            employeeRepository.findByEmail(employeeDto.email())
                .filter(e -> !e.getId().equals(id))
                .ifPresent(e -> {
                    throw new IllegalArgumentException("이미 존재하는 이메일입니다: " + employeeDto.email());
                });
        }

        updateEmployeeFromDto(employee, employeeDto);
        return toDto(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + id));

        if (!employee.getSubordinates().isEmpty()) {
            throw new IllegalStateException("부하 직원이 있는 직원은 삭제할 수 없습니다.");
        }

        if (!employee.getCustomers().isEmpty()) {
            throw new IllegalStateException("담당 고객이 있는 직원은 삭제할 수 없습니다.");
        }

        employeeRepository.deleteById(id);
    }

    @Override
    public EmployeeDto getEmployee(Long id) {
        return employeeRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + id));
    }

    @Override
    public EmployeeDetailDto getEmployeeDetail(Long id) {
        return employeeRepository.findByIdWithSubordinates(id)
            .map(this::toDetailDto)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + id));
    }

    @Override
    public Page<EmployeeDto> getAllEmployees(Pageable pageable) {
        return employeeRepository.findAll(pageable).map(this::toDto);
    }

    @Override
    public Page<EmployeeDto> searchEmployeesByLastName(String lastName, Pageable pageable) {
        return employeeRepository.findByLastNameContainingIgnoreCase(lastName, pageable)
            .map(this::toDto);
    }

    @Override
    public List<EmployeeDto> getSubordinates(Long managerId) {
        return employeeRepository.findByReportsTo(managerId)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDto> getAllManagers() {
        return employeeRepository.findAllManagers()
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeDto> getTopEmployeesBySales(Pageable pageable) {
        return employeeRepository.findTopEmployeesBySales(pageable)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    @Override
    public Long getEmployeeCustomerCount(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new EntityNotFoundException("직원을 찾을 수 없습니다: " + employeeId);
        }
        return employeeRepository.countCustomersByEmployeeId(employeeId);
    }

    @Override
    @Transactional
    public EmployeeDto assignManager(Long employeeId, Long managerId) {
        if (Objects.equals(employeeId, managerId)) {
            throw new IllegalArgumentException("직원을 자신의 상사로 지정할 수 없습니다.");
        }

        Employee employee = employeeRepository.findById(employeeId)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + employeeId));

        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new EntityNotFoundException("상사를 찾을 수 없습니다: " + managerId));

        validateManagerAssignment(employee, manager);
        employee.setReportsTo(manager);
        return toDto(employee);
    }

    @Override
    public List<EmployeeDto> getEmployeeHierarchy(Long rootEmployeeId) {
        Employee rootEmployee = employeeRepository.findByIdWithSubordinates(rootEmployeeId)
            .orElseThrow(() -> new EntityNotFoundException("직원을 찾을 수 없습니다: " + rootEmployeeId));

        List<EmployeeDto> hierarchy = new ArrayList<>();
        buildHierarchy(rootEmployee, hierarchy, 0);
        return hierarchy;
    }

    private void buildHierarchy(Employee employee, List<EmployeeDto> hierarchy, int level) {
        hierarchy.add(toDto(employee));
        employee.getSubordinates()
            .stream()
            .sorted((e1, e2) -> e1.getLastName().compareToIgnoreCase(e2.getLastName()))
            .forEach(subordinate -> buildHierarchy(subordinate, hierarchy, level + 1));
    }

    private void validateManagerAssignment(Employee employee, Employee manager) {
        // 순환 참조 체크
        Employee current = manager;
        while (current != null) {
            if (current.getId().equals(employee.getId())) {
                throw new IllegalArgumentException("순환 참조가 발생할 수 있는 상사 지정은 할 수 없습니다.");
            }
            current = current.getReportsTo();
        }
    }
}

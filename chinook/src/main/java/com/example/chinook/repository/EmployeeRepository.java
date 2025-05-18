package com.example.chinook.repository;

import com.example.chinook.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmail(String email);
    
    List<Employee> findByReportsTo(Long managerId);
    
    Page<Employee> findByLastNameContainingIgnoreCase(String lastName, Pageable pageable);
    
    @Query("SELECT e FROM Employee e LEFT JOIN FETCH e.subordinates WHERE e.id = :id")
    Optional<Employee> findByIdWithSubordinates(@Param("id") Long id);
    
    @Query("SELECT e FROM Employee e WHERE e.reportsTo IS NULL")
    List<Employee> findAllManagers();
    
    @Query("SELECT COUNT(c) FROM Employee e JOIN e.customers c WHERE e.id = :employeeId")
    Long countCustomersByEmployeeId(@Param("employeeId") Long employeeId);
    
    @Query("SELECT e FROM Employee e " +
           "JOIN e.customers c " +
           "JOIN c.invoices i " +
           "GROUP BY e " +
           "ORDER BY SUM(i.total) DESC")
    List<Employee> findTopEmployeesBySales(Pageable pageable);
}

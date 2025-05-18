package com.example.chinook.repository;

import com.example.chinook.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByEmail(String email);
    
    Page<Customer> findByLastNameContainingIgnoreCase(String lastName, Pageable pageable);
    
    List<Customer> findByCountry(String country);
    
    @Query("SELECT c FROM Customer c JOIN FETCH c.invoices WHERE c.id = :id")
    Optional<Customer> findByIdWithInvoices(@Param("id") Long id);
    
    @Query("SELECT c FROM Customer c " +
           "JOIN c.invoices i " +
           "GROUP BY c " +
           "ORDER BY SUM(i.total) DESC")
    Page<Customer> findTopCustomersByTotalPurchase(Pageable pageable);
    
    @Query("SELECT COUNT(i) FROM Customer c JOIN c.invoices i WHERE c.id = :customerId")
    Long countInvoicesByCustomerId(@Param("customerId") Long customerId);
    
    @Query("SELECT DISTINCT c.country FROM Customer c ORDER BY c.country")
    List<String> findAllCountries();
    
    @Query("SELECT c.state FROM Customer c WHERE c.country = :country GROUP BY c.state ORDER BY c.state")
    List<String> findStatesByCountry(@Param("country") String country);
}

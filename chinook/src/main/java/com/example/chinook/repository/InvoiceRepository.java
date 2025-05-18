package com.example.chinook.repository;

import com.example.chinook.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    List<Invoice> findByCustomerId(Long customerId);
    
    Page<Invoice> findByCustomerId(Long customerId, Pageable pageable);
    
    @Query("SELECT i FROM Invoice i WHERE i.total > :minTotal")
    List<Invoice> findByTotalGreaterThan(@Param("minTotal") BigDecimal minTotal);
    
    @Query("SELECT i FROM Invoice i " +
           "JOIN FETCH i.customer " +
           "JOIN FETCH i.invoiceItems ii " +
           "JOIN FETCH ii.track " +
           "WHERE i.id = :id")
    Invoice findByIdWithDetails(@Param("id") Long id);
    
    @Query("SELECT SUM(i.total) FROM Invoice i WHERE i.invoiceDate BETWEEN :startDate AND :endDate")
    BigDecimal calculateTotalSalesBetweenDates(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT i.billingCountry, COUNT(i) as count, SUM(i.total) as total " +
           "FROM Invoice i " +
           "GROUP BY i.billingCountry " +
           "ORDER BY SUM(i.total) DESC")
    List<Object[]> findSalesByCountry();
}

package com.sakila.server.repository;

import com.sakila.server.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByCustomerId(Integer customerId);
    List<Payment> findByRentalId(Integer rentalId);
    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    List<Payment> findByAmountGreaterThan(BigDecimal amount);
}

package com.sakila.server.service;

import com.sakila.server.model.Payment;
import com.sakila.server.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public List<Payment> getPaymentsByCustomerId(Integer customerId) {
        return paymentRepository.findByCustomerId(customerId);
    }

    public List<Payment> getPaymentsByRentalId(Integer rentalId) {
        return paymentRepository.findByRentalId(rentalId);
    }

    public List<Payment> getPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return paymentRepository.findByPaymentDateBetween(startDate, endDate);
    }

    public List<Payment> getPaymentsGreaterThan(BigDecimal amount) {
        return paymentRepository.findByAmountGreaterThan(amount);
    }

    @Transactional
    public Payment savePayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(Integer id) {
        paymentRepository.deleteById(id);
    }
}

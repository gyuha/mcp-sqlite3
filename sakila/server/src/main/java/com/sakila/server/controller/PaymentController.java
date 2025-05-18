package com.sakila.server.controller;

import com.sakila.server.model.Payment;
import com.sakila.server.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Integer id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Payment>> getPaymentsByCustomerId(@PathVariable Integer customerId) {
        return ResponseEntity.ok(paymentService.getPaymentsByCustomerId(customerId));
    }

    @GetMapping("/rental/{rentalId}")
    public ResponseEntity<List<Payment>> getPaymentsByRentalId(@PathVariable Integer rentalId) {
        return ResponseEntity.ok(paymentService.getPaymentsByRentalId(rentalId));
    }

    @GetMapping("/dateRange")
    public ResponseEntity<List<Payment>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(startDate, endDate));
    }

    @GetMapping("/amountGreaterThan/{amount}")
    public ResponseEntity<List<Payment>> getPaymentsGreaterThan(@PathVariable BigDecimal amount) {
        return ResponseEntity.ok(paymentService.getPaymentsGreaterThan(amount));
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment payment) {
        return new ResponseEntity<>(paymentService.savePayment(payment), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Integer id, @RequestBody Payment payment) {
        return paymentService.getPaymentById(id)
                .map(existingPayment -> {
                    payment.setPaymentId(id);
                    return ResponseEntity.ok(paymentService.savePayment(payment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Integer id) {
        return paymentService.getPaymentById(id)
                .map(payment -> {
                    paymentService.deletePayment(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

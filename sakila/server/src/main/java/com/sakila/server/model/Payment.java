package com.sakila.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @Column(name = "payment_id")
    private Integer paymentId;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "staff_id", nullable = false)
    private Integer staffId;

    @Column(name = "rental_id")
    private Integer rentalId;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}

package com.sakila.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rental")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rental {

    @Id
    @Column(name = "rental_id")
    private Integer rentalId;

    @Column(name = "rental_date", nullable = false)
    private LocalDateTime rentalDate;

    @Column(name = "inventory_id", nullable = false)
    private Integer inventoryId;

    @Column(name = "customer_id", nullable = false)
    private Integer customerId;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(name = "staff_id", nullable = false)
    private Integer staffId;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;
}

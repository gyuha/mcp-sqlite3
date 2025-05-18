package com.sakila.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "store_id", nullable = false)
    private Integer storeId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email")
    private String email;

    @Column(name = "address_id", nullable = false)
    private Integer addressId;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "create_date", nullable = false)
    private LocalDateTime createDate;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}

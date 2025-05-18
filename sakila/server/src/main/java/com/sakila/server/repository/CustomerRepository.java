package com.sakila.server.repository;

import com.sakila.server.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    List<Customer> findByLastName(String lastName);
    List<Customer> findByEmail(String email);
    List<Customer> findByActive(Boolean active);
}

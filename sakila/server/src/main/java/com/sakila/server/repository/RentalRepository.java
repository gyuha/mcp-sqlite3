package com.sakila.server.repository;

import com.sakila.server.model.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Integer> {
    List<Rental> findByCustomerId(Integer customerId);
    List<Rental> findByInventoryId(Integer inventoryId);
    List<Rental> findByReturnDateIsNull();
    List<Rental> findByRentalDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}

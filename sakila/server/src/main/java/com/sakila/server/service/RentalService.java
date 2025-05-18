package com.sakila.server.service;

import com.sakila.server.model.Rental;
import com.sakila.server.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;

    public List<Rental> getAllRentals() {
        return rentalRepository.findAll();
    }
    
    public Page<Rental> getAllRentalsPaged(Pageable pageable) {
        return rentalRepository.findAll(pageable);
    }

    public Optional<Rental> getRentalById(Integer id) {
        return rentalRepository.findById(id);
    }

    public List<Rental> getRentalsByCustomerId(Integer customerId) {
        return rentalRepository.findByCustomerId(customerId);
    }

    public List<Rental> getRentalsByInventoryId(Integer inventoryId) {
        return rentalRepository.findByInventoryId(inventoryId);
    }

    public List<Rental> getActiveRentals() {
        return rentalRepository.findByReturnDateIsNull();
    }

    public List<Rental> getRentalsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return rentalRepository.findByRentalDateBetween(startDate, endDate);
    }

    @Transactional
    public Rental saveRental(Rental rental) {
        return rentalRepository.save(rental);
    }

    @Transactional
    public void deleteRental(Integer id) {
        rentalRepository.deleteById(id);
    }
}

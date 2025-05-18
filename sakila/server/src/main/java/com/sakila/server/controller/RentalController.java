package com.sakila.server.controller;

import com.sakila.server.model.Rental;
import com.sakila.server.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @GetMapping
    public ResponseEntity<List<Rental>> getAllRentals() {
        return ResponseEntity.ok(rentalService.getAllRentals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getRentalById(@PathVariable Integer id) {
        return rentalService.getRentalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Rental>> getRentalsByCustomerId(@PathVariable Integer customerId) {
        return ResponseEntity.ok(rentalService.getRentalsByCustomerId(customerId));
    }

    @GetMapping("/inventory/{inventoryId}")
    public ResponseEntity<List<Rental>> getRentalsByInventoryId(@PathVariable Integer inventoryId) {
        return ResponseEntity.ok(rentalService.getRentalsByInventoryId(inventoryId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<Rental>> getActiveRentals() {
        return ResponseEntity.ok(rentalService.getActiveRentals());
    }

    @GetMapping("/dateRange")
    public ResponseEntity<List<Rental>> getRentalsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(rentalService.getRentalsByDateRange(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<Rental> createRental(@RequestBody Rental rental) {
        return new ResponseEntity<>(rentalService.saveRental(rental), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rental> updateRental(@PathVariable Integer id, @RequestBody Rental rental) {
        return rentalService.getRentalById(id)
                .map(existingRental -> {
                    rental.setRentalId(id);
                    return ResponseEntity.ok(rentalService.saveRental(rental));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRental(@PathVariable Integer id) {
        return rentalService.getRentalById(id)
                .map(rental -> {
                    rentalService.deleteRental(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

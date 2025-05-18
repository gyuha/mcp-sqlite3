package com.sakila.server.controller;

import com.sakila.server.model.Customer;
import com.sakila.server.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Integer id) {
        return customerService.getCustomerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/lastName/{lastName}")
    public ResponseEntity<List<Customer>> getCustomersByLastName(@PathVariable String lastName) {
        return ResponseEntity.ok(customerService.getCustomersByLastName(lastName));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<Customer>> getCustomersByEmail(@PathVariable String email) {
        return ResponseEntity.ok(customerService.getCustomersByEmail(email));
    }

    @GetMapping("/active/{active}")
    public ResponseEntity<List<Customer>> getActiveCustomers(@PathVariable Boolean active) {
        return ResponseEntity.ok(customerService.getActiveCustomers(active));
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return new ResponseEntity<>(customerService.saveCustomer(customer), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Integer id, @RequestBody Customer customer) {
        return customerService.getCustomerById(id)
                .map(existingCustomer -> {
                    customer.setCustomerId(id);
                    return ResponseEntity.ok(customerService.saveCustomer(customer));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Integer id) {
        return customerService.getCustomerById(id)
                .map(customer -> {
                    customerService.deleteCustomer(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}

package com.sakila.server.service;

import com.sakila.server.model.Customer;
import com.sakila.server.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public Optional<Customer> getCustomerById(Integer id) {
        return customerRepository.findById(id);
    }

    public List<Customer> getCustomersByLastName(String lastName) {
        return customerRepository.findByLastName(lastName);
    }

    public List<Customer> getCustomersByEmail(String email) {
        return customerRepository.findByEmail(email);
    }

    public List<Customer> getActiveCustomers(Boolean active) {
        return customerRepository.findByActive(active);
    }

    @Transactional
    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    @Transactional
    public void deleteCustomer(Integer id) {
        customerRepository.deleteById(id);
    }
}

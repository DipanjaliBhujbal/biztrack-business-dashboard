package com.jobscheduler.biztrack.customer.service;

import com.jobscheduler.biztrack.customer.dto.CustomerRequest;
import com.jobscheduler.biztrack.customer.entity.Customer;
import com.jobscheduler.biztrack.customer.repository.CustomerRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Create customer
    public Customer createCustomer(CustomerRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Customer with this email already exists"
            );
        }

        Customer customer = new Customer();
        customer.setName(request.getName().trim());
        customer.setEmail(email);
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());

        return customerRepository.save(customer);
    }

    // Get all customers
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Get customer by ID
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found with ID: " + id
                ));
    }

    // Update customer
    public Customer updateCustomer(Long id, CustomerRequest request) {

        Customer customer = getCustomerById(id);

        String email = request.getEmail().trim().toLowerCase();

        if (customerRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Another customer already uses this email"
            );
        }

        customer.setName(request.getName().trim());
        customer.setEmail(email);
        customer.setPhone(request.getPhone());
        customer.setCompany(request.getCompany());

        return customerRepository.save(customer);
    }

    // Delete customer
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }
}

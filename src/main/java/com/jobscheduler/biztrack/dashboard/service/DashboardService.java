package com.jobscheduler.biztrack.dashboard.service;

import com.jobscheduler.biztrack.customer.repository.CustomerRepository;
import com.jobscheduler.biztrack.dashboard.dto.DashboardSummary;
import com.jobscheduler.biztrack.order.repository.OrderRepository;
import com.jobscheduler.biztrack.product.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public DashboardService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummary getDashboardSummary() {

        DashboardSummary summary = new DashboardSummary();

        summary.setTotalCustomers(customerRepository.count());

        summary.setTotalProducts(productRepository.count());

        summary.setTotalOrders(orderRepository.count());

        BigDecimal totalRevenue = orderRepository.findAll()
                .stream()
                .filter(order -> !"CANCELLED".equals(order.getStatus()))
                .map(order -> order.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        summary.setTotalRevenue(totalRevenue);

        summary.setPendingOrders(
                orderRepository.countByStatus("PENDING")
        );

        summary.setCompletedOrders(
                orderRepository.countByStatus("DELIVERED")
        );

        summary.setLowStockProducts(
                productRepository.countByStockQuantityLessThan(10)
        );

        return summary;
    }
}

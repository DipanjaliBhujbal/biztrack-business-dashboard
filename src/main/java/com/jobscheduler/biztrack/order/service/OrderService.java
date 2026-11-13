package com.jobscheduler.biztrack.order.service;

import com.jobscheduler.biztrack.customer.entity.Customer;
import com.jobscheduler.biztrack.customer.repository.CustomerRepository;
import com.jobscheduler.biztrack.order.dto.OrderRequest;
import com.jobscheduler.biztrack.order.dto.OrderResponse;
import com.jobscheduler.biztrack.order.dto.OrderStatusRequest;
import com.jobscheduler.biztrack.order.entity.Order;
import com.jobscheduler.biztrack.order.entity.OrderItem;
import com.jobscheduler.biztrack.order.repository.OrderRepository;
import com.jobscheduler.biztrack.product.entity.Product;
import com.jobscheduler.biztrack.product.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            CustomerRepository customerRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found with ID: " + request.getCustomerId()
                ));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderRequest.OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Product not found with ID: " + itemRequest.getProductId()
                    ));

            Integer quantity = itemRequest.getQuantity();

            if (product.getStockQuantity() < quantity) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Insufficient stock for product: " + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(quantity);
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

            order.getItems().add(orderItem);
            totalAmount = totalAmount.add(subtotal);

            product.setStockQuantity(product.getStockQuantity() - quantity);
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found with ID: " + id
                ));

        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(
            Long id,
            OrderStatusRequest request) {

        Order order = getOrderEntityById(id);

        String currentStatus = order.getStatus();
        String newStatus = request.getStatus().trim().toUpperCase();

        String expectedNextStatus;

        switch (currentStatus) {
            case "PENDING":
                expectedNextStatus = "CONFIRMED";
                break;
            case "CONFIRMED":
                expectedNextStatus = "SHIPPED";
                break;
            case "SHIPPED":
                expectedNextStatus = "DELIVERED";
                break;
            default:
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This order cannot be moved to another status"
                );
        }

        if (!expectedNextStatus.equals(newStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invalid status transition. Next allowed status is: "
                            + expectedNextStatus
            );
        }

        order.setStatus(newStatus);

        Order updatedOrder = orderRepository.save(order);

        return mapToResponse(updatedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {

        Order order = getOrderEntityById(id);

        if ("CANCELLED".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This order is already cancelled"
            );
        }

        if (!"PENDING".equals(order.getStatus())
                && !"CONFIRMED".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only pending or confirmed orders can be cancelled"
            );
        }

        for (OrderItem item : order.getItems()) {

            Product product = item.getProduct();

            product.setStockQuantity(
                    product.getStockQuantity() + item.getQuantity()
            );

            productRepository.save(product);
        }

        order.setStatus("CANCELLED");

        Order cancelledOrder = orderRepository.save(order);

        return mapToResponse(cancelledOrder);
    }

    private Order getOrderEntityById(Long id) {

        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found with ID: " + id
                ));
    }

    private OrderResponse mapToResponse(Order order) {

        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setCustomerId(order.getCustomer().getId());
        response.setCustomerName(order.getCustomer().getName());
        response.setCustomerEmail(order.getCustomer().getEmail());
        response.setTotalAmount(order.getTotalAmount());
        response.setStatus(order.getStatus());
        response.setOrderDate(order.getOrderDate());

        List<OrderResponse.OrderItemResponse> itemResponses =
                order.getItems().stream().map(item -> {

                    OrderResponse.OrderItemResponse itemResponse =
                            new OrderResponse.OrderItemResponse();

                    itemResponse.setProductId(item.getProduct().getId());
                    itemResponse.setProductName(item.getProduct().getName());
                    itemResponse.setQuantity(item.getQuantity());
                    itemResponse.setUnitPrice(item.getUnitPrice());
                    itemResponse.setSubtotal(item.getSubtotal());

                    return itemResponse;

                }).toList();

        response.setItems(itemResponses);

        return response;
    }
}

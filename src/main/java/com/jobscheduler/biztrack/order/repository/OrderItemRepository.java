package com.jobscheduler.biztrack.order.repository;

import com.jobscheduler.biztrack.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

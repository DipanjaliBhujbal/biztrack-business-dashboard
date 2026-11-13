package com.jobscheduler.biztrack.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class OrderStatusRequest {

    @NotBlank(message = "Order status is required")
    @Pattern(
            regexp = "PENDING|CONFIRMED|SHIPPED|DELIVERED",
            message = "Status must be PENDING, CONFIRMED, SHIPPED, or DELIVERED"
    )
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}

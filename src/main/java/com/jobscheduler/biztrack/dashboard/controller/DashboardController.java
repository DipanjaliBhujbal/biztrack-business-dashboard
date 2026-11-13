package com.jobscheduler.biztrack.dashboard.controller;

import com.jobscheduler.biztrack.dashboard.dto.DashboardSummary;
import com.jobscheduler.biztrack.dashboard.service.DashboardService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public DashboardSummary getDashboardSummary() {
        return dashboardService.getDashboardSummary();
    }
}

package com.dashboard.controller;

import com.dashboard.model.DashboardData;
import com.dashboard.service.DashboardDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardApiController {

    private final DashboardDataService dashboardDataService;

    public DashboardApiController(DashboardDataService dashboardDataService) {
        this.dashboardDataService = dashboardDataService;
    }

    @GetMapping("/api/dashboard")
    public DashboardData getDashboard() {
        return dashboardDataService.getDashboardData();
    }
}

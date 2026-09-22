package com.dashboard.controller;

import com.dashboard.model.DashboardConfig;
import com.dashboard.service.DashboardConfigService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardApiController {

    private final DashboardConfigService dashboardConfigService;

    public DashboardApiController(DashboardConfigService dashboardConfigService) {
        this.dashboardConfigService = dashboardConfigService;
    }

    @GetMapping("/api/dashboard")
    public DashboardConfig getDashboard() {
        return dashboardConfigService.get();
    }
}

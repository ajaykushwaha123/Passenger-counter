package com.dashboard.controller;

import com.dashboard.model.DashboardConfig;
import com.dashboard.service.DashboardConfigService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class AdminApiController {

    private final DashboardConfigService dashboardConfigService;

    public AdminApiController(DashboardConfigService dashboardConfigService) {
        this.dashboardConfigService = dashboardConfigService;
    }

    @PostMapping("/api/admin/dashboard")
    public DashboardConfig saveDashboard(@RequestBody DashboardConfig config) throws IOException {
        return dashboardConfigService.update(config);
    }
}

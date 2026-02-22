package com.moveinsync.alertsystem.controller;
import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertHistory;
import com.moveinsync.alertsystem.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/severity-counts")
    public ResponseEntity<Map<String, Long>> getSeverityCounts() {
        return ResponseEntity.ok(dashboardService.getSeverityCounts());
    }

    @GetMapping("/top-offenders")
    public ResponseEntity<List<Map<String, Object>>> getTopOffenders() {
        return ResponseEntity.ok(dashboardService.getTopOffenders());
    }

    @GetMapping("/recent-events")
    public ResponseEntity<List<AlertHistory>> getRecentEvents() {
        return ResponseEntity.ok(dashboardService.getRecentEvents());
    }

    @GetMapping("/trends/daily")
    public ResponseEntity<List<Object[]>> getDailyTrends() {
        return ResponseEntity.ok(dashboardService.getDailyTrends());
    }

    @GetMapping("/recent-autoclosed")
    public ResponseEntity<List<Alert>> getRecentAutoClosed(@RequestParam(defaultValue = "24h") String filter) {
        return ResponseEntity.ok(dashboardService.getRecentAutoClosed(filter));
    }
}
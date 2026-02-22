package com.moveinsync.alertsystem.controller;

import com.moveinsync.alertsystem.engine.RuleConfig;
import com.moveinsync.alertsystem.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/config")
public class ConfigController {

    private final AlertService alertService;

    public ConfigController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping("/rules")
    public ResponseEntity<Map<String, RuleConfig>> getActiveRules() {
        return ResponseEntity.ok(alertService.getActiveRules());
    }
}
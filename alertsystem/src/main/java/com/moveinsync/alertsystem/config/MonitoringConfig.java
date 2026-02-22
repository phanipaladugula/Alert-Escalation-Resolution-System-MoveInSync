package com.moveinsync.alertsystem.config;

import com.moveinsync.alertsystem.service.AlertService;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MonitoringConfig {


    @Bean
    public HealthIndicator ruleEngineHealth(AlertService alertService) {
        return () -> {
            // Check if the dynamic DSL rules from rules.json are successfully loaded
            if (alertService.getActiveRules() != null && !alertService.getActiveRules().isEmpty()) {
                return Health.up()
                        .withDetail("rulesCount", alertService.getActiveRules().size())
                        .withDetail("engineStatus", "Active and Rules Loaded")
                        .build();
            }
            // Failure Handling: Reports DOWN if rules configuration is missing
            return Health.down()
                    .withDetail("reason", "Critical: Rules logic not loaded from rules.json")
                    .build();
        };
    }
}
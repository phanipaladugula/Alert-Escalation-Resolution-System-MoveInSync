package com.moveinsync.alertsystem.engine;

import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertStatus;
import org.springframework.stereotype.Component;

@Component
public class ComplianceRuleEvaluator implements AlertRuleEvaluator {
    @Override
    public boolean supports(String sourceType) {
        return "compliance".equalsIgnoreCase(sourceType);
    }

    @Override
    public void evaluate(Alert currentAlert, RuleConfig config) {
        String condition = config.getAuto_close_if();
        if (condition != null && currentAlert.getMetadata().contains(condition)) {
            currentAlert.setStatus(AlertStatus.AUTO_CLOSED);
        }
    }
}
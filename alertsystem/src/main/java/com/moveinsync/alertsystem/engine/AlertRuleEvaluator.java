package com.moveinsync.alertsystem.engine;

import com.moveinsync.alertsystem.entity.Alert;

public interface AlertRuleEvaluator {

    // Checks if this specific evaluator should handle the incoming alert
    boolean supports(String sourceType);

    // Contains the actual logic to check thresholds and escalate
    void evaluate(Alert currentAlert, RuleConfig config);
}
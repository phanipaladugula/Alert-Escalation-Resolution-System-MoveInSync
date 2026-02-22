package com.moveinsync.alertsystem.engine;

import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.entity.Severity;
import com.moveinsync.alertsystem.repository.AlertRepository;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Requirement #4: Feedback Module Rule Logic.
 * Ensures negative feedback starts as WARNING and escalates based on frequency.
 */
@Component
public class FeedbackRuleEvaluator implements AlertRuleEvaluator {
    private final AlertRepository alertRepository;

    public FeedbackRuleEvaluator(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @Override
    public boolean supports(String sourceType) {
        return "feedback_negative".equalsIgnoreCase(sourceType);
    }

    @Override
    public void evaluate(Alert currentAlert, RuleConfig config) {
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(config.getWindow_mins());

        List<Alert> history = alertRepository.findBySourceTypeAndTimestampAfter(
                currentAlert.getSourceType(), timeLimit
        );

        if (history.size() >= config.getEscalate_if_count()) {
            currentAlert.setStatus(AlertStatus.ESCALATED);
            currentAlert.setSeverity(Severity.CRITICAL);
        } else {
            currentAlert.setStatus(AlertStatus.OPEN);
            currentAlert.setSeverity(Severity.WARNING);
        }
    }
}
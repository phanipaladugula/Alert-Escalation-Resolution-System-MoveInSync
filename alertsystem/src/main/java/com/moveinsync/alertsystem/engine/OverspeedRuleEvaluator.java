package com.moveinsync.alertsystem.engine;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.entity.Severity;
import com.moveinsync.alertsystem.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;


@Component
public class OverspeedRuleEvaluator implements AlertRuleEvaluator {

    private static final Logger log = LoggerFactory.getLogger(OverspeedRuleEvaluator.class);

    private final AlertRepository alertRepository;
    private final ObjectMapper objectMapper;

    public OverspeedRuleEvaluator(AlertRepository alertRepository, ObjectMapper objectMapper) {
        this.alertRepository = alertRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(String sourceType) {
        return "overspeed".equalsIgnoreCase(sourceType);
    }

    @Override
    public void evaluate(Alert currentAlert, RuleConfig config) {
        String driverId;
        try {
            driverId = objectMapper.readTree(currentAlert.getMetadata()).get("driverId").asText();
        } catch (Exception e) {
            log.warn("Overspeed rule: could not extract driverId from metadata for alert #{}",
                    currentAlert.getAlertId());
            return;
        }

        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(config.getWindow_mins());

        List<Alert> recentViolations = alertRepository
                .findBySourceTypeAndDriverIdAndTimestampAfter("overspeed", driverId, windowStart);

        long count = recentViolations.size();
        log.debug("Driver {} has {} overspeed violation(s) in the last {} mins",
                driverId, count, config.getWindow_mins());

        if (count >= config.getEscalate_if_count()) {
            currentAlert.setSeverity(Severity.CRITICAL);
            currentAlert.setStatus(AlertStatus.ESCALATED);
            log.info("Alert #{} escalated to CRITICAL — driver {} exceeded threshold ({} violations)",
                    currentAlert.getAlertId(), driverId, count);
        } else {
            currentAlert.setSeverity(Severity.WARNING);
            currentAlert.setStatus(AlertStatus.OPEN);
        }
    }
}

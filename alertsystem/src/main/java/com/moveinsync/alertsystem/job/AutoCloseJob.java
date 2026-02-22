package com.moveinsync.alertsystem.job;

import com.moveinsync.alertsystem.engine.AlertRuleEvaluator;
import com.moveinsync.alertsystem.engine.RuleConfig;
import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertHistory;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.repository.AlertHistoryRepository;
import com.moveinsync.alertsystem.repository.AlertRepository;
import com.moveinsync.alertsystem.service.AlertService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

/**
 * Background job that periodically auto-closes stale alerts.
 *
 * Strategy:
 * 1. Re-evaluates each active alert through the rule engine.
 * If a rule condition is satisfied (e.g. compliance document renewed),
 * the alert is closed immediately regardless of TTL.
 * 2. Falls back to TTL check — any alert older than {@code alert.ttl.hours}
 * is auto-closed with reason "Time window expired".
 *
 * Idempotency: Only OPEN/ESCALATED alerts are considered.
 * An alert already in AUTO_CLOSED/RESOLVED is never touched.
 */
@Component
public class AutoCloseJob {

    private static final Logger log = LoggerFactory.getLogger(AutoCloseJob.class);


    @Value("${alert.ttl.hours:24}")
    private int ttlHours;

    private final AlertRepository alertRepository;
    private final AlertHistoryRepository historyRepository;
    private final List<AlertRuleEvaluator> evaluators;
    private final AlertService alertService;

    public AutoCloseJob(AlertRepository alertRepository,
            AlertHistoryRepository historyRepository,
            List<AlertRuleEvaluator> evaluators,
            AlertService alertService) {
        this.alertRepository = alertRepository;
        this.historyRepository = historyRepository;
        this.evaluators = evaluators;
        this.alertService = alertService;
    }


    @Scheduled(fixedRateString = "${alert.scheduler.rate-ms:120000}")
    @Transactional
    public void scanAndCloseAlerts() {
        log.info("AutoCloseJob: scanning active alerts (TTL = {}h) …", ttlHours);

        LocalDateTime expiryThreshold = LocalDateTime.now().minusHours(ttlHours);
        List<Alert> activeAlerts = alertRepository.findByStatusIn(
                Arrays.asList(AlertStatus.OPEN, AlertStatus.ESCALATED));

        Map<String, RuleConfig> rulesMap = alertService.getActiveRules();
        int ruleClosedCount = 0;
        int ttlClosedCount = 0;

        for (Alert alert : activeAlerts) {

            String typeKey = alert.getSourceType().toLowerCase();
            if (rulesMap != null && rulesMap.containsKey(typeKey)) {
                RuleConfig config = rulesMap.get(typeKey);

                for (AlertRuleEvaluator evaluator : evaluators) {
                    if (evaluator.supports(alert.getSourceType())) {
                        AlertStatus before = alert.getStatus();
                        evaluator.evaluate(alert, config);

                        if (alert.getStatus() == AlertStatus.AUTO_CLOSED) {
                            alertRepository.save(alert);
                            logHistory(alert, before, AlertStatus.AUTO_CLOSED, "Rule condition satisfied by scheduler");
                            ruleClosedCount++;
                            break;
                        }
                        if (alert.getStatus() != before) {
                            alertRepository.save(alert);
                        }
                        break;
                    }
                }
            }

            if (alert.getStatus() == AlertStatus.AUTO_CLOSED)
                continue;

            if (alert.getTimestamp().isBefore(expiryThreshold)) {
                AlertStatus before = alert.getStatus();
                alert.setStatus(AlertStatus.AUTO_CLOSED);
                alertRepository.save(alert);
                logHistory(alert, before, AlertStatus.AUTO_CLOSED,
                        "Time window expired (" + ttlHours + "h policy)");
                ttlClosedCount++;
            }
        }

        log.info("AutoCloseJob complete — rule-closed: {}, TTL-closed: {}", ruleClosedCount, ttlClosedCount);
    }

    private void logHistory(Alert alert, AlertStatus from, AlertStatus to, String reason) {
        AlertHistory history = new AlertHistory();
        history.setAlertId(alert.getAlertId());
        history.setPreviousStatus(from);
        history.setNewStatus(to);
        history.setTransitionTime(LocalDateTime.now());
        history.setReason(reason);
        historyRepository.save(history);
        log.info("Auto-closed alert #{} — {}", alert.getAlertId(), reason);
    }
}
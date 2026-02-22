package com.moveinsync.alertsystem.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moveinsync.alertsystem.dto.AlertRequestDTO;
import com.moveinsync.alertsystem.entity.*;
import com.moveinsync.alertsystem.engine.AlertRuleEvaluator;
import com.moveinsync.alertsystem.engine.RuleConfig;
import com.moveinsync.alertsystem.entity.AlertHistory;
import com.moveinsync.alertsystem.repository.AlertHistoryRepository;
import com.moveinsync.alertsystem.repository.AlertRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class AlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final List<AlertRuleEvaluator> evaluators;
    private final AlertHistoryRepository historyRepository;

    private Map<String, RuleConfig> rulesMap;

    public AlertService(AlertRepository alertRepository,
            List<AlertRuleEvaluator> evaluators,
            AlertHistoryRepository historyRepository) {
        this.alertRepository = alertRepository;
        this.evaluators = evaluators;
        this.historyRepository = historyRepository;
    }

    @PostConstruct
    public void loadRules() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        ClassPathResource resource = new ClassPathResource("rules.json");
        rulesMap = mapper.readValue(resource.getInputStream(), new TypeReference<>() {
        });
        logger.info("Successfully loaded {} alert rules from rules.json", rulesMap.size());
    }

    @Transactional
    @CacheEvict(value = "topDrivers", allEntries = true)
    public Alert createAlert(AlertRequestDTO dto) {
        // Validate that metadata is valid JSON before anything else
        if (!dto.isMetadataValidJson()) {
            throw new IllegalArgumentException(
                    "metadata must be a valid JSON object. Example: {\"driverId\": \"DRV-001\", \"speed_kmph\": 95}");
        }

        Alert alert = new Alert();
        alert.setSourceType(dto.getSourceType());

        if ("compliance".equalsIgnoreCase(dto.getSourceType())) {
            alert.setSeverity(Severity.INFO);
        } else {
            alert.setSeverity(Severity.WARNING);
        }

        alert.setMetadata(dto.getMetadata());
        alert.setTimestamp(LocalDateTime.now());
        alert.setStatus(AlertStatus.OPEN);

        Alert savedAlert = alertRepository.save(alert);

        String typeKey = savedAlert.getSourceType().toLowerCase();
        if (rulesMap != null && rulesMap.containsKey(typeKey)) {
            RuleConfig config = rulesMap.get(typeKey);

            for (AlertRuleEvaluator evaluator : evaluators) {
                if (evaluator.supports(savedAlert.getSourceType())) {
                    evaluator.evaluate(savedAlert, config);
                    alertRepository.save(savedAlert);
                    break;
                }
            }
        }


        logHistory(savedAlert.getAlertId(), null, savedAlert.getStatus(),
                "System Ingested: " + savedAlert.getSourceType() + " (" + savedAlert.getSeverity() + ")");

        return savedAlert;
    }

    public Alert resolveAlert(Long id) {
        Alert alert = getAlertById(id);

        if (alert.getStatus() == AlertStatus.RESOLVED || alert.getStatus() == AlertStatus.AUTO_CLOSED) {
            throw new RuntimeException("Alert #" + id + " is already in a closed state.");
        }

        AlertStatus oldStatus = alert.getStatus();
        alert.setStatus(AlertStatus.RESOLVED);

        logHistory(alert.getAlertId(), oldStatus, AlertStatus.RESOLVED, "Manually resolved via API");
        return alertRepository.save(alert);
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Alert not found with ID: " + id));
    }

    private void logHistory(Long alertId, AlertStatus oldStatus, AlertStatus newStatus, String reason) {
        AlertHistory history = new AlertHistory();
        history.setAlertId(alertId);
        history.setPreviousStatus(oldStatus);
        history.setNewStatus(newStatus);
        history.setTransitionTime(LocalDateTime.now());
        history.setReason(reason);
        historyRepository.save(history);
    }

    public List<AlertHistory> getAlertHistory(Long id) {
        return historyRepository.findByAlertIdOrderByTransitionTimeDesc(id);
    }

    public Page<Alert> getAllAlerts(PageRequest pageRequest) {
        return alertRepository.findAll(pageRequest);
    }

    public Map<String, RuleConfig> getActiveRules() {
        return this.rulesMap;
    }
}

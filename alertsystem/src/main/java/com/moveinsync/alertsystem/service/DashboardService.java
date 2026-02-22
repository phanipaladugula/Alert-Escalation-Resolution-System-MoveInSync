package com.moveinsync.alertsystem.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertHistory;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.entity.Severity;
import com.moveinsync.alertsystem.repository.AlertHistoryRepository;
import com.moveinsync.alertsystem.repository.AlertRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final AlertRepository alertRepository;
    private final AlertHistoryRepository historyRepository;

    public DashboardService(AlertRepository alertRepository, AlertHistoryRepository historyRepository) {
        this.alertRepository = alertRepository;
        this.historyRepository = historyRepository;
    }

    // 1. Alert counts grouped by severity level
    public Map<String, Long> getSeverityCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("CRITICAL", alertRepository.countBySeverity(Severity.CRITICAL));
        counts.put("WARNING", alertRepository.countBySeverity(Severity.WARNING));
        counts.put("INFO", alertRepository.countBySeverity(Severity.INFO));
        return counts;
    }


    @Cacheable("topDrivers")
    public List<Map<String, Object>> getTopOffenders() {
        List<Alert> activeAlerts = alertRepository.findByStatusIn(
                Arrays.asList(AlertStatus.OPEN, AlertStatus.ESCALATED));
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Long> driverCounts = activeAlerts.stream()
                .map(alert -> {
                    try {
                        JsonNode node = mapper.readTree(alert.getMetadata());
                        if (node.has("driverId"))
                            return node.get("driverId").asText();
                        if (node.has("driverID"))
                            return node.get("driverID").asText();
                        return "Unknown";
                    } catch (Exception e) {
                        return "Unknown";
                    }
                })
                .filter(id -> !"Unknown".equals(id))
                .collect(Collectors.groupingBy(id -> id, Collectors.counting()));

        return driverCounts.entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(5)
                .map(e -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("driverId", e.getKey());
                    row.put("count", e.getValue());
                    return row;
                })
                .collect(Collectors.toList());
    }

    public List<Alert> getRecentAutoClosed(String filter) {
        LocalDateTime timeLimit = "7d".equalsIgnoreCase(filter)
                ? LocalDateTime.now().minusDays(7)
                : LocalDateTime.now().minusHours(24);
        return alertRepository.findByStatusAndTimestampAfterOrderByTimestampDesc(AlertStatus.AUTO_CLOSED, timeLimit);
    }

    public List<AlertHistory> getRecentEvents() {
        return historyRepository.findTop50ByOrderByTransitionTimeDesc();
    }

    public List<Object[]> getDailyTrends() {
        return alertRepository.countAlertsByDate();
    }

    @CacheEvict(value = "topDrivers", allEntries = true)
    @Scheduled(fixedRate = 60000)
    public void evictTopOffendersCache() {
    }
}
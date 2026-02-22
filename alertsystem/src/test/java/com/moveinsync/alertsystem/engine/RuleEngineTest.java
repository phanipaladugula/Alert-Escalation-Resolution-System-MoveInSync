package com.moveinsync.alertsystem.engine;

import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.entity.Severity;
import com.moveinsync.alertsystem.repository.AlertRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

class RuleEngineTest {

    @Mock
    private AlertRepository alertRepository;

    @InjectMocks
    private OverspeedRuleEvaluator evaluator;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testOverspeedEscalatesToCriticalOnThirdViolation() {
        // Arrange
        RuleConfig config = new RuleConfig();
        config.setWindow_mins(15);

        Alert currentAlert = new Alert();
        currentAlert.setAlertId(3L);
        currentAlert.setSourceType("overspeed");
        currentAlert.setMetadata("{\"driverId\":\"driver-xyz\"}");
        currentAlert.setTimestamp(LocalDateTime.now());
        // Default severity before evaluation
        currentAlert.setSeverity(Severity.WARNING);
        currentAlert.setStatus(AlertStatus.OPEN);

        // Previous 2 alerts + this current 1 = 3 total alerts in the recent window
        List<Alert> recentAlerts = new ArrayList<>();
        Alert pastAlert1 = new Alert();
        pastAlert1.setMetadata("{\"driverId\":\"driver-xyz\"}");
        Alert pastAlert2 = new Alert();
        pastAlert2.setMetadata("{\"driverId\":\"driver-xyz\"}");

        recentAlerts.add(pastAlert1);
        recentAlerts.add(pastAlert2);
        recentAlerts.add(currentAlert);

        when(alertRepository.findBySourceTypeAndTimestampAfter(eq("overspeed"), any(LocalDateTime.class)))
                .thenReturn(recentAlerts);

        // Act
        evaluator.evaluate(currentAlert, config);

        // Assert - The third violation should escalate to CRITICAL/ESCALATED
        assertEquals(Severity.CRITICAL, currentAlert.getSeverity(),
                "3rd violation should escalate severity to CRITICAL");
        assertEquals(AlertStatus.ESCALATED, currentAlert.getStatus(),
                "3rd violation should escalate status to ESCALATED");
    }

    @Test
    void testOverspeedRemainsWarningOnSecondViolation() {
        // Arrange
        RuleConfig config = new RuleConfig();
        config.setWindow_mins(15);

        Alert currentAlert = new Alert();
        currentAlert.setAlertId(2L);
        currentAlert.setSourceType("overspeed");
        currentAlert.setMetadata("{\"driverId\":\"driver-xyz\"}");
        currentAlert.setTimestamp(LocalDateTime.now());
        currentAlert.setSeverity(Severity.WARNING);
        currentAlert.setStatus(AlertStatus.OPEN);

        // 1 previous + current = 2 total
        List<Alert> recentAlerts = new ArrayList<>();
        Alert pastAlert1 = new Alert();
        pastAlert1.setMetadata("{\"driverId\":\"driver-xyz\"}");

        recentAlerts.add(pastAlert1);
        recentAlerts.add(currentAlert);

        when(alertRepository.findBySourceTypeAndTimestampAfter(eq("overspeed"), any(LocalDateTime.class)))
                .thenReturn(recentAlerts);

        // Act
        evaluator.evaluate(currentAlert, config);

        // Assert - Should remain WARNING
        assertEquals(Severity.WARNING, currentAlert.getSeverity(), "2nd violation should remain WARNING");
        assertEquals(AlertStatus.OPEN, currentAlert.getStatus(), "2nd violation should remain OPEN");
    }
}

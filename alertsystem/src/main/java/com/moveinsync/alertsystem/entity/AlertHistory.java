package com.moveinsync.alertsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AlertHistory { // Ensure 'public' is here
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    private Long alertId;

    @Enumerated(EnumType.STRING)
    private AlertStatus previousStatus;

    @Enumerated(EnumType.STRING)
    private AlertStatus newStatus;

    private LocalDateTime transitionTime;
    private String reason;
}
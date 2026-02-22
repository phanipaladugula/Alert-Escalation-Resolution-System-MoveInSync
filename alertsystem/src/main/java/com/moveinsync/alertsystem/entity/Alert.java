package com.moveinsync.alertsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;


@Entity
@Data
@Table(name = "alert", indexes = {
        @Index(name = "idx_source_timestamp", columnList = "sourceType, timestamp"),
        @Index(name = "idx_status", columnList = "status")
})
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long alertId;

    private String sourceType;

    @Enumerated(EnumType.STRING)
    private Severity severity;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
package com.moveinsync.alertsystem.repository;

import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertStatus;
import com.moveinsync.alertsystem.entity.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    // Rule engine — windowed query; uses composite index idx_source_timestamp
    List<Alert> findBySourceTypeAndTimestampAfter(String sourceType, LocalDateTime timeLimit);


    @Query(value = "SELECT * FROM alert WHERE source_type = :sourceType " +
            "AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.driverId')) = :driverId " +
            "AND timestamp > :timeLimit", nativeQuery = true)
    List<Alert> findBySourceTypeAndDriverIdAndTimestampAfter(
            @Param("sourceType") String sourceType,
            @Param("driverId") String driverId,
            @Param("timeLimit") LocalDateTime timeLimit);

    List<Alert> findByStatusIn(List<AlertStatus> statuses);

    // Dashboard queries — uses idx_status index
    long countBySeverity(Severity severity);

    List<Alert> findByStatus(AlertStatus status);

    List<Alert> findTop10ByStatusOrderByTimestampDesc(AlertStatus status);

    List<Alert> findByStatusAndTimestampAfterOrderByTimestampDesc(AlertStatus status, LocalDateTime timeLimit);

    // Trend chart query
    @Query("SELECT DATE(a.timestamp) as date, COUNT(a) as count FROM Alert a GROUP BY DATE(a.timestamp)")
    List<Object[]> countAlertsByDate();
}

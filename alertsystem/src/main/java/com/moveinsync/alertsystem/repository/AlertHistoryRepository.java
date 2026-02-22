package com.moveinsync.alertsystem.repository;

import com.moveinsync.alertsystem.entity.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
    List<AlertHistory> findByAlertIdOrderByTransitionTimeDesc(Long alertId);
    List<AlertHistory> findTop50ByOrderByTransitionTimeDesc();
}
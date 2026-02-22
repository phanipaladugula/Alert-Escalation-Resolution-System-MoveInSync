package com.moveinsync.alertsystem.controller;

import com.moveinsync.alertsystem.dto.AlertRequestDTO;
import com.moveinsync.alertsystem.entity.Alert;
import com.moveinsync.alertsystem.entity.AlertHistory;
import com.moveinsync.alertsystem.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts") // Base URL for this controller
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    // This endpoint handles POST requests to ingest new alerts
    @PostMapping
    public ResponseEntity<Alert> ingestAlert(@Valid @RequestBody AlertRequestDTO requestDTO) {

        Alert savedAlert = alertService.createAlert(requestDTO);

        // Return a 201 Created status along with the saved data
        return new ResponseEntity<>(savedAlert, HttpStatus.CREATED);
    }

    // GET: Drill-down into a specific alert
    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    // PATCH: Manually resolve an alert
    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Alert> resolveAlert(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.resolveAlert(id));
    }

    @GetMapping
    public ResponseEntity<Page<Alert>> getAllAlerts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "timestamp") String sortBy) {


        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        return ResponseEntity.ok(alertService.getAllAlerts(pageRequest));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<AlertHistory>> getAlertHistory(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertHistory(id));
    }
}
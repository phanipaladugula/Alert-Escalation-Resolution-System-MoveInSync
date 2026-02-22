package com.moveinsync.alertsystem.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AlertRequestDTO {

    @NotBlank(message = "sourceType cannot be empty. Use: overspeed, feedback_negative, or compliance")
    private String sourceType;

    @NotBlank(message = "metadata cannot be empty")
    private String metadata;

    public boolean isMetadataValidJson() {
        try {
            new ObjectMapper().readTree(this.metadata);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}

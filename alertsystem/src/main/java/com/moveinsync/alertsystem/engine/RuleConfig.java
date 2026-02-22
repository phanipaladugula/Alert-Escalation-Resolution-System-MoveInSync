package com.moveinsync.alertsystem.engine;

import lombok.Data;

@Data
public class RuleConfig {
    private Integer escalate_if_count;
    private Integer window_mins;
    private String auto_close_if;
}
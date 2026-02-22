export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertStatus = 'OPEN' | 'ESCALATED' | 'AUTO_CLOSED' | 'RESOLVED';

export interface RuleConfig {
    escalate_if_count?: number;
    window_mins?: number;
    auto_close_if?: string;
}


export interface Alert {
    alertId: number;
    sourceType: string;
    severity: Severity;
    timestamp: string; // ISO 8601 string from LocalDateTime
    status: AlertStatus;
    metadata: string;
}

export interface AlertRequestDTO {
    sourceType: string;
    metadata: string;
}

export interface AlertHistory {
    historyId: number;
    alertId: number;
    previousStatus: AlertStatus;
    newStatus: AlertStatus;
    transitionTime: string; // ISO 8601 string
    reason: string;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: any;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: any;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

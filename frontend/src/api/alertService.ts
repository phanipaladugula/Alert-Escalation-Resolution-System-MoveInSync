import axios from 'axios';
import type { Alert, AlertRequestDTO, AlertHistory, PaginatedResponse } from '../types';

// Single axios instance using the Vite proxy (all /api/* goes to localhost:8080)
export const api = axios.create({
    baseURL: '/api',
});

// Attach JWT token to every outgoing request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor - redirect to login on 401
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const alertService = {
    // ─── Alert CRUD ─────────────────────────────────────────────────────────
    getAlerts: async (page = 0, size = 10, sortBy = 'timestamp') => {
        const response = await api.get<PaginatedResponse<Alert>>('/alerts', {
            params: { page, size, sortBy }
        });
        return response.data;
    },

    getAlertById: async (id: number) => {
        const response = await api.get<Alert>(`/alerts/${id}`);
        return response.data;
    },

    createAlert: async (data: AlertRequestDTO) => {
        const response = await api.post<Alert>('/alerts', data);
        return response.data;
    },

    resolveAlert: async (id: number) => {
        const response = await api.patch<Alert>(`/alerts/${id}/resolve`);
        return response.data;
    },

    getAlertHistory: async (id: number) => {
        const response = await api.get<AlertHistory[]>(`/alerts/${id}/history`);
        return response.data;
    },

    // ─── Dashboard Analytics ─────────────────────────────────────────────────
    getSeverityCounts: async () => {
        const response = await api.get<Record<string, number>>('/dashboard/severity-counts');
        return response.data;
    },

    getTopOffenders: async () => {
        const response = await api.get<{ driverId: string; count: number }[]>('/dashboard/top-offenders');
        return response.data;
    },

    getRecentEvents: async () => {
        const response = await api.get<AlertHistory[]>('/dashboard/recent-events');
        return response.data;
    },

    getRecentAutoClosed: async (filter: '24h' | '7d' = '24h') => {
        const response = await api.get<Alert[]>('/dashboard/recent-autoclosed', {
            params: { filter }
        });
        return response.data;
    },

    getDailyTrends: async () => {
        const response = await api.get<[string, number][]>('/dashboard/trends/daily');
        return response.data;
    },
};

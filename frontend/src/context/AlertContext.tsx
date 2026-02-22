import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { alertService } from '../api/alertService';
import type { Alert, PaginatedResponse } from '../types';
import toast from 'react-hot-toast';

interface AlertContextType {
    alerts: Alert[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    loading: boolean;
    fetchAlerts: (page?: number, size?: number) => Promise<void>;
    resolveAlert: (id: number) => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchAlerts = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        try {
            const response: PaginatedResponse<Alert> = await alertService.getAlerts(page, size);
            setAlerts(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
            setCurrentPage(response.number);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            toast.error('Failed to load alerts.');
        } finally {
            setLoading(false);
        }
    }, []);

    const resolveAlert = useCallback(async (id: number) => {
        try {
            await alertService.resolveAlert(id);
            toast.success('Alert resolved successfully');
            // Refresh the current page to reflect changes
            await fetchAlerts(currentPage);
        } catch (error) {
            console.error('Failed to resolve alert:', error);
            toast.error('Failed to resolve alert.');
            throw error;
        }
    }, [currentPage, fetchAlerts]);

    return (
        <AlertContext.Provider value={{
            alerts,
            totalElements,
            totalPages,
            currentPage,
            loading,
            fetchAlerts,
            resolveAlert
        }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlerts = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlerts must be used within an AlertProvider');
    }
    return context;
};

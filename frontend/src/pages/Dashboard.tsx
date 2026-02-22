import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alertService } from '../api/alertService';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Trophy, AlertTriangle, Info, Skull } from 'lucide-react';
import { AlertDetail } from './AlertDetail';
import type { Alert, PaginatedResponse } from '../types';

export const Dashboard = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

    // Queries using React Query for automatic polling & caching natively
    const { data: alertsData, isLoading: alertsLoading } = useQuery<PaginatedResponse<Alert>>({
        queryKey: ['alerts', page],
        queryFn: () => alertService.getAlerts(page, 10, 'timestamp'),
        refetchInterval: 5000,    // Poll alerts table every 5s
        refetchOnMount: true,
    });

    const { data: severityCounts } = useQuery({
        queryKey: ['severityCounts'],
        queryFn: () => alertService.getSeverityCounts(),
        refetchInterval: 5000 // Poll every 5s
    });

    const { data: topOffenders } = useQuery({
        queryKey: ['topOffenders'],
        queryFn: () => alertService.getTopOffenders(),
        refetchInterval: 10000 // Poll every 10s
    });

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(dateString));
    };

    return (
        <div className="space-y-6 relative h-full">
            {/* Overlay when drawer is open */}
            {selectedAlertId && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
                    onClick={() => setSelectedAlertId(null)}
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Active Alerts Command Center</h2>
                    <p className="text-slate-400 text-sm mt-1">Manage, monitor, and resolve system violations instantly.</p>
                </div>
                <button
                    onClick={() => navigate('/create')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Ingest Alert
                </button>
            </div>

            {/* Analytics Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 border-l-4 border-red-500 p-6 rounded-xl shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Critical Faults</p>
                            <h3 className="text-3xl font-bold text-white">{severityCounts?.CRITICAL || 0}</h3>
                        </div>
                        <div className="p-3 bg-red-500/10 rounded-lg"><Skull className="w-8 h-8 text-red-500" /></div>
                    </div>
                </div>

                <div className="bg-slate-800 border-l-4 border-yellow-500 p-6 rounded-xl shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Active Warnings</p>
                            <h3 className="text-3xl font-bold text-white">{severityCounts?.WARNING || 0}</h3>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg"><AlertTriangle className="w-8 h-8 text-yellow-500" /></div>
                    </div>
                </div>

                <div className="bg-slate-800 border-l-4 border-blue-500 p-6 rounded-xl shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Information</p>
                            <h3 className="text-3xl font-bold text-white">{severityCounts?.INFO || 0}</h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-lg"><Info className="w-8 h-8 text-blue-500" /></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Alerts Table */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 shadow-xl rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700 bg-slate-800/80">
                        <h3 className="text-lg font-semibold text-white">System Feed</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-800/50 border-b border-slate-700 text-slate-300 text-xs uppercase tracking-wider">
                                    <th className="p-4 font-semibold">ID</th>
                                    <th className="p-4 font-semibold">Source</th>
                                    <th className="p-4 font-semibold">Severity</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 text-sm">
                                {alertsLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500" />
                                        </td>
                                    </tr>
                                ) : !alertsData?.content?.length ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-slate-400">
                                            <AlertCircle className="w-10 h-10 mx-auto text-slate-500 mb-2" />
                                            <p className="font-medium text-slate-300">No active alerts</p>
                                        </td>
                                    </tr>
                                ) : (
                                    alertsData.content.map((alert) => (
                                        <tr
                                            key={alert.alertId}
                                            onClick={() => setSelectedAlertId(alert.alertId)}
                                            className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-4 text-slate-300 font-medium">#{alert.alertId}</td>
                                            <td className="p-4 text-slate-200">{alert.sourceType}</td>
                                            <td className="p-4"><SeverityBadge severity={alert.severity} /></td>
                                            <td className="p-4"><StatusBadge status={alert.status} /></td>
                                            <td className="p-4 text-slate-400 whitespace-nowrap">{formatDate(alert.timestamp)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {alertsData && alertsData.totalPages > 1 && (
                        <div className="p-4 border-t border-slate-700 bg-slate-800/50 flex items-center justify-between text-sm">
                            <span className="text-slate-400">
                                Page {page + 1} of {alertsData.totalPages}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(alertsData.totalPages - 1, p + 1))}
                                    disabled={page >= alertsData.totalPages - 1}
                                    className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Offenders Leaderboard */}
                <div className="bg-slate-800 border border-slate-700 shadow-xl rounded-xl flex flex-col overflow-hidden max-h-[600px]">
                    <div className="p-4 border-b border-slate-700 flex items-center space-x-2 bg-slate-800/80">
                        <Trophy className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-semibold text-white">Top 5 Offenders</h3>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {!topOffenders?.length ? (
                            <p className="text-slate-400 text-sm text-center py-8">No specific offenders recorded currently.</p>
                        ) : (
                            <ul className="space-y-3">
                                {topOffenders.map((offender, index) => (
                                    <li key={offender.driverId} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-500/20 text-amber-500' :
                                                index === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                    index === 2 ? 'bg-amber-700/20 text-amber-600' :
                                                        'bg-slate-800 text-slate-500'
                                                }`}>
                                                #{index + 1}
                                            </div>
                                            <span className="font-medium text-slate-200">{offender.driverId}</span>
                                        </div>
                                        <div className="bg-red-500/10 text-red-500 px-2.5 py-1 rounded text-xs font-bold border border-red-500/20">
                                            {offender.count} Violations
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Drill-down Side Drawer */}
            {selectedAlertId && (
                <AlertDetail
                    id={selectedAlertId}
                    onClose={() => setSelectedAlertId(null)}
                />
            )}
        </div>
    );
};

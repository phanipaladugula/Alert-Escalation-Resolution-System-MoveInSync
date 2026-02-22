import { useEffect, useState } from 'react';
import { alertService } from '../api/alertService';
import { useQueryClient } from '@tanstack/react-query';
import type { Alert, AlertHistory } from '../types';
import { SeverityBadge, StatusBadge } from '../components/Badge';
import { X, CheckCircle2, Clock, Terminal, Activity, FileJson, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AlertDetailProps {
    id: number;
    onClose: () => void;
}

export const AlertDetail = ({ id, onClose }: AlertDetailProps) => {
    const queryClient = useQueryClient();
    const [alert, setAlert] = useState<Alert | null>(null);
    const [history, setHistory] = useState<AlertHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const [alertData, historyData] = await Promise.all([
                    alertService.getAlertById(id),
                    alertService.getAlertHistory(id)
                ]);
                setAlert(alertData);
                setHistory(historyData);
            } catch {
                toast.error('Failed to load alert details');
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id, onClose]);

    const handleResolve = async () => {
        if (!alert) return;
        setResolving(true);
        try {
            const updated = await alertService.resolveAlert(alert.alertId);
            setAlert(updated);
            const historyData = await alertService.getAlertHistory(alert.alertId);
            setHistory(historyData);
            toast.success(`Alert #${alert.alertId} marked as RESOLVED`);
            // Invalidate React Query cache so Dashboard table and leaderboard refresh
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
            queryClient.invalidateQueries({ queryKey: ['topOffenders'] });
            queryClient.invalidateQueries({ queryKey: ['severityCounts'] });
        } catch {
            toast.error('Failed to resolve alert');
        } finally {
            setResolving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }).format(new Date(dateString));
    };

    const formatMetadata = (raw: string) => {
        try { return JSON.stringify(JSON.parse(raw), null, 2); }
        catch { return raw; }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-slate-800 border-l border-slate-700 shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-700 flex items-start justify-between bg-slate-800/90 backdrop-blur">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-white">Alert #{id}</h2>
                        {alert && <SeverityBadge severity={alert.severity} />}
                        {alert && <StatusBadge status={alert.status} />}
                    </div>
                    {alert && (
                        <p className="text-slate-400 text-sm mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(alert.timestamp)}
                        </p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <Activity className="w-8 h-8 animate-pulse text-indigo-500" />
                    </div>
                ) : alert ? (
                    <>
                        {/* Source Type */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Terminal className="w-3.5 h-3.5" />
                                Module / Source
                            </h3>
                            <div className="bg-slate-900/60 border border-slate-700/60 p-3 rounded-lg">
                                <p className="text-slate-200 font-medium capitalize">{alert.sourceType.replace('_', ' ')}</p>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <FileJson className="w-3.5 h-3.5" />
                                Metadata Payload
                            </h3>
                            <pre className="bg-slate-950 border border-slate-700 p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                                {formatMetadata(alert.metadata)}
                            </pre>
                        </div>

                        {/* History Timeline */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Status Transition History
                            </h3>

                            {history.length === 0 ? (
                                <p className="text-slate-500 text-sm italic bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                    No transitions recorded yet.
                                </p>
                            ) : (
                                <div className="relative border-l border-slate-700 ml-3 space-y-4">
                                    {history.map((record) => (
                                        <div key={record.historyId} className="relative pl-5">
                                            <span className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-800" />
                                            <div className="bg-slate-900/60 border border-slate-700/40 p-3 rounded-lg space-y-1.5">
                                                <div className="flex items-center gap-2 flex-wrap text-sm">
                                                    {record.previousStatus
                                                        ? <StatusBadge status={record.previousStatus} />
                                                        : <span className="text-slate-500 text-xs">Ingested</span>
                                                    }
                                                    <span className="text-slate-600">→</span>
                                                    <StatusBadge status={record.newStatus} />
                                                </div>
                                                {record.reason && (
                                                    <p className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded">
                                                        {record.reason}
                                                    </p>
                                                )}
                                                <p className="text-slate-500 text-xs">
                                                    {formatDate(record.transitionTime)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <AlertCircle className="w-10 h-10 mb-2" />
                        <p>Alert not found</p>
                    </div>
                )}
            </div>

            {/* Footer: Resolve Action */}
            {alert && alert.status !== 'RESOLVED' && alert.status !== 'AUTO_CLOSED' && (
                <div className="p-5 border-t border-slate-700 bg-slate-800/80">
                    <button
                        onClick={handleResolve}
                        disabled={resolving}
                        className="flex items-center justify-center gap-2 w-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        {resolving
                            ? <Activity className="w-5 h-5 animate-spin" />
                            : <CheckCircle2 className="w-5 h-5" />
                        }
                        <span>{resolving ? 'Resolving...' : 'Mark as Resolved'}</span>
                    </button>
                </div>
            )}
        </div>
    );
};

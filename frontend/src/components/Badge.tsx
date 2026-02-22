import { cn } from '../utils/cn';
import type { Severity, AlertStatus } from '../types';

export const SeverityBadge = ({ severity }: { severity: Severity }) => {
    const styles: Record<Severity, string> = {
        CRITICAL: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        WARNING: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        INFO: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', styles[severity])}>
            {severity}
        </span>
    );
};

export const StatusBadge = ({ status }: { status: AlertStatus }) => {
    const styles: Record<AlertStatus, string> = {
        OPEN: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        ESCALATED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        AUTO_CLOSED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        RESOLVED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };

    return (
        <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold border', styles[status])}>
            {status}
        </span>
    );
};

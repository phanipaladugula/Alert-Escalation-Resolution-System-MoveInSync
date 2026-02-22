import { useQuery } from '@tanstack/react-query';
import { api } from '../api/alertService';
import { Settings, RefreshCw, Clock, Hash } from 'lucide-react';
import type { RuleConfig } from '../types';

const fetchActiveRules = async (): Promise<Record<string, RuleConfig>> => {
    const response = await api.get('/admin/config/rules', { baseURL: '/api' });
    return response.data;
};

export const ConfigPage = () => {
    const { data: rules, isLoading, error, refetch } = useQuery({
        queryKey: ['activeRules'],
        queryFn: fetchActiveRules,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-400" />
                        Rule Engine Configuration
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Live view of the DSL rules loaded from <code className="bg-slate-700 px-1.5 py-0.5 rounded text-indigo-300 text-xs">rules.json</code>.
                        These drive automated escalation and closure behavior.
                    </p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Reload
                </button>
            </div>

            {isLoading && (
                <div className="flex items-center justify-center h-40 bg-slate-800 rounded-xl border border-slate-700">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">
                    Failed to load rules. Ensure you are authenticated and the backend is running.
                </div>
            )}

            {rules && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(rules).map(([alertType, config]) => (
                        <div key={alertType} className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-slate-700 bg-slate-800/80 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="text-white font-semibold capitalize">{alertType.replace('_', ' ')}</h3>
                            </div>

                            <div className="p-4 space-y-3">
                                {config.escalate_if_count != null && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <Hash className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Escalate After</p>
                                            <p className="text-white font-medium">{config.escalate_if_count} violations</p>
                                        </div>
                                    </div>
                                )}

                                {config.window_mins != null && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="p-2 bg-amber-500/10 rounded-lg">
                                            <Clock className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Within Time Window</p>
                                            <p className="text-white font-medium">
                                                {config.window_mins >= 60
                                                    ? `${config.window_mins / 60} hour${config.window_mins > 60 ? 's' : ''}`
                                                    : `${config.window_mins} mins`}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {config.auto_close_if && (
                                    <div className="flex items-start gap-3 text-sm">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <Settings className="w-4 h-4 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs">Auto-Close Condition</p>
                                            <p className="text-white font-medium font-mono text-xs bg-slate-900 px-2 py-1 rounded mt-1 border border-slate-700">
                                                metadata contains "{config.auto_close_if}"
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-slate-700 bg-slate-900/40">
                                <p className="text-slate-500 text-xs font-mono">
                                    {JSON.stringify(config, null, 0)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    Rule DSL Format
                </h3>
                <p className="text-slate-400 text-sm mb-3">
                    Rules are defined in <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-xs">src/main/resources/rules.json</code> and loaded at startup:
                </p>
                <pre className="bg-slate-950 border border-slate-700 rounded-lg p-4 text-emerald-400 text-sm font-mono overflow-x-auto">
                    {`{
  "overspeed": { "escalate_if_count": 3, "window_mins": 60 },
  "feedback_negative": { "escalate_if_count": 2, "window_mins": 1440 },
  "compliance": { "auto_close_if": "document_valid" }
}`}
                </pre>
            </div>
        </div>
    );
};

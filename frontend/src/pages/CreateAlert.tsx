import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { alertService } from '../api/alertService';
import { AlertCircle, FileText, Send, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface AlertFormData {
    sourceType: string;
    metadata: string;
}

// Smart metadata templates matching the backend rule engine keys
const SOURCE_TYPES = [
    {
        value: 'overspeed',
        label: '🚗 Overspeed Violation',
        template: JSON.stringify({ driverId: 'DRV-001', vehicleId: 'VH-123', speed_kmph: 95, limit_kmph: 60, location: 'Highway NH-44' }, null, 2),
        hint: 'Escalates to CRITICAL after 3 violations within 1 hour'
    },
    {
        value: 'feedback_negative',
        label: '⭐ Negative Driver Feedback',
        template: JSON.stringify({ driverId: 'DRV-002', rating: 1, comment: 'Rash driving', passenger: 'P-789' }, null, 2),
        hint: 'Escalates after 2 bad feedbacks within 24 hours'
    },
    {
        value: 'compliance',
        label: '📋 Compliance / Document Expiry',
        template: JSON.stringify({ driverId: 'DRV-003', document_type: 'license', expiry_date: '2024-01-15', status: 'expired' }, null, 2),
        hint: 'Auto-closes if metadata contains "document_valid"'
    },
];

export const CreateAlert = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(SOURCE_TYPES[0]);
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<AlertFormData>({
        defaultValues: {
            sourceType: SOURCE_TYPES[0].value,
            metadata: SOURCE_TYPES[0].template,
        }
    });

    const handleSourceTypeChange = (value: string) => {
        const type = SOURCE_TYPES.find(t => t.value === value);
        if (type) {
            setSelectedType(type);
            setValue('sourceType', type.value);
            setValue('metadata', type.template);
        }
    };

    const onSubmit: SubmitHandler<AlertFormData> = async (data) => {
        try {
            const created = await alertService.createAlert({ sourceType: data.sourceType, metadata: data.metadata });
            toast.success(`Alert #${created.alertId} ingested — Severity: ${created.severity}, Status: ${created.status}`);
            navigate('/');
        } catch (error: any) {
            const msg = error?.response?.data?.message || error?.response?.data?.validationErrors?.metadata || 'Failed to create alert. Check your input.';
            toast.error(msg);
            console.error(error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
                    <AlertCircle className="w-6 h-6 mr-2 text-indigo-500" />
                    Ingest New Alert
                </h2>
                <p className="text-slate-400 text-sm mt-1">Submit an alert from one of the fleet monitoring modules.</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Source Type Selection */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                            Module / Source Type
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {SOURCE_TYPES.map((type) => (
                                <label
                                    key={type.value}
                                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${selectedType.value === type.value
                                        ? 'border-indigo-500 bg-indigo-500/10'
                                        : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
                                        }`}
                                    onClick={() => handleSourceTypeChange(type.value)}
                                >
                                    <input
                                        type="radio"
                                        className="mt-1 accent-indigo-500"
                                        checked={selectedType.value === type.value}
                                        onChange={() => handleSourceTypeChange(type.value)}
                                        value={type.value}
                                    />
                                    <div>
                                        <p className="text-slate-200 font-medium">{type.label}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{type.hint}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Metadata Field */}
                    <div className="space-y-2">
                        <label htmlFor="metadata" className="block text-sm font-medium text-slate-300 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" />
                            Metadata (JSON Payload)
                        </label>
                        <div className="rounded-lg border border-slate-700 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 border-b border-slate-700">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                                <span className="text-slate-500 text-xs ml-2 font-mono">payload.json</span>
                            </div>
                            <textarea
                                id="metadata"
                                rows={8}
                                {...register('metadata', {
                                    required: 'Metadata JSON payload is required',
                                    validate: value => {
                                        try {
                                            JSON.parse(value);
                                            return true;
                                        } catch {
                                            return 'Metadata must be a valid JSON — e.g. {"driverId": "DRV-001"}';
                                        }
                                    }
                                })}
                                className="w-full bg-slate-950 font-mono text-sm px-4 py-3 text-emerald-400 placeholder-slate-600 outline-none resize-y"
                            />
                        </div>
                        {errors.metadata ? (
                            <p className="text-rose-400 text-sm flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                {errors.metadata.message}
                            </p>
                        ) : (
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" />
                                Template auto-filled. Edit the driver ID and values before submitting.
                            </p>
                        )}
                    </div>

                    {/* Rules Info Box */}
                    <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-lg p-4">
                        <p className="text-indigo-400 text-sm font-medium mb-1">Active Rule Preview</p>
                        <p className="text-slate-400 text-xs">{selectedType.hint}</p>
                        <p className="text-slate-500 text-xs mt-1">Severity is automatically determined by the rule engine based on history and configured thresholds.</p>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>{isSubmitting ? 'Ingesting...' : 'Ingest Alert'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

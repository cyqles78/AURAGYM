import React, { useState, useEffect } from 'react';
import {
    X, Upload, ShieldCheck, AlertCircle, Loader2, CheckCircle2,
    ChevronRight, Save, SkipForward, Copy, FileJson, TrendingUp,
    Zap, Database, Package, Calendar, ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import { useDataImporter } from '../../hooks/useDataImporter';
import { ConflictResolution, ConflictItem } from '../../services/DataTransferService';
import { GlassCard } from '../../components/GlassCard';

interface ImportWizardProps {
    onClose: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ onClose }) => {
    const { status, analysis, progress, error, startAnalysis, executeImport, reset } = useDataImporter();
    const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
    const [selectedConflict, setSelectedConflict] = useState<ConflictItem | null>(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.json')) {
                alert('Please select a valid JSON backup file');
                return;
            }
            startAnalysis(file);
        }
    };

    const handleResolve = (item: ConflictItem, type: ConflictResolution['type']) => {
        setResolutions(prev => {
            const filtered = prev.filter(r => r.itemId !== item.id);
            return [...filtered, {
                itemId: item.id,
                normalizedName: item.name || item.title || '',
                type,
                category: item.category
            }];
        });
        setSelectedConflict(null);
    };

    const handleBulkAction = (type: ConflictResolution['type']) => {
        if (!analysis) return;

        const bulkResolutions: ConflictResolution[] = analysis.conflicts.map(item => ({
            itemId: item.id,
            normalizedName: item.name || item.title || '',
            type,
            category: item.category
        }));

        setResolutions(bulkResolutions);
        setShowBulkActions(false);
    };

    const totalConflicts = analysis?.conflicts.length || 0;
    const resolvedCount = resolutions.length;
    const allResolved = totalConflicts > 0 && resolvedCount === totalConflicts;

    // ========== SUCCESS SCREEN ==========
    if (status === 'SUCCESS') {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                <div className="relative mb-8">
                    <div className="h-28 w-28 bg-gradient-to-br from-accentGreen/20 to-accentGreen/5 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                        <CheckCircle2 size={56} className="text-accentGreen animate-in zoom-in duration-700 delay-200" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-8 w-8 bg-accentGreen rounded-full animate-ping opacity-75" />
                </div>

                <h2 className="text-3xl font-black text-white mb-3 animate-in slide-in-from-bottom duration-500 delay-300">
                    Import Complete!
                </h2>
                <p className="text-slate-400 mb-2 animate-in slide-in-from-bottom duration-500 delay-400">
                    Your data has been successfully merged and synced to the cloud.
                </p>

                {analysis && (
                    <div className="flex gap-4 mt-6 mb-8 animate-in slide-in-from-bottom duration-500 delay-500">
                        <div className="text-center">
                            <div className="text-2xl font-black text-accentGreen">{analysis.stats.newCount}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">New Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-black text-accent">{resolvedCount}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Resolved</div>
                        </div>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="w-full max-w-xs py-4 bg-white text-black font-black rounded-2xl shadow-xl active:scale-95 transition-transform animate-in slide-in-from-bottom duration-500 delay-600"
                >
                    Return to App
                </button>
            </div>
        );
    }

    // ========== ERROR SCREEN ==========
    if (status === 'ERROR') {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
                <div className="h-24 w-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                    <AlertCircle size={48} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Import Failed</h2>
                <p className="text-slate-400 mb-8 max-w-md">{error || 'An unexpected error occurred'}</p>
                <div className="flex gap-3 w-full max-w-xs">
                    <button
                        onClick={reset}
                        className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-white text-black font-bold rounded-xl"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // ========== MAIN WIZARD ==========
    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom duration-500">
            {/* Header */}
            <div className="p-6 pt-12 flex justify-between items-center border-b border-white/5 bg-gradient-to-b from-black to-transparent">
                <div>
                    <h2 className="text-xl font-bold text-white">Restore Backup</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                        {status === 'ANALYZING' && 'Analyzing...'}
                        {status === 'RESOLVING' && `${resolvedCount}/${totalConflicts} Resolved`}
                        {status === 'IMPORTING' && progress.stage}
                        {status === 'IDLE' && 'Data Recovery'}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Progress Bar (shown during analysis and import) */}
            {(status === 'ANALYZING' || status === 'IMPORTING') && (
                <div className="px-6 py-3 bg-black/50 border-b border-white/5">
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-accentGreen transition-all duration-500 ease-out"
                            style={{ width: `${progress.percentage}%` }}
                        />
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* ========== IDLE: FILE UPLOAD ========== */}
                {status === 'IDLE' && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 p-8 animate-in fade-in">
                        <div className="relative">
                            <div className="h-24 w-24 bg-gradient-to-br from-accent/20 to-accentBlue/20 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl">
                                <FileJson size={40} className="text-accent" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-accentGreen rounded-full flex items-center justify-center border-2 border-black">
                                <Upload size={14} className="text-black" />
                            </div>
                        </div>

                        <div className="space-y-2 px-4">
                            <h3 className="text-xl font-bold text-white">Upload Backup File</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                Select the <span className="text-accent font-bold">.json</span> file you exported from AURAGYM to restore your data.
                            </p>
                        </div>

                        <label className="w-full max-w-xs py-4 bg-gradient-to-r from-accent to-accentBlue text-black font-black rounded-2xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform shadow-lg">
                            <Upload size={18} /> Choose Backup File
                            <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
                        </label>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 max-w-md">
                            <div className="flex items-start gap-3">
                                <Info size={18} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-white mb-1">Safe Import</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        Your existing data won't be deleted. New items will be added, and you'll be asked to resolve any duplicates.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== ANALYZING ========== */}
                {status === 'ANALYZING' && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 p-8 animate-in fade-in">
                        <div className="relative">
                            <Loader2 className="animate-spin text-accent" size={48} />
                            <div className="absolute inset-0 animate-ping opacity-20">
                                <Loader2 className="text-accent" size={48} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-white font-bold text-lg mb-1">Scanning Backup</p>
                            <p className="text-slate-500 text-sm">{progress.stage}</p>
                        </div>
                    </div>
                )}

                {/* ========== RESOLVING CONFLICTS ========== */}
                {status === 'RESOLVING' && analysis && (
                    <div className="space-y-6 p-4 pb-32 animate-in fade-in">
                        {/* Stats Overview */}
                        <div className="grid grid-cols-3 gap-3">
                            <GlassCard className="text-center py-4">
                                <div className="text-2xl font-black text-accentGreen">{analysis.stats.newCount}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">New Items</div>
                            </GlassCard>
                            <GlassCard className="text-center py-4">
                                <div className="text-2xl font-black text-accent">{totalConflicts}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Conflicts</div>
                            </GlassCard>
                            <GlassCard className="text-center py-4">
                                <div className="text-2xl font-black text-white">{analysis.stats.totalItems}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold mt-1">Total</div>
                            </GlassCard>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-4 rounded-2xl">
                            <div className="flex items-start gap-3">
                                <ShieldCheck size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1">Smart Conflict Detection</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-2">
                                        We found {totalConflicts} item{totalConflicts !== 1 ? 's' : ''} that may already exist in your library.
                                        Choose how to handle each one.
                                    </p>
                                    {totalConflicts > 3 && (
                                        <button
                                            onClick={() => setShowBulkActions(!showBulkActions)}
                                            className="text-xs font-bold text-accent flex items-center gap-1 hover:underline"
                                        >
                                            <Zap size={12} /> Quick Actions
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions */}
                        {showBulkActions && (
                            <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top">
                                <button
                                    onClick={() => handleBulkAction('SKIP')}
                                    className="py-3 bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 active:scale-95 transition-transform"
                                >
                                    Skip All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('OVERWRITE')}
                                    className="py-3 bg-orange-500/10 text-orange-400 text-xs font-bold rounded-xl border border-orange-500/20 active:scale-95 transition-transform"
                                >
                                    Overwrite All
                                </button>
                                <button
                                    onClick={() => handleBulkAction('KEEP_BOTH')}
                                    className="py-3 bg-accent/10 text-accent text-xs font-bold rounded-xl border border-accent/20 active:scale-95 transition-transform"
                                >
                                    Keep All
                                </button>
                            </div>
                        )}

                        {/* Conflict List */}
                        <div className="space-y-3">
                            {analysis.conflicts.map((item, index) => {
                                const resolution = resolutions.find(r => r.itemId === item.id);
                                const displayName = item.name || item.title || 'Unknown';
                                const similarityPercent = Math.round(item.similarity * 100);

                                return (
                                    <GlassCard
                                        key={item.id}
                                        className={`transition-all duration-300 ${resolution ? 'opacity-60 scale-95' : 'opacity-100 scale-100'}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${item.category === 'exercise' ? 'bg-accent/10 text-accent' :
                                                            item.category === 'plan' ? 'bg-accentBlue/10 text-accentBlue' :
                                                                item.category === 'program' ? 'bg-purple-500/10 text-purple-400' :
                                                                    'bg-accentGreen/10 text-accentGreen'
                                                        }`}>
                                                        {item.category}
                                                    </span>
                                                    {similarityPercent === 100 ? (
                                                        <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded uppercase">
                                                            Exact Match
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded uppercase">
                                                            {similarityPercent}% Similar
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="text-base font-bold text-white leading-tight">{displayName}</h4>
                                                {item.existingItem && (
                                                    <button
                                                        onClick={() => setSelectedConflict(selectedConflict?.id === item.id ? null : item)}
                                                        className="text-xs text-slate-500 hover:text-accent transition-colors mt-1 flex items-center gap-1"
                                                    >
                                                        <Info size={12} /> Compare versions
                                                    </button>
                                                )}
                                            </div>
                                            {resolution && (
                                                <div className="flex items-center gap-1.5 bg-accentGreen/10 px-2 py-1 rounded-lg">
                                                    <CheckCircle2 size={14} className="text-accentGreen" />
                                                    <span className="text-xs font-bold text-accentGreen capitalize">
                                                        {resolution.type.replace('_', ' ').toLowerCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Comparison View */}
                                        {selectedConflict?.id === item.id && (
                                            <div className="mb-4 p-3 bg-black/30 rounded-xl border border-white/5 animate-in slide-in-from-top">
                                                <div className="grid grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <div className="text-slate-500 font-bold mb-1 uppercase text-[10px]">Existing</div>
                                                        <div className="text-white">{item.existingItem?.name || item.existingItem?.title}</div>
                                                        {item.existingItem?.target_muscle && (
                                                            <div className="text-slate-500 mt-1">{item.existingItem.target_muscle}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-slate-500 font-bold mb-1 uppercase text-[10px]">Importing</div>
                                                        <div className="text-accent">{item.importedItem?.name || item.importedItem?.title}</div>
                                                        {item.importedItem?.target_muscle && (
                                                            <div className="text-slate-500 mt-1">{item.importedItem.target_muscle}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                onClick={() => handleResolve(item, 'SKIP')}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-bold transition-all ${resolution?.type === 'SKIP'
                                                        ? 'bg-white text-black border-white shadow-lg scale-105'
                                                        : 'bg-surfaceHighlight border-white/5 text-slate-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <SkipForward size={14} /> Skip
                                            </button>
                                            <button
                                                onClick={() => handleResolve(item, 'OVERWRITE')}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-bold transition-all ${resolution?.type === 'OVERWRITE'
                                                        ? 'bg-white text-black border-white shadow-lg scale-105'
                                                        : 'bg-surfaceHighlight border-white/5 text-slate-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <Save size={14} /> Replace
                                            </button>
                                            <button
                                                onClick={() => handleResolve(item, 'KEEP_BOTH')}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[10px] font-bold transition-all ${resolution?.type === 'KEEP_BOTH'
                                                        ? 'bg-white text-black border-white shadow-lg scale-105'
                                                        : 'bg-surfaceHighlight border-white/5 text-slate-400 hover:border-white/20'
                                                    }`}
                                            >
                                                <Copy size={14} /> Keep Both
                                            </button>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ========== IMPORTING ========== */}
                {status === 'IMPORTING' && (
                    <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in">
                        <div className="relative">
                            <div className="h-32 w-32 rounded-full border-4 border-white/10 flex items-center justify-center">
                                <div className="h-24 w-24 rounded-full border-4 border-accent/50 border-t-accent animate-spin" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Database size={32} className="text-accent" />
                            </div>
                        </div>

                        <div className="text-center max-w-md">
                            <p className="text-white font-bold text-lg mb-2">Importing Data</p>
                            <p className="text-slate-400 text-sm mb-4">{progress.stage}</p>
                            <div className="text-3xl font-black text-accent">{progress.percentage}%</div>
                        </div>

                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Progress</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent via-accentBlue to-accentGreen transition-all duration-500"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Button */}
            {status === 'RESOLVING' && (
                <div className="p-6 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5">
                    <button
                        onClick={() => executeImport(analysis!, resolutions)}
                        disabled={!allResolved}
                        className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${allResolved
                                ? 'bg-gradient-to-r from-accent to-accentGreen text-black shadow-xl active:scale-95'
                                : 'bg-white/10 text-slate-600 cursor-not-allowed'
                            }`}
                    >
                        {allResolved ? (
                            <>
                                Merge Data <ArrowRight size={20} />
                            </>
                        ) : (
                            <>
                                Resolve All Conflicts ({resolvedCount}/{totalConflicts})
                            </>
                        )}
                    </button>
                    {!allResolved && (
                        <p className="text-center text-xs text-slate-600 mt-2">
                            Please resolve all conflicts before proceeding
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
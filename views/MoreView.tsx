import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { UserProfile } from '../types';
import { Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Crown, Mail, Smartphone, ArrowLeft, TrendingUp, Moon, User, Edit2, Database, Download, Upload, FileJson, FileSpreadsheet, CheckCircle, X } from 'lucide-react';
import { ProgressScreen } from './Profile/ProgressScreen';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks/useSupabaseData';
import { DataTransferService } from '../services/DataTransferService';
import { ImportWizard } from './Settings/ImportWizard';

interface MoreViewProps {
    user: UserProfile; // Fallback
    onUpdateUser: (user: UserProfile) => void;
}

type SubView = 'MAIN' | 'PROFILE' | 'APPEARANCE' | 'NOTIFICATIONS' | 'SUBSCRIPTION' | 'PRIVACY' | 'HELP' | 'PROGRESS';

export const MoreView: React.FC<MoreViewProps> = ({ user: initialUser, onUpdateUser }) => {
    const { signOut } = useAuth();
    const { data: liveUser, isLoading } = useProfile();
    const updateProfileMutation = useUpdateProfile();
    const user = liveUser || initialUser;

    const [subView, setSubView] = useState<SubView>('MAIN');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [exportSuccess, setExportSuccess] = useState(false);

    // Profile Edit State
    const [editName, setEditName] = useState(user.name);
    const [editGoal, setEditGoal] = useState(user.goal);

    React.useEffect(() => {
        if (liveUser) {
            setEditName(liveUser.name);
            setEditGoal(liveUser.goal);
        }
    }, [liveUser]);

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({ name: editName, goal: editGoal });
        onUpdateUser({ ...user, name: editName, goal: editGoal });
        setSubView('MAIN');
    };

    const handleBackup = async (format: 'json' | 'csv' = 'json') => {
        setIsExporting(true);
        setExportSuccess(false);
        try {
            if (format === 'json') {
                await DataTransferService.exportUserData();
            } else {
                // For CSV, we'll export exercises by default
                await DataTransferService.exportAsCSV('exercises');
            }
            setExportSuccess(true);
            setTimeout(() => setExportSuccess(false), 3000);
        } catch (e: any) {
            alert(e.message || "Export failed. Please check connection.");
        } finally {
            setIsExporting(false);
            setShowExportMenu(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        setShowLogoutConfirm(false);
    };

    const Header = ({ title }: { title: string }) => (
        <div className="flex items-center space-x-2 mb-6 px-1">
            <button onClick={() => setSubView('MAIN')} className="p-2 -ml-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></button>
            <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
    );

    if (subView === 'PROGRESS') return <ProgressScreen onBack={() => setSubView('MAIN')} />;

    if (subView === 'PROFILE') {
        return (
            <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
                <Header title="Edit Profile" />
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-accent to-blue-500 p-[2px]">
                            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                                <span className="text-3xl font-bold text-white">
                                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-accent text-slate-900 p-1.5 rounded-full border border-slate-900 shadow-lg">
                            <Edit2 size={14} />
                        </button>
                    </div>
                </div>
                <div className="space-y-4 px-1">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Display Name</label>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-accent outline-none" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Primary Goal</label>
                        <div className="grid grid-cols-1 gap-2">
                            {['Hypertrophy', 'Strength', 'Fat Loss', 'Endurance'].map(g => (
                                <button key={g} onClick={() => setEditGoal(g)} className={`p-3 rounded-xl border text-left transition-all ${editGoal === g ? 'bg-accent/10 border-accent text-accent font-bold' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>{g}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleSaveProfile} className="w-full bg-accent text-slate-900 font-bold py-3.5 rounded-xl shadow-lg mt-4 active:scale-95 transition">Save Changes</button>
                </div>
            </div>
        );
    }

    if (subView === 'APPEARANCE') {
        return (
            <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
                <Header title="Appearance" />
                <GlassCard className="space-y-4 mx-1">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Moon size={20} className="text-slate-400" />
                            <span className="text-white font-medium">Dark Mode</span>
                        </div>
                        <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div></div>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="pb-28 pt-6 space-y-6">
            <h1 className="text-2xl font-bold text-white px-1">Settings</h1>

            {/* Profile Card */}
            <GlassCard className="flex items-center space-x-4 group cursor-pointer mx-1" accent onClick={() => setSubView('PROFILE')}>
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-accent to-blue-500 p-[2px]">
                    <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                        <span className="text-xl font-bold text-white">{user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                    </div>
                </div>
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <p className="text-xs text-slate-400">{user.goal}</p>
                </div>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
            </GlassCard>

            <div className="space-y-4">
                {/* Data & Storage Section */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-bold text-slate-500 uppercase">Data & Storage</h3>
                        <span className="text-[10px] bg-accentBlue/20 text-accentBlue px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">Premium</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mx-1">
                        <SettingItem
                            icon={Download}
                            label={isExporting ? "Preparing Backup..." : exportSuccess ? "Backup Complete!" : "Backup Cloud Data"}
                            subLabel={exportSuccess ? "✓" : "JSON / CSV"}
                            onClick={() => setShowExportMenu(true)}
                            iconColor={exportSuccess ? "text-accentGreen" : undefined}
                        />
                        <SettingItem
                            icon={Upload}
                            label="Restore from Backup"
                            subLabel="Import File"
                            onClick={() => setShowImportWizard(true)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">App Preferences</h3>
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mx-1">
                        <SettingItem icon={TrendingUp} label="Progress Tracking" onClick={() => setSubView('PROGRESS')} />
                        <SettingItem icon={Smartphone} label="Appearance" onClick={() => setSubView('APPEARANCE')} />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden mx-1">
                        <SettingItem icon={LogOut} label="Log Out" danger onClick={() => setShowLogoutConfirm(true)} />
                    </div>
                </div>
            </div>

            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-2xl p-4 animate-in fade-in">
                    <div className="w-full max-w-xs bg-[#10121A] rounded-2xl border border-white/10 p-6 text-center">
                        <h3 className="text-lg font-bold text-white mb-2">Log Out?</h3>
                        <div className="flex space-x-3 mt-6">
                            <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-white font-bold text-sm">Cancel</button>
                            <button onClick={handleLogout} className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm">Log Out</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Menu Modal */}
            {showExportMenu && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in">
                    <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-black rounded-3xl border border-white/10 p-6 animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">Export Options</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Choose your export format</p>
                            </div>
                            <button
                                onClick={() => setShowExportMenu(false)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => handleBackup('json')}
                                disabled={isExporting}
                                className="w-full p-4 bg-gradient-to-r from-accent/10 to-accentBlue/10 border border-accent/20 rounded-2xl text-left hover:border-accent/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-accent/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileJson size={24} className="text-accent" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold mb-0.5">Complete Backup (JSON)</div>
                                        <div className="text-xs text-slate-400">All data including workouts, exercises, logs, and more</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleBackup('csv')}
                                disabled={isExporting}
                                className="w-full p-4 bg-gradient-to-r from-accentGreen/10 to-emerald-500/10 border border-accentGreen/20 rounded-2xl text-left hover:border-accentGreen/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-accentGreen/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet size={24} className="text-accentGreen" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold mb-0.5">Exercise Library (CSV)</div>
                                        <div className="text-xs text-slate-400">Spreadsheet format for exercises only</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <span className="text-blue-400 font-bold">💡 Tip:</span> Use JSON for complete backups that can be restored. Use CSV for viewing data in spreadsheet apps.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {showImportWizard && <ImportWizard onClose={() => setShowImportWizard(false)} />}
        </div>
    );
};

const SettingItem = ({ icon: Icon, label, subLabel, danger = false, onClick, iconColor }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition border-b border-white/5 last:border-0 active:bg-white/10">
        <div className="flex items-center space-x-3">
            <Icon size={18} className={iconColor || (danger ? "text-red-400" : "text-slate-400")} />
            <span className={`text-sm font-medium ${danger ? "text-red-400" : "text-slate-200"}`}>{label}</span>
        </div>
        <div className="flex items-center space-x-2">
            {subLabel && <span className="text-[10px] font-bold text-slate-600 uppercase mr-1">{subLabel}</span>}
            <ChevronRight size={16} className="text-slate-600" />
        </div>
    </button>
);
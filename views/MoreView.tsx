
import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { UserProfile } from '../types';
import { Settings, CreditCard, Shield, HelpCircle, LogOut, ChevronRight, Crown, Mail, Smartphone, ArrowLeft, Bell, Moon, User, Check, Edit2 } from 'lucide-react';

interface MoreViewProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

type SubView = 'MAIN' | 'PROFILE' | 'APPEARANCE' | 'NOTIFICATIONS' | 'SUBSCRIPTION' | 'PRIVACY' | 'HELP';

export const MoreView: React.FC<MoreViewProps> = ({ user, onUpdateUser }) => {
  const [subView, setSubView] = useState<SubView>('MAIN');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Profile Edit State
  const [editName, setEditName] = useState(user.name);
  const [editGoal, setEditGoal] = useState(user.goal);

  const handleSaveProfile = () => {
    onUpdateUser({ ...user, name: editName, goal: editGoal });
    setSubView('MAIN');
  };

  const Header = ({ title }: { title: string }) => (
    <div className="flex items-center space-x-2 mb-6">
        <button onClick={() => setSubView('MAIN')} className="p-2 -ml-2 rounded-full hover:bg-white/10"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
  );

  // --- SUB-VIEWS ---

  if (subView === 'PROFILE') {
      return (
          <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Edit Profile" />
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-accent to-blue-500 p-[2px]">
                        <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                            <span className="text-3xl font-bold text-white">AG</span>
                        </div>
                    </div>
                    <button className="absolute bottom-0 right-0 bg-accent text-slate-900 p-1.5 rounded-full border border-slate-900 shadow-lg">
                        <Edit2 size={14} />
                    </button>
                </div>
              </div>

              <div className="space-y-4">
                  <div>
                      <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Display Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-accent outline-none"
                      />
                  </div>

                  <div>
                      <label className="text-xs text-slate-400 font-bold uppercase mb-2 block">Primary Goal</label>
                      <div className="grid grid-cols-1 gap-2">
                        {['Hypertrophy', 'Strength', 'Fat Loss', 'Endurance'].map(g => (
                            <button
                                key={g}
                                onClick={() => setEditGoal(g)}
                                className={`p-3 rounded-xl border text-left transition-all ${editGoal === g ? 'bg-accent/10 border-accent text-accent font-bold' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
                            >
                                {g}
                            </button>
                        ))}
                      </div>
                  </div>

                  <button 
                    onClick={handleSaveProfile}
                    className="w-full bg-accent text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-accent/20 mt-4 active:scale-[0.98] transition-transform"
                  >
                    Save Changes
                  </button>
              </div>
          </div>
      );
  }

  if (subView === 'APPEARANCE') {
      return (
          <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Appearance" />
              <GlassCard className="space-y-4">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                          <Moon size={20} className="text-slate-400" />
                          <span className="text-white font-medium">Dark Mode</span>
                      </div>
                      <div className="w-10 h-6 bg-accent rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                      </div>
                  </div>
                  <div className="text-xs text-slate-500 pt-2 border-t border-white/5">
                      AURAGYM is designed as a dark-mode first experience to reduce eye strain in gym environments and save battery on OLED screens.
                  </div>
              </GlassCard>
          </div>
      );
  }

  if (subView === 'NOTIFICATIONS') {
      return (
          <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Notifications" />
              <GlassCard className="space-y-0 !p-0 overflow-hidden">
                  {['Workout Reminders', 'Daily Goal Nudges', 'New Achievements', 'Community Updates'].map((item, i) => (
                      <div key={item} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition">
                          <span className="text-sm text-white font-medium">{item}</span>
                          <div className={`w-10 h-6 rounded-full relative cursor-pointer ${i < 2 ? 'bg-accent' : 'bg-slate-700'}`}>
                              <div className={`absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all ${i < 2 ? 'right-1' : 'left-1'}`}></div>
                          </div>
                      </div>
                  ))}
              </GlassCard>
              <p className="text-xs text-slate-500 px-2">
                  We respect your focus. Notifications are only sent when strictly necessary for your progress.
              </p>
          </div>
      );
  }

  if (subView === 'SUBSCRIPTION') {
      return (
          <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Subscription" />
              
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-6">
                   <div className="absolute top-0 right-0 p-12 bg-yellow-500/10 blur-3xl rounded-full"></div>
                   <div className="relative z-10 text-center">
                       <Crown size={48} className="mx-auto text-yellow-500 mb-4" />
                       <h2 className="text-2xl font-bold text-white mb-1">AURAGYM Premium</h2>
                       <p className="text-yellow-400 text-sm font-bold mb-6">Active since Jan 2024</p>
                       
                       <div className="text-left space-y-3 mb-6">
                           {['Unlimited AI Workout Generation', 'Advanced Body Analytics', 'Cloud Backup', 'Priority Support'].map(f => (
                               <div key={f} className="flex items-center text-sm text-slate-200">
                                   <Check size={16} className="text-yellow-500 mr-2" />
                                   {f}
                               </div>
                           ))}
                       </div>

                       <button className="w-full py-3 rounded-xl bg-white/10 border border-white/10 text-white font-semibold hover:bg-white/20 transition">
                           Manage Subscription
                       </button>
                   </div>
              </div>

              <div className="px-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Billing History</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <span className="text-sm text-white">Oct 24, 2023</span>
                          <span className="text-sm text-slate-400">$9.99</span>
                      </div>
                       <div className="flex justify-between items-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                          <span className="text-sm text-white">Sep 24, 2023</span>
                          <span className="text-sm text-slate-400">$9.99</span>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  if (subView === 'PRIVACY') {
      return (
          <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Privacy & Security" />
              <div className="space-y-4 text-slate-300 text-sm leading-relaxed px-1">
                  <GlassCard>
                      <h3 className="text-white font-bold mb-2">Your Data is Yours</h3>
                      <p>AURAGYM stores your workout data locally on your device by default. Cloud sync is end-to-end encrypted.</p>
                  </GlassCard>
                  
                  <GlassCard>
                      <h3 className="text-white font-bold mb-2">AI Processing</h3>
                      <p>When generating workouts, we send anonymized parameters (goal, level, equipment) to our AI provider. No personal identifiable information (PII) is shared.</p>
                  </GlassCard>

                  <GlassCard>
                      <h3 className="text-white font-bold mb-2">Analytics</h3>
                      <p>We use anonymous usage statistics to improve the app. You can opt-out of this at any time in the "Data Settings" menu.</p>
                  </GlassCard>
                  
                  <button className="w-full text-red-400 text-sm py-4 border border-red-900/30 bg-red-900/10 rounded-xl mt-4">
                      Delete All Data
                  </button>
              </div>
          </div>
      );
  }

  if (subView === 'HELP') {
      return (
           <div className="pb-28 pt-6 space-y-6 animate-in slide-in-from-right">
              <Header title="Help & Support" />
              
              <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase px-2">FAQ</h3>
                  {[
                      { q: "How do I create a superset?", a: "Currently, you can add exercises sequentially. Superset grouping is coming in v1.2." },
                      { q: "Can I export my data?", a: "Yes, go to Data Settings > Export to CSV." },
                      { q: "Is the AI safe?", a: "The AI suggests standard exercises, but always consult a professional if you are unsure about form." }
                  ].map((item, i) => (
                      <GlassCard key={i} className="space-y-2">
                          <p className="font-bold text-white text-sm">{item.q}</p>
                          <p className="text-xs text-slate-400">{item.a}</p>
                      </GlassCard>
                  ))}
              </div>

              <div className="pt-4">
                   <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-3">Contact Us</h3>
                   <button className="w-full bg-slate-800 text-white py-3 rounded-xl border border-slate-700 flex items-center justify-center space-x-2 hover:bg-slate-700 transition">
                       <Mail size={16} />
                       <span className="font-bold text-sm">support@auragym.app</span>
                   </button>
              </div>
           </div>
      );
  }

  // --- MAIN VIEW ---
  return (
    <div className="pb-28 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-white px-1">Settings</h1>

      {/* Profile Card */}
      <GlassCard className="flex items-center space-x-4" accent onClick={() => setSubView('PROFILE')}>
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-accent to-blue-500 p-[2px]">
            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                <span className="text-xl font-bold text-white">AG</span>
            </div>
        </div>
        <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <p className="text-xs text-slate-400">Level {user.level} • {user.goal}</p>
        </div>
        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center space-x-1">
            <Crown size={12} className="text-yellow-500" />
            <span className="text-[10px] font-bold text-yellow-500 uppercase">Premium</span>
        </div>
      </GlassCard>

      {/* Settings Groups */}
      <div className="space-y-4">
        
        {/* App Settings */}
        <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">App Preferences</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <SettingItem icon={User} label="Profile" onClick={() => setSubView('PROFILE')} />
                <SettingItem icon={Smartphone} label="Appearance" subLabel="Dark Mode" onClick={() => setSubView('APPEARANCE')} />
                <SettingItem icon={Mail} label="Notifications" onClick={() => setSubView('NOTIFICATIONS')} />
            </div>
        </div>

        {/* Subscription */}
        <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase px-2 mb-2">Account</h3>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <SettingItem icon={CreditCard} label="Subscription" subLabel="Manage Plan" onClick={() => setSubView('SUBSCRIPTION')} />
                <SettingItem icon={Shield} label="Privacy & Security" onClick={() => setSubView('PRIVACY')} />
            </div>
        </div>

        {/* Support */}
        <div className="space-y-1">
             <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                <SettingItem icon={HelpCircle} label="Help & Support" onClick={() => setSubView('HELP')} />
                <SettingItem icon={LogOut} label="Log Out" danger onClick={() => setShowLogoutConfirm(true)} />
            </div>
        </div>
      </div>
      
      <p className="text-center text-xs text-slate-600 pt-4">AURAGYM v1.1.0 (Build 45)</p>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="w-full max-w-xs bg-[#10121A] rounded-2xl border border-white/10 p-6 text-center">
               <h3 className="text-lg font-bold text-white mb-2">Log Out?</h3>
               <p className="text-sm text-slate-400 mb-6">Are you sure you want to log out of your account?</p>
               <div className="flex space-x-3">
                   <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-slate-800 rounded-xl text-white font-bold text-sm">Cancel</button>
                   <button onClick={() => { setShowLogoutConfirm(false); alert("Logged out (Simulation)"); }} className="flex-1 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-bold text-sm">Log Out</button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

const SettingItem = ({ icon: Icon, label, subLabel, danger = false, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition border-b border-white/5 last:border-0 active:bg-white/10">
        <div className="flex items-center space-x-3">
            <Icon size={18} className={danger ? "text-red-400" : "text-slate-400"} />
            <span className={`text-sm font-medium ${danger ? "text-red-400" : "text-slate-200"}`}>{label}</span>
        </div>
        <div className="flex items-center space-x-2">
            {subLabel && <span className="text-xs text-slate-500">{subLabel}</span>}
            <ChevronRight size={16} className="text-slate-600" />
        </div>
    </button>
);

import React, { useState } from 'react';
import { UserProfile, AiSettings } from '../types';
import {
  X,
  Cpu,
  Key,
  User,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
  onResetData
}) => {
  const [name, setName] = useState(currentUser?.name || 'K. Sai Praneeth');
  const [department, setDepartment] = useState(currentUser?.department || 'Food Technology');
  const [klId, setKlId] = useState(currentUser?.klId || '2100030045');
  const [provider, setProvider] = useState<'offline' | 'groq' | 'gemini'>(
    currentUser?.aiSettings?.provider || 'offline'
  );
  const [groqKey, setGroqKey] = useState(currentUser?.aiSettings?.groqApiKey || '');
  const [geminiKey, setGeminiKey] = useState(currentUser?.aiSettings?.geminiApiKey || '');
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser: UserProfile = {
      ...currentUser,
      name,
      department,
      klId,
      aiSettings: {
        provider,
        groqApiKey: groqKey.trim() || undefined,
        geminiApiKey: geminiKey.trim() || undefined,
        groqModel: 'llama-3.3-70b-versatile',
        geminiModel: 'gemini-1.5-flash'
      }
    };

    onSaveProfile(updatedUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in print:hidden">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl p-6 border border-surface-border dark:border-stone-800 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-subtle dark:border-stone-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-800 text-amber-300 flex items-center justify-center shadow-inner">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-surface-dark dark:text-white">
                StudyMate AI Settings
              </h3>
              <p className="text-[11px] text-surface-muted">
                Configure AI generation models & university credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-muted hover:text-surface-dark dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Profile Details */}
          <div className="space-y-2">
            <span className="text-[11px] font-condensed uppercase tracking-wider font-bold text-surface-muted block">
              KL University Profile
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-surface-dark dark:text-stone-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-2 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-surface-dark dark:text-stone-300 mb-1">
                  KL Student ID
                </label>
                <input
                  type="text"
                  value={klId}
                  onChange={(e) => setKlId(e.target.value)}
                  className="w-full bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-surface-dark dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-800"
                />
              </div>
            </div>
          </div>

          {/* AI Inference Provider */}
          <div className="space-y-2">
            <span className="text-[11px] font-condensed uppercase tracking-wider font-bold text-surface-muted block">
              AI Generation Engine
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setProvider('offline')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  provider === 'offline'
                    ? 'border-brand-800 bg-brand-50 dark:bg-brand-950/60 text-brand-950 dark:text-amber-300 font-bold ring-1 ring-brand-800'
                    : 'border-surface-border dark:border-stone-700 bg-surface-subtle dark:bg-stone-800 text-surface-muted'
                }`}
              >
                <span className="block font-bold">Smart Offline</span>
                <span className="text-[10px] opacity-80">Instant curriculum</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  provider === 'groq'
                    ? 'border-brand-800 bg-brand-50 dark:bg-brand-950/60 text-brand-950 dark:text-amber-300 font-bold ring-1 ring-brand-800'
                    : 'border-surface-border dark:border-stone-700 bg-surface-subtle dark:bg-stone-800 text-surface-muted'
                }`}
              >
                <span className="block font-bold">Groq LLaMA 3.3</span>
                <span className="text-[10px] opacity-80">Ultra-fast cloud</span>
              </button>

              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                  provider === 'gemini'
                    ? 'border-brand-800 bg-brand-50 dark:bg-brand-950/60 text-brand-950 dark:text-amber-300 font-bold ring-1 ring-brand-800'
                    : 'border-surface-border dark:border-stone-700 bg-surface-subtle dark:bg-stone-800 text-surface-muted'
                }`}
              >
                <span className="block font-bold">Google Gemini</span>
                <span className="text-[10px] opacity-80">1.5 Flash</span>
              </button>
            </div>
          </div>

          {/* API Keys based on provider */}
          {provider === 'groq' && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-[11px] font-semibold text-surface-dark dark:text-stone-300">
                Groq API Key
              </label>
              <div className="relative">
                <input
                  type={showGroqKey ? 'text' : 'password'}
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-surface-dark dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowGroqKey(!showGroqKey)}
                  className="absolute right-2.5 top-2.5 text-surface-muted hover:text-surface-dark"
                >
                  {showGroqKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-surface-muted">Free API keys at console.groq.com</p>
            </div>
          )}

          {provider === 'gemini' && (
            <div className="space-y-1 animate-fade-in">
              <label className="block text-[11px] font-semibold text-surface-dark dark:text-stone-300">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-surface-dark dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-2.5 top-2.5 text-surface-muted hover:text-surface-dark"
                >
                  {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-surface-muted">Free API keys at aistudio.google.com</p>
            </div>
          )}

          {savedSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 size={15} />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-surface-subtle dark:border-stone-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all saved notes and restore defaults?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center space-x-1"
            >
              <Trash2 size={13} />
              <span>Reset Data</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl border border-surface-border text-surface-dark dark:text-stone-300 text-xs font-semibold hover:bg-surface-subtle"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold shadow-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

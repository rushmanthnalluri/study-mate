import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { X, UserRound, ShieldCheck, LogOut, Save, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser, onSaveProfile, onResetData }) => {
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Food Technology');
  const [klId, setKlId] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setDepartment(currentUser.department);
      setKlId(currentUser.klId);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ ...currentUser, name: name.trim(), department, klId: klId.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#2d241e]/60 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e5d7c8] bg-[#fffaf4] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#eadfd4] bg-[#f7efe6] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2c2a3] text-[#6e4228]"><UserRound size={18} /></div>
            <div>
              <h3 className="font-extrabold text-[#3b2b23]">Account settings</h3>
              <p className="text-[11px] text-[#8d7868]">Manage your StudyMate profile</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-[#806f61] hover:bg-white"><X size={18} /></button>
        </div>

        <form onSubmit={save} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#4b392e]">Full name</span>
              <input className="auth-input" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[#4b392e]">KL ID</span>
              <input className="auth-input font-mono" value={klId} onChange={e => setKlId(e.target.value)} required />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[#4b392e]">Department</span>
            <select className="auth-input" value={department} onChange={e => setDepartment(e.target.value)}>
              <option>Food Technology</option><option>CSE</option><option>AIDS</option><option>ECE</option><option>EEE</option>
            </select>
          </label>

          <div className="rounded-2xl border border-[#e7d4bd] bg-[#fbf3e9] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-[#9b633c]" size={18} />
              <div>
                <p className="text-xs font-extrabold text-[#4b392e]">AI configuration is administrator-controlled</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#806f61]">Students cannot enter, replace, or expose the Groq/Gemini keys used by the application. The administrator manages the single app-wide provider configuration.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eadfd4] pt-4">
            <button type="button" onClick={onResetData} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[#a04434] hover:bg-[#fff0ec]"><Trash2 size={14} /> Clear local session</button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-[#ddcdbd] bg-white px-4 py-2.5 text-xs font-bold text-[#5e4a3d] hover:bg-[#f7efe6]">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-[#7c4f2c] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#643c20]"><Save size={14} /> Save profile</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import { UserProfile } from '../types';
import { X, UserRound, ShieldCheck, Save, Trash2, KeyRound } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
  onChangePassword: (currentPassword:string,newPassword:string) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser, onSaveProfile, onResetData, onChangePassword }) => {
  const [name, setName] = useState('');
  const [klId, setKlId] = useState('');
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [passwordMessage,setPasswordMessage]=useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setKlId(currentUser.klId);
    }
  }, [currentUser, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, [isOpen, onClose]);

  if (!isOpen || !currentUser) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({ ...currentUser, name: name.trim(), klId: klId.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--foreground)]/60 p-4 backdrop-blur-md" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="settings-modal-title" tabIndex={-1} className="w-full max-w-lg overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--muted)] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-100)] text-[var(--foreground)]"><UserRound size={18} /></div>
            <div>
              <h3 id="settings-modal-title" className="font-extrabold text-[var(--foreground)]">Account settings</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">Manage your StudyMate profile</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close account settings" className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-white"><X size={18} /></button>
        </div>

        <form onSubmit={save} className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Full name</span>
              <input className="auth-input" value={name} onChange={e => setName(e.target.value)} required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">KL ID</span>
              <input className="auth-input font-mono" value={klId} onChange={e => setKlId(e.target.value)} required />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Department</span>
            <select className="auth-input" value={department} onChange={e => setDepartment(e.target.value as Department)}>
              {departments.filter(d => d !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </label>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-50)] p-4">
            <div className="mb-3 flex items-center gap-2"><KeyRound size={16} className="text-[var(--accent)]"/><p className="text-xs font-extrabold text-[var(--foreground)]">Change password</p></div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="auth-input" type="password" autoComplete="current-password" placeholder="Current password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/>
              <input className="auth-input" type="password" autoComplete="new-password" minLength={8} placeholder="New password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
            </div>
            <button type="button" disabled={!currentPassword||newPassword.length<8} onClick={async()=>{try{await onChangePassword(currentPassword,newPassword);setCurrentPassword('');setNewPassword('');setPasswordMessage('Password changed successfully.');}catch(e){setPasswordMessage(e instanceof Error?e.message:'Password change failed.');}}} className="mt-3 rounded-xl bg-[var(--foreground)] px-3 py-2 text-xs font-bold text-white disabled:opacity-40">Update password</button>
            {passwordMessage&&<p className="mt-2 text-[11px] font-semibold text-[var(--muted-foreground)]">{passwordMessage}</p>}
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-50)] p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 text-[var(--accent)]" size={18} />
              <div>
                <p className="text-xs font-extrabold text-[var(--foreground)]">AI configuration is administrator-controlled</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted-foreground)]">Students cannot enter, replace, or expose the Groq/Gemini keys used by the application. The administrator manages the single app-wide provider configuration.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
            <button type="button" onClick={onResetData} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-[var(--danger)] hover:bg-[var(--danger-soft)]"><Trash2 size={14} /> Clear local session</button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--foreground)] hover:bg-[var(--muted)]">Cancel</button>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[var(--accent-700)]"><Save size={14} /> Save profile</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

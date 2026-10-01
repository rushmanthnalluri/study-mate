import React, { useEffect, useRef, useState } from 'react';
import { Department, UserProfile } from '../types';
import { X, GraduationCap, LockKeyhole, Mail, UserRound, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  onNavigateToLmsSync?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupKlId, setSignupKlId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState<Department>('Food Technology');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus?.(); };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resetMessage = () => setError('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessage();
    setBusy(true);

    try {
      const isSignup = mode === 'signup';
      if (isSignup && signupPassword.length < 8) {
        throw new Error('Use at least 8 characters for your password.');
      }

      const payload = isSignup
        ? {
            name: signupName.trim(),
            klId: signupKlId.trim(),
            email: signupEmail.trim(),
            password: signupPassword,
            department: signupDepartment,
            linkLms: false
          }
        : {
            usernameOrEmail: loginIdentifier.trim(),
            password: loginPassword
          };

      const response = await fetch(isSignup ? '/api/auth/signup' : '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Authentication failed.');
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2d241e]/60 backdrop-blur-md p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#e5d7c8] bg-[#fffaf4] shadow-2xl">
        <div className="bg-[#3b2b23] px-6 py-6 text-[#fffaf4]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d7a86e] text-[#3b2b23]">
                <GraduationCap size={22} />
              </div>
              <div>
                <p id="auth-modal-title" className="text-lg font-extrabold tracking-tight">StudyMate</p>
                <p className="text-xs text-[#eadbc9]">Your personal KL exam workspace</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close sign-in dialog" className="rounded-xl p-2 text-[#eadbc9] hover:bg-white/10 hover:text-white">
              <X size={19} />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-[#f3d5a8]">
            <ShieldCheck size={14} />
            <span>Account required • Your notes stay tied to your account</span>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-[#eadfd4] bg-[#f7efe6]">
          {(['login', 'signup'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => { setMode(tab); resetMessage(); }}
              className={`py-3.5 text-sm font-bold transition-colors ${mode === tab ? 'bg-[#fffaf4] text-[#7c4f2c] border-b-2 border-[#b97745]' : 'text-[#806f61] hover:text-[#4b392e]'}`}
            >
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {error && <div role="alert" aria-live="assertive" className="rounded-2xl border border-[#efc4b8] bg-[#fff0ec] px-4 py-3 text-xs font-semibold text-[#a03e2f]">{error}</div>}

          {mode === 'login' ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">KL ID or university email</label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-3.5 text-[#9a8676]" size={16} />
                  <input value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required autoComplete="username" placeholder="e.g. 2500030215 or you@kluniversity.in" className="auth-input pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-3.5 text-[#9a8676]" size={16} />
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" className="auth-input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-[#8d7868] hover:bg-[#f0e3d6]">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <button disabled={busy} className="auth-primary" type="submit">
                {busy ? 'Signing in…' : <>Sign in to StudyMate <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-[11px] text-[#8d7868]">No guest/demo login is available in production.</p>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">Full name</label>
                <input value={signupName} onChange={e => setSignupName(e.target.value)} required autoComplete="name" placeholder="Your full name" className="auth-input" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">KL ID</label>
                  <input value={signupKlId} onChange={e => setSignupKlId(e.target.value)} required placeholder="2500030215" className="auth-input font-mono" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">Department</label>
                  <select value={signupDepartment} onChange={e => setSignupDepartment(e.target.value as Department)} className="auth-input">
                    <option>Food Technology</option><option>CSE</option><option>AIDS</option><option>ECE</option><option>EEE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">University email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-[#9a8676]" size={16} />
                  <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required type="email" autoComplete="email" placeholder="you@kluniversity.in" className="auth-input pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#4b392e]">Password</label>
                <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={8} type="password" autoComplete="new-password" placeholder="At least 8 characters" className="auth-input" />
              </div>
              <button disabled={busy} className="auth-primary" type="submit">
                {busy ? 'Creating account…' : <>Create my account <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[#8d7868]">AI provider keys are centrally managed by the administrator. Students never enter or store app-wide API keys.</p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

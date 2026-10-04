import React, { useEffect, useRef, useState } from 'react';
import { Department, UserProfile } from '../types';
import { X, GraduationCap, LockKeyhole, Mail, UserRound, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  departments: Department[];
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, departments }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupKlId, setSignupKlId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDepartment, setSignupDepartment] = useState<Department>('');
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
            department: signupDepartment
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0f172a]/60 backdrop-blur-md p-4" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" tabIndex={-1} className="w-full max-w-md overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-lg)]">
        <div className="border-b border-[var(--border)] bg-[var(--foreground)] px-6 py-7 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--accent)]">
                <GraduationCap size={22} />
              </div>
              <div>
                <p id="auth-modal-title" className="font-serif text-2xl tracking-tight">StudyMate</p>
                <p className="small-caps mt-1 text-[9px] text-[var(--accent-secondary)]">Private study workspace</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close sign-in dialog" className="rounded-xl p-2 text-[var(--accent-50)] hover:bg-white/10 hover:text-white">
              <X size={19} />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[11px] font-semibold text-[#bfdbfe]">
            <ShieldCheck size={14} />
            <span>Account required • Your notes stay tied to your account</span>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-[var(--border)] bg-[var(--muted)]">
          {(['login', 'signup'] as const).map(tab => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => { setMode(tab); resetMessage(); }}
              className={`py-3.5 text-sm font-bold transition-colors ${mode === tab ? 'bg-[#ffffff] text-[var(--accent)] border-b-2 border-[var(--accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
            >
              {tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 p-6">
          {error && <div role="alert" aria-live="assertive" className="rounded-2xl border border-[#efc4b8] bg-[var(--surface)] px-4 py-3 text-xs font-semibold text-[#a03e2f]">{error}</div>}

          {mode === 'login' ? (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">KL ID or university email</label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-3.5 text-[var(--muted-foreground)]" size={16} />
                  <input value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required autoComplete="username" placeholder="e.g. your KL ID or you@kluniversity.in" className="auth-input pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3.5 top-3.5 text-[var(--muted-foreground)]" size={16} />
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required autoComplete="current-password" placeholder="Your password" className="auth-input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--border)]">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>
              <button disabled={busy} className="auth-primary" type="submit">
                {busy ? 'Signing in…' : <>Sign in to StudyMate <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-[11px] text-[var(--muted-foreground)]">Use your university account to access your private workspace.</p>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Full name</label>
                <input value={signupName} onChange={e => setSignupName(e.target.value)} required autoComplete="name" placeholder="Your full name" className="auth-input" />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">KL ID</label>
                  <input value={signupKlId} onChange={e => setSignupKlId(e.target.value)} required placeholder="Your KL ID" className="auth-input font-mono" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Department</label>
                  <select value={signupDepartment} onChange={e => setSignupDepartment(e.target.value as Department)} className="auth-input">
                    {departments.filter(d => d !== 'All').map(dept => <option key={dept} value={dept}>{dept}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">University email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-[var(--muted-foreground)]" size={16} />
                  <input value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required type="email" autoComplete="email" placeholder="you@kluniversity.in" className="auth-input pl-10" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[var(--foreground)]">Password</label>
                <input value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={8} type="password" autoComplete="new-password" placeholder="At least 8 characters" className="auth-input" />
              </div>
              <button disabled={busy} className="auth-primary" type="submit">
                {busy ? 'Creating account…' : <>Create my account <ArrowRight size={16} /></>}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">AI provider keys are centrally managed by the administrator. Students never enter or store app-wide API keys.</p>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

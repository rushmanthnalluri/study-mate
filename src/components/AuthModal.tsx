import React, { useState } from 'react';
import { Department, UserProfile } from '../types';
import {
  X,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Lock,
  Mail,
  User,
  KeyRound,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onAuthSuccess: (user: UserProfile, token: string) => void;
  onNavigateToLmsSync?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onNavigateToLmsSync
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'kl-lms'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupKlId, setSignupKlId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupDept, setSignupDept] = useState<Department>('Food Technology');
  const [signupLinkLms, setSignupLinkLms] = useState(true);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [signupError, setSignupError] = useState('');

  // KL LMS Direct Form State
  const [lmsUsername, setLmsUsername] = useState(currentUser?.lmsUsername || '2100030045');
  const [lmsPassword, setLmsPassword] = useState('');
  const [isConnectingLms, setIsConnectingLms] = useState(false);
  const [lmsSuccessMsg, setLmsSuccessMsg] = useState('');
  const [lmsError, setLmsError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please enter your KL Student ID / Email and password.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginIdentifier.trim(),
          password: loginPassword.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoLogin = async (type: 'student' | 'faculty') => {
    setIsLoggingIn(true);
    setLoginError('');

    const identifier = type === 'student' ? '2100030045' : 'KL-FT-0842';
    const pwd = 'password123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: identifier, password: pwd })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');
      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError('All required fields must be filled.');
      return;
    }

    setIsSigningUp(true);
    setSignupError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          klId: signupKlId.trim() || signupEmail.split('@')[0],
          email: signupEmail.trim(),
          password: signupPassword.trim(),
          department: signupDept,
          linkLms: signupLinkLms
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setSignupError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleConnectLms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lmsUsername.trim()) {
      setLmsError('Please provide your KL LMS Username or Student ID.');
      return;
    }

    setIsConnectingLms(true);
    setLmsError('');
    setLmsSuccessMsg('');

    try {
      const res = await fetch('/api/auth/kl-lms/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          lmsUsername: lmsUsername.trim(),
          lmsPassword: lmsPassword
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to link KL LMS account');

      setLmsSuccessMsg('Connected to KL LMS! Enrolled courses, attendance, and materials synchronized.');
      onAuthSuccess(data.user, `token-${data.user.id}`);
      setTimeout(() => {
        onClose();
        if (onNavigateToLmsSync) onNavigateToLmsSync();
      }, 1500);
    } catch (err: any) {
      setLmsError(err.message || 'Failed to connect to KL LMS.');
    } finally {
      setIsConnectingLms(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl space-y-0">
        {/* Header bar */}
        <div className="bg-brand-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-amber-300">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm leading-none">KL University Account</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-condensed font-bold bg-brand-700 text-amber-300 uppercase tracking-wider">
                  LMS Sync
                </span>
              </div>
              <p className="text-[11px] text-brand-200 mt-0.5">
                Integrated with lms.kluniversity.in
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-brand-200 hover:text-white hover:bg-brand-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-surface-border dark:border-stone-800 bg-surface-subtle dark:bg-stone-800/50 px-3 pt-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'login'
                ? 'border-brand-800 text-brand-800 dark:text-brand-300 font-bold'
                : 'border-transparent text-surface-muted hover:text-surface-dark'
            }`}
          >
            <Lock size={13} />
            <span>Sign In</span>
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'signup'
                ? 'border-brand-800 text-brand-800 dark:text-brand-300 font-bold'
                : 'border-transparent text-surface-muted hover:text-surface-dark'
            }`}
          >
            <User size={13} />
            <span>Sign Up</span>
          </button>
          <button
            onClick={() => setActiveTab('kl-lms')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'kl-lms'
                ? 'border-brand-800 text-brand-800 dark:text-brand-300 font-bold'
                : 'border-transparent text-surface-muted hover:text-surface-dark'
            }`}
          >
            <ShieldCheck size={13} />
            <span>KL LMS Direct</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <div className="space-y-3.5">
              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-1">
                    KL Student ID or University Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. 2100030045 or student@kluniversity.in"
                      className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-muted">
                      <User size={14} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl pl-9 pr-3 py-2 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-muted">
                      <Lock size={14} />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-brand-800 hover:bg-brand-900 text-white transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isLoggingIn ? <span>Verifying...</span> : <span>Sign In & Sync</span>}
                </button>
              </form>

              {/* Quick Demo Logins */}
              <div className="pt-2 border-t border-surface-border dark:border-stone-800 space-y-1.5">
                <span className="text-[10px] uppercase tracking-wider font-condensed font-bold text-surface-muted block">
                  Quick Demo Accounts (One-Click)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('student')}
                    className="p-2 rounded-lg border border-surface-border hover:border-brand-300 bg-surface-subtle dark:bg-stone-800 text-left space-y-0.5 transition-colors"
                  >
                    <span className="text-xs font-bold text-surface-dark dark:text-stone-100 block">
                      Food Tech Student
                    </span>
                    <span className="text-[10px] text-surface-muted font-mono block">
                      ID: 2100030045
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('faculty')}
                    className="p-2 rounded-lg border border-surface-border hover:border-brand-300 bg-surface-subtle dark:bg-stone-800 text-left space-y-0.5 transition-colors"
                  >
                    <span className="text-xs font-bold text-surface-dark dark:text-stone-100 block">
                      Food Tech Professor
                    </span>
                    <span className="text-[10px] text-surface-muted font-mono block">
                      ID: KL-FT-0842
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <div className="space-y-3">
              {signupError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {signupError}
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. K. Sai Praneeth"
                    className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-0.5">
                      KL Student ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupKlId}
                      onChange={(e) => setSignupKlId(e.target.value)}
                      placeholder="e.g. 2100030045"
                      className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-surface-dark dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-0.5">
                      Department
                    </label>
                    <select
                      value={signupDept}
                      onChange={(e) => setSignupDept(e.target.value as Department)}
                      className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-2.5 py-1.5 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                    >
                      <option value="Food Technology">Food Technology</option>
                      <option value="CSE">CSE</option>
                      <option value="AIDS">AI & DS</option>
                      <option value="ECE">ECE</option>
                      <option value="EEE">EEE</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-0.5">
                    KL University Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="e.g. 2100030045@kluniversity.in"
                    className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-0.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a password..."
                    className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl px-3 py-1.5 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="linkLmsCheckbox"
                    checked={signupLinkLms}
                    onChange={(e) => setSignupLinkLms(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-brand-800 focus:ring-brand-800"
                  />
                  <label htmlFor="linkLmsCheckbox" className="text-[11px] text-amber-900 dark:text-amber-200 cursor-pointer">
                    <strong>Auto-Sync with KL LMS (lms.kluniversity.in)</strong>: Automatically import enrolled Food Tech courses, lecture handouts, and exam syllabus.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-brand-800 hover:bg-brand-900 text-white transition-all shadow-sm disabled:opacity-50"
                >
                  {isSigningUp ? <span>Creating Account...</span> : <span>Create Account</span>}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: KL LMS DIRECT INTEGRATION */}
          {activeTab === 'kl-lms' && (
            <div className="space-y-3.5">
              <div className="bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/40 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-900 dark:text-brand-300 flex items-center space-x-1">
                    <ShieldCheck size={14} />
                    <span>Official KL LMS Moodle Gateway</span>
                  </span>
                  <a
                    href="https://lms.kluniversity.in/login/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-brand-800 font-semibold hover:underline flex items-center space-x-0.5"
                  >
                    <span>lms.kluniversity.in</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Authenticate your credentials to pull enrolled courses, In-Sem schedule, faculty slides, and attendance from the official university portal.
                </p>
              </div>

              {lmsSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>{lmsSuccessMsg}</span>
                </div>
              )}

              {lmsError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {lmsError}
                </div>
              )}

              <form onSubmit={handleConnectLms} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-1">
                    KL LMS Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={lmsUsername}
                    onChange={(e) => setLmsUsername(e.target.value)}
                    placeholder="e.g. 2100030045"
                    className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl p-2 text-xs text-surface-dark dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-dark dark:text-stone-200 mb-1">
                    KL LMS Password
                  </label>
                  <input
                    type="password"
                    value={lmsPassword}
                    onChange={(e) => setLmsPassword(e.target.value)}
                    placeholder="Enter your KL LMS password..."
                    className="w-full bg-surface dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl p-2 text-xs text-surface-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="submit"
                    disabled={isConnectingLms}
                    className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    {isConnectingLms ? (
                      <span>Syncing with LMS...</span>
                    ) : (
                      <>
                        <RefreshCw size={13} />
                        <span>Link & Sync KL LMS</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://lms.kluniversity.in/login/index.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-xl border border-surface-border bg-surface-subtle hover:bg-surface-border text-xs font-semibold text-surface-dark flex items-center space-x-1 transition-colors"
                  >
                    <span>Open LMS</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

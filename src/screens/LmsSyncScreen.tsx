import React, { useState } from 'react';
import { UserProfile, ScreenId } from '../types';
import {
  GraduationCap,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  ArrowLeft
} from 'lucide-react';

interface LmsSyncScreenProps {
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onNavigate: (screen: ScreenId) => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const LmsSyncScreen: React.FC<LmsSyncScreenProps> = ({
  currentUser,
  onOpenAuthModal,
  onNavigate,
  onUpdateUser
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSyncLms = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/kl-lms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}`
        },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not refresh the LMS connection.');

      if (data.user && onUpdateUser) onUpdateUser(data.user);
      setSyncMessage(data.message || 'LMS connection refreshed.');
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not refresh the LMS connection.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-7 pb-24 animate-fade-in">
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="Back to home"
          className="flex h-11 w-11 items-center justify-center rounded-md border border-[#E8E4DF] bg-white text-[#1A1A1A] shadow-sm transition-colors hover:border-[#B8860B] hover:text-[#B8860B]"
        >
          <ArrowLeft size={17} />
        </button>
        <div>
          <p className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#B8860B]">LMS connection</p>
          <h1 className="mt-1 font-serif text-2xl leading-tight text-[#1A1A1A] sm:text-3xl">KL LMS</h1>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#E8E4DF] bg-white shadow-[0_4px_12px_rgba(26,26,26,0.06)]">
        <div className="border-t-2 border-[#B8860B] p-7 sm:p-9">
          <div className="flex flex-col gap-7 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#B8860B]">
                <GraduationCap size={15} />
                Official portal connection
              </div>
              <h2 className="font-serif text-3xl leading-tight text-[#1A1A1A] sm:text-4xl">
                Keep your LMS connection separate from StudyMate content.
              </h2>
              <p className="mt-4 text-base leading-7 text-[#6B6B6B]">
                StudyMate only displays academic content that has been verified and stored through the appropriate data source.
                This screen is for the LMS connection itself; it does not invent or display student academic records.
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
              <button
                type="button"
                onClick={handleSyncLms}
                disabled={isSyncing}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#B8860B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#D4A84B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                {isSyncing ? 'Refreshing…' : 'Refresh connection'}
              </button>
              <a
                href="https://lms.kluniversity.in/login/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#1A1A1A] px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#B8860B] hover:bg-[#F5F3F0] hover:text-[#B8860B]"
              >
                Open KL LMS <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {syncMessage && (
            <div role="status" className="mt-6 flex items-start gap-3 border-t border-[#E8E4DF] pt-5 text-sm text-[#1A1A1A]">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#B8860B]" />
              <span>{syncMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div role="alert" className="mt-6 flex items-start gap-3 border-t border-[#E8E4DF] pt-5 text-sm text-[#8B2E2E]">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-lg border border-[#E8E4DF] bg-white p-7 shadow-[0_1px_2px_rgba(26,26,26,0.04)]">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#B8860B]">Account</p>
          <h3 className="mt-3 font-serif text-2xl text-[#1A1A1A]">{currentUser?.name || 'Student account'}</h3>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-[#E8E4DF] pb-3">
              <dt className="text-[#6B6B6B]">KL ID</dt>
              <dd className="font-medium text-[#1A1A1A]">{currentUser?.klId || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#E8E4DF] pb-3">
              <dt className="text-[#6B6B6B]">Department</dt>
              <dd className="font-medium text-[#1A1A1A]">{currentUser?.department || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[#6B6B6B]">LMS username</dt>
              <dd className="max-w-[55%] truncate font-medium text-[#1A1A1A]">{currentUser?.lmsUsername || 'Not connected'}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="mt-6 min-h-11 rounded-md border border-[#1A1A1A] px-4 py-2 text-sm font-medium text-[#1A1A1A] transition-colors hover:border-[#B8860B] hover:bg-[#F5F3F0] hover:text-[#B8860B]"
          >
            Switch account
          </button>
        </article>

        <article className="rounded-lg border border-[#E8E4DF] bg-[#F5F3F0] p-7">
          <ShieldCheck size={22} className="text-[#B8860B]" />
          <h3 className="mt-4 font-serif text-2xl text-[#1A1A1A]">Data boundary</h3>
          <p className="mt-3 text-sm leading-7 text-[#6B6B6B]">
            The student workspace does not create, estimate, or substitute LMS records. Subject and resource content shown elsewhere in StudyMate comes from administrator-managed application data.
          </p>
          <div className="mt-6 flex items-center gap-2 border-t border-[#E8E4DF] pt-4 font-mono text-xs uppercase tracking-[0.12em] text-[#6B6B6B]">
            <Clock size={14} />
            Last connection refresh: {currentUser?.lmsLastSynced ? new Date(currentUser.lmsLastSynced).toLocaleString() : 'Not yet recorded'}
          </div>
        </article>
      </section>

      <section className="border-t border-[#E8E4DF] pt-6">
        <p className="text-sm leading-7 text-[#6B6B6B]">
          Need course material? Return to <button type="button" onClick={() => onNavigate('select-subject')} className="font-semibold text-[#B8860B] underline underline-offset-4">Subjects</button>.
          Only administrator-managed subjects and resources are presented there.
        </p>
      </section>
    </div>
  );
};

export default LmsSyncScreen;

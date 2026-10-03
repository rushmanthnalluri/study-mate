import React, { useState } from 'react';
import { Department, ScreenId, UserProfile } from '../types';
import {
  GraduationCap,
  LayoutDashboard,
  Award,
  Sparkles,
  Calendar,
  Layers,
  FileSearch,
  BookMarked,
  FolderTree,
  FileSpreadsheet,
  Menu,
  X,
  ShieldCheck,
  Bot,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenId;
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onNavigate: (screen: ScreenId) => void;
  departments: Department[];
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  selectedDepartment,
  onSelectDepartment,
  onNavigate,
  departments,
  currentUser,
  onOpenSettings
}) => {
  const [open, setOpen] = useState(false);

  const navigate = (screen: ScreenId) => {
    onNavigate(screen);
    setOpen(false);
  };

  const items: Array<{ id: ScreenId; label: string; icon: React.ElementType }> = [
    { id: 'mock-exam', label: 'Mock Paper', icon: FileSpreadsheet },
    { id: 'quiz', label: 'Quiz', icon: Award },
    { id: 'studio', label: 'Studio', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'pdf-analyzer', label: 'Past Papers', icon: FileSearch },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'knowledge-base', label: 'Knowledge', icon: FolderTree },
    { id: 'glossary', label: 'Glossary', icon: BookMarked },
    { id: 'chatbot', label: 'AI Tutor', icon: Bot }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[rgba(250,250,248,0.96)] backdrop-blur-md print:hidden">
      <div className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6">
          <span className="small-caps text-[10px] text-[var(--accent)]">StudyMate</span>
          <span className="hidden text-xs text-[var(--muted-foreground)] sm:block">
            Private academic workspace
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => navigate('home')}
          aria-label="StudyMate home"
          className="group flex min-h-11 min-w-0 items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-white text-[var(--accent)] shadow-[var(--shadow-sm)] transition-colors duration-200 group-hover:border-[var(--accent)]">
            <GraduationCap size={21} strokeWidth={1.7} />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate font-serif text-xl text-[var(--foreground)]">
              StudyMate
            </span>
            <span className="small-caps block text-[9px] text-[var(--muted-foreground)]">
              academic workspace
            </span>
          </span>
        </button>

        <nav aria-label="Primary navigation" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {items.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => navigate(id)}
              aria-current={currentScreen === id ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center gap-1.5 border-b px-2.5 text-xs font-medium tracking-[0.04em] transition-colors duration-200 ${
                currentScreen === id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon size={14} strokeWidth={1.7} />
              {label}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('admin')}
              aria-current={currentScreen === 'admin' ? 'page' : undefined}
              className={`inline-flex min-h-11 items-center gap-1.5 border-b px-2.5 text-xs font-medium tracking-[0.04em] transition-colors ${
                currentScreen === 'admin'
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              <ShieldCheck size={14} strokeWidth={1.7} />
              Admin
            </button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-3 border-l border-[var(--border)] pl-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-white font-serif text-sm text-[var(--accent)]">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </span>
            <div className="max-w-32">
              <p className="truncate text-xs font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="truncate font-mono text-[9px] tracking-[0.08em] text-[var(--muted-foreground)]">{currentUser?.klId}</p>
            </div>
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              title="Account settings"
              aria-label="Open account settings"
              className="editorial-secondary flex h-11 w-11 items-center justify-center"
            >
              <Settings size={16} strokeWidth={1.7} />
            </button>
          )}

          <label className="sr-only" htmlFor="department-filter">Department</label>
          <select
            id="department-filter"
            value={selectedDepartment}
            onChange={e => onSelectDepartment(e.target.value as Department)}
            className="hidden h-11 border border-[var(--border)] bg-white px-3 text-xs text-[var(--foreground)] outline-none transition-colors hover:border-[var(--accent)] md:block"
          >
            {departments.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            className="editorial-secondary flex h-11 w-11 items-center justify-center lg:hidden"
          >
            {open ? <X size={19} strokeWidth={1.7} /> : <Menu size={19} strokeWidth={1.7} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-5 lg:hidden">
          <div className="mb-4 flex items-center gap-3 border-b border-[var(--border)] pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white font-serif text-sm text-[var(--accent)]">
              {currentUser?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{currentUser?.name}</p>
              <p className="font-mono text-[10px] tracking-[0.08em] text-[var(--muted-foreground)]">{currentUser?.klId}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-1">
            {items.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => navigate(id)}
                aria-current={currentScreen === id ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-2 border-b py-2 text-left text-sm transition-colors ${
                  currentScreen === id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon size={15} strokeWidth={1.7} />
                {label}
              </button>
            ))}
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => navigate('admin')}
                aria-current={currentScreen === 'admin' ? 'page' : undefined}
                className="flex min-h-11 items-center gap-2 border-b border-[var(--accent)] py-2 text-left text-sm text-[var(--accent)]"
              >
                <ShieldCheck size={15} strokeWidth={1.7} />
                Admin Console
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

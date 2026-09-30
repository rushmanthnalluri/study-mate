import React, { useState } from 'react';
import { Department, ScreenId, UserProfile } from '../types';
import { GraduationCap, LayoutDashboard, Calendar, Layers, FileSearch, BookMarked, FolderTree, FileSpreadsheet, Moon, Sun, Menu, X, ShieldCheck, Bot, Settings, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenId;
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onNavigate: (screen: ScreenId) => void;
  departments: Department[];
  isNightMode?: boolean;
  onToggleNightMode?: () => void;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: () => void;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen, selectedDepartment, onSelectDepartment, onNavigate, departments,
  isNightMode = false, onToggleNightMode, currentUser, onOpenSettings
}) => {
  const [open, setOpen] = useState(false);

  const navigate = (screen: ScreenId) => {
    onNavigate(screen);
    setOpen(false);
  };

  const items: Array<{id: ScreenId; label: string; icon: React.ElementType}> = [
    { id: 'mock-exam', label: 'Mock Paper', icon: FileSpreadsheet },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'pdf-analyzer', label: 'Past Papers', icon: FileSearch },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'knowledge-base', label: 'Knowledge', icon: FolderTree },
    { id: 'glossary', label: 'Glossary', icon: BookMarked },
    { id: 'lms-sync', label: 'LMS', icon: RefreshCw },
    { id: 'chatbot', label: 'AI Tutor', icon: Bot }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6d9cc] bg-[#fffaf4]/95 shadow-[0_8px_30px_rgba(75,55,42,0.06)] backdrop-blur-xl dark:border-[#3b2d25] dark:bg-[#211a16]/95 print:hidden">
      <div className="bg-[#3b2b23] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#eadbc9]">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#b9d9a3]" /> KL University • StudyMate</span>
          <span className="hidden sm:block text-[#d8b895]">Account-based academic workspace</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button onClick={() => navigate('home')} className="group flex min-w-0 items-center gap-3 text-left">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#7c4f2c] text-[#f3d39f] shadow-sm transition-transform group-hover:-translate-y-0.5">
            <GraduationCap size={22} />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-[17px] font-black tracking-tight text-[#3b2b23] dark:text-[#fff8f1]">StudyMate <span className="text-[#a9683d]">AI</span></span>
            <span className="block text-[10px] font-semibold text-[#907d6d]">KL exam preparation suite</span>
          </span>
        </button>

        <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
          {items.map(({id,label,icon:Icon}) => (
            <button key={id} onClick={() => navigate(id)} className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-[11px] font-bold transition-all ${currentScreen === id ? 'bg-[#efe0d1] text-[#754925] shadow-sm' : 'text-[#746357] hover:bg-[#f7eee6] hover:text-[#4b392e]'}`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
          {currentUser?.role === 'admin' && (
            <button onClick={() => navigate('admin')} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-extrabold ${currentScreen === 'admin' ? 'bg-[#3b2b23] text-white' : 'bg-[#f0e5da] text-[#4b392e] hover:bg-[#e6d7c7]'}`}>
              <ShieldCheck size={14} /> Admin
            </button>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-[#e5d7c8] bg-[#f8f0e8] px-2.5 py-1.5 sm:flex dark:border-[#49372c] dark:bg-[#2c211b]">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#e2c2a3] text-[11px] font-black text-[#5b3822]">{currentUser?.name?.charAt(0).toUpperCase()}</span>
            <div className="max-w-28">
              <p className="truncate text-[11px] font-extrabold text-[#4b392e] dark:text-[#fff8f1]">{currentUser?.name}</p>
              <p className="truncate font-mono text-[9px] text-[#907d6d]">{currentUser?.klId}</p>
            </div>
          </div>

          {onToggleNightMode && (
            <button onClick={onToggleNightMode} title="Toggle night mode" className="rounded-xl border border-[#dfd1c4] bg-white p-2 text-[#6f5d50] hover:bg-[#f6eee7] dark:border-[#4a382d] dark:bg-[#2c211b]">
              {isNightMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          {onOpenSettings && (
            <button onClick={onOpenSettings} title="Account settings" className="rounded-xl border border-[#dfd1c4] bg-white p-2 text-[#6f5d50] hover:bg-[#f6eee7] dark:border-[#4a382d] dark:bg-[#2c211b]">
              <Settings size={16} />
            </button>
          )}
          <select value={selectedDepartment} onChange={e => onSelectDepartment(e.target.value as Department)} className="hidden rounded-xl border border-[#dfd1c4] bg-white px-3 py-2 text-[11px] font-bold text-[#59473a] outline-none focus:ring-2 focus:ring-[#c28b5b]/30 md:block dark:border-[#4a382d] dark:bg-[#2c211b] dark:text-[#fff8f1]">
            {departments.map(d => <option key={d} value={d}>{d === 'Food Technology' ? 'Food Tech' : d === 'All' ? 'All Depts' : d}</option>)}
          </select>
          <button onClick={() => setOpen(v => !v)} className="rounded-xl border border-[#dfd1c4] bg-white p-2 text-[#59473a] hover:bg-[#f6eee7] xl:hidden dark:border-[#4a382d] dark:bg-[#2c211b] dark:text-white">
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[#eadfd4] bg-[#fffaf4] px-4 py-4 xl:hidden dark:border-[#3b2d25] dark:bg-[#211a16]">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-[#eadfd4] bg-[#f8f0e8] p-3 dark:border-[#46352b] dark:bg-[#2c211b]">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7c4f2c] text-[#f3d39f] font-black">{currentUser?.name?.charAt(0).toUpperCase()}</span>
            <div><p className="text-xs font-extrabold">{currentUser?.name}</p><p className="font-mono text-[10px] text-[#907d6d]">{currentUser?.klId}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {items.map(({id,label,icon:Icon}) => (
              <button key={id} onClick={() => navigate(id)} className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-xs font-bold ${currentScreen === id ? 'border-[#cba27d] bg-[#efe0d1] text-[#754925]' : 'border-[#eadfd4] bg-white text-[#59473a] hover:bg-[#f8f0e8]'}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
            {currentUser?.role === 'admin' && (
              <button onClick={() => navigate('admin')} className="flex items-center gap-2 rounded-2xl border border-[#cdb9a7] bg-[#3b2b23] px-3 py-3 text-left text-xs font-bold text-white">
                <ShieldCheck size={15} /> Admin Console
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

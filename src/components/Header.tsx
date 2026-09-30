import React, { useState } from 'react';
import { Department, ScreenId, UserProfile } from '../types';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  LayoutDashboard,
  Calendar,
  Layers,
  FileSearch,
  BookMarked,
  FolderTree,
  FileSpreadsheet,
  Moon,
  Sun,
  Menu,
  X,
  ShieldCheck,
  User,
  LogIn,
  RefreshCw,
  Bot,
  Settings
} from 'lucide-react';

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
  currentScreen,
  selectedDepartment,
  onSelectDepartment,
  onNavigate,
  departments,
  isNightMode = false,
  onToggleNightMode,
  currentUser,
  onOpenAuthModal,
  onOpenSettings
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (screen: ScreenId) => {
    onNavigate(screen);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-surface-border dark:border-stone-800 transition-all print:hidden">
      {/* Top micro status bar */}
      <div className="bg-brand-900 text-brand-100 px-4 py-1.5 text-[11px] font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-condensed tracking-wider uppercase text-[12px]">KL University • All Engineering Depts</span>
        </div>
        <div className="flex items-center space-x-3 text-brand-200">
          <span className="hidden sm:inline font-mono">Exam Syllabus 2024-26</span>
          <a
            href="https://foodsciencedaily.com/login?next=%2Fdashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors underline decoration-brand-400 underline-offset-2 flex items-center space-x-1"
          >
            <span>Food Science Daily</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        <div
          onClick={() => navigateTo('home')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <GraduationCap size={20} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-lg text-surface-dark dark:text-white tracking-tight leading-none">
                StudyMate <span className="text-brand-800 font-extrabold">AI</span>
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-condensed font-bold bg-brand-100 text-brand-900 uppercase tracking-wider">
                KL Exam Mode
              </span>
            </div>
            <p className="text-[11px] text-surface-muted leading-tight font-serif italic">
              Study the way KL exams expect
            </p>
          </div>
        </div>

        {/* Desktop Quick Nav Links */}
        <div className="hidden lg:flex items-center space-x-1 text-xs font-semibold text-surface-dark">
          <button
            onClick={() => navigateTo('mock-exam')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'mock-exam' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <FileSpreadsheet size={14} />
            <span>Mock Paper</span>
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'dashboard' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => navigateTo('flashcards')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'flashcards' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <Layers size={14} />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => navigateTo('pdf-analyzer')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'pdf-analyzer' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <FileSearch size={14} />
            <span>Papers</span>
          </button>
          <button
            onClick={() => navigateTo('planner')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'planner' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <Calendar size={14} />
            <span>Planner</span>
          </button>
          <button
            onClick={() => navigateTo('knowledge-base')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'knowledge-base' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <FolderTree size={14} />
            <span>Drive KB</span>
          </button>
          <button
            onClick={() => navigateTo('glossary')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'glossary' ? 'bg-brand-50 text-brand-800' : 'hover:bg-surface-subtle'
            }`}
          >
            <BookMarked size={14} />
            <span>Glossary</span>
          </button>
          <button
            onClick={() => navigateTo('lms-sync')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'lms-sync'
                ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-sm'
                : 'hover:bg-amber-50 text-amber-900 font-semibold'
            }`}
          >
            <RefreshCw size={14} className={currentScreen === 'lms-sync' ? 'text-amber-800' : 'text-amber-700'} />
            <span>KL LMS</span>
          </button>
          <button
            onClick={() => navigateTo('chatbot')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'chatbot'
                ? 'bg-brand-800 text-white font-bold shadow-sm'
                : 'hover:bg-brand-50 text-brand-900 font-semibold'
            }`}
          >
            <Bot size={14} className={currentScreen === 'chatbot' ? 'text-amber-300' : 'text-brand-800'} />
            <span>AI Tutor</span>
          </button>
          <button
            onClick={() => navigateTo('admin')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1 ${
              currentScreen === 'admin'
                ? 'bg-brand-800 text-white'
                : 'bg-brand-50 text-brand-900 border border-brand-200/60 hover:bg-brand-100'
            }`}
          >
            <ShieldCheck size={14} className={currentScreen === 'admin' ? 'text-amber-300' : 'text-brand-800'} />
            <span className="font-bold">Admin Portal</span>
          </button>
        </div>

        {/* Right side controls: User Pill, Dept Switcher, Night Toggle & Settings */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <button
              onClick={() => navigateTo('lms-sync')}
              title={`User: ${currentUser.name} (${currentUser.klId}) - Click for LMS Sync`}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200/80 text-brand-900 transition-colors cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-brand-800 text-amber-300 text-[10px] font-bold flex items-center justify-center">
                {currentUser.name ? currentUser.name.charAt(0) : 'K'}
              </div>
              <span className="font-mono text-xs font-semibold hidden md:inline">
                {currentUser.klId}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="KL LMS Connected" />
            </button>
          ) : onOpenAuthModal ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold transition-colors shadow-sm"
            >
              <LogIn size={13} />
              <span className="hidden sm:inline">Sign In / LMS</span>
            </button>
          ) : null}

          {onToggleNightMode && (
            <button
              onClick={onToggleNightMode}
              title={isNightMode ? "Switch to Day Mode" : "Switch to Late Night Study Mode"}
              className="p-1.5 rounded-lg border border-surface-border text-surface-muted hover:text-surface-dark transition-colors"
            >
              {isNightMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Settings & AI Model Provider"
              className="p-1.5 rounded-lg border border-surface-border text-surface-muted hover:text-surface-dark transition-colors"
            >
              <Settings size={16} />
            </button>
          )}

          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => onSelectDepartment(e.target.value as Department)}
              className="appearance-none bg-surface-subtle border border-surface-border text-xs font-semibold text-surface-dark rounded-lg pl-3 pr-7 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-800/30 cursor-pointer"
            >
              <option value="All">All Depts</option>
              <option value="CSE">CSE</option>
              <option value="AIDS">AI & DS</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="Food Technology">Food Tech</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-surface-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg border border-surface-border text-surface-dark hover:bg-surface-subtle transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu for Features */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-surface-border px-4 py-3 space-y-2.5 animate-fade-in shadow-elevated">
          {/* Mobile User Profile Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-brand-50 dark:bg-stone-800 border border-brand-200 dark:border-stone-700">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.charAt(0) : 'K'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-surface-dark dark:text-white leading-tight">
                  {currentUser?.name || 'KL Student'}
                </p>
                <p className="text-[10px] text-surface-muted font-mono">
                  ID: {currentUser?.klId || '2100030045'} • {currentUser?.isLmsConnected !== false ? 'LMS Connected' : 'Guest'}
                </p>
              </div>
            </div>
            {onOpenAuthModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="text-xs font-semibold text-brand-800 dark:text-amber-300 hover:underline px-2 py-1"
              >
                {currentUser ? 'Switch' : 'Sign In'}
              </button>
            )}
          </div>

          <div className="text-[10px] font-condensed uppercase tracking-wider font-bold text-surface-muted mb-1">
            KL Exam Mode Suite
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-surface-dark">
            <button
              onClick={() => navigateTo('lms-sync')}
              className="p-2.5 rounded-xl border border-amber-300 bg-amber-50/80 flex items-center space-x-2 text-amber-950 font-bold hover:bg-amber-100 col-span-2 shadow-sm"
            >
              <RefreshCw size={16} className="text-amber-800" />
              <span>KL LMS Portal & Attendance Tracker</span>
            </button>
            <button
              onClick={() => navigateTo('mock-exam')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <FileSpreadsheet size={16} className="text-brand-800" />
              <span>Mock Paper</span>
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <LayoutDashboard size={16} className="text-brand-800" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateTo('flashcards')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <Layers size={16} className="text-brand-800" />
              <span>Flashcards</span>
            </button>
            <button
              onClick={() => navigateTo('pdf-analyzer')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <FileSearch size={16} className="text-brand-800" />
              <span>Past Papers</span>
            </button>
            <button
              onClick={() => navigateTo('planner')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <Calendar size={16} className="text-brand-800" />
              <span>Exam Planner</span>
            </button>
            <button
              onClick={() => navigateTo('knowledge-base')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 hover:bg-brand-50 hover:text-brand-800"
            >
              <FolderTree size={16} className="text-brand-800" />
              <span>Drive KB</span>
            </button>
            <button
              onClick={() => navigateTo('chatbot')}
              className="p-2.5 rounded-xl border border-brand-200 bg-brand-50 flex items-center space-x-2 text-brand-900 font-bold hover:bg-brand-100 col-span-2 shadow-sm"
            >
              <Bot size={16} className="text-amber-700" />
              <span>StudyMate AI Academic Tutor (Ask Doubts)</span>
            </button>
            <button
              onClick={() => navigateTo('admin')}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 text-surface-dark font-bold hover:bg-brand-50"
            >
              <ShieldCheck size={16} className="text-brand-800" />
              <span>Admin Portal</span>
            </button>
            {onOpenSettings && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="p-2.5 rounded-xl border border-surface-border bg-surface-subtle flex items-center space-x-2 text-surface-dark font-bold hover:bg-brand-50"
              >
                <Settings size={16} className="text-brand-800" />
                <span>AI Settings</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import { ScreenId } from '../types';
import { Home, BookOpen, PenTool, Bookmark, FileSpreadsheet } from 'lucide-react';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, savedCount }) => {
  const navItems = [
    { id: 'home' as ScreenId, label: 'Home', icon: Home },
    { id: 'select-subject' as ScreenId, label: 'Subjects', icon: BookOpen },
    { id: 'enter-topic' as ScreenId, label: 'Generate', icon: PenTool, highlight: true },
    { id: 'quiz' as ScreenId, label: 'Quiz', icon: FileSpreadsheet },
    { id: 'save' as ScreenId, label: 'Revision', icon: Bookmark, badge: savedCount > 0 ? savedCount : null }
  ];

  return (
    <nav aria-label="Mobile primary navigation" className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[rgba(255,255,255,0.96)] shadow-[0_-8px_24px_rgba(26,26,26,0.05)] backdrop-blur-xl safe-bottom print:hidden">
      <div className="mx-auto flex max-w-xl items-end justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentScreen === item.id || (item.id === 'enter-topic' && currentScreen === 'generate-notes');
          if (item.highlight) {
            return (
              <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={active ? 'page' : undefined} className="group -mt-7 flex min-w-[68px] flex-col items-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-md border border-[var(--border)] shadow-[var(--shadow-md)] transition-colors duration-200 ${active ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-white text-[var(--foreground)]'}`}>
                  <Icon size={22} />
                </span>
                <span className={`mt-1 text-[9px] font-medium uppercase tracking-[0.12em] ${active ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)]'}`}>{item.label}</span>
              </button>
            );
          }
          return (
            <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={active ? 'page' : undefined} className={`relative flex min-w-[58px] flex-col items-center rounded-md px-2 py-1.5 transition-colors ${active ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <span className={`relative rounded-md p-1.5 ${active ? 'bg-[var(--muted)]' : ''}`}>
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                {item.badge && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[8px] font-black text-white">{item.badge}</span>}
              </span>
              <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

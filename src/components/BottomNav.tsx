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
    { id: 'mock-exam' as ScreenId, label: 'Mock', icon: FileSpreadsheet },
    { id: 'save' as ScreenId, label: 'Revision', icon: Bookmark, badge: savedCount > 0 ? savedCount : null }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e4d8cd] bg-[#fffaf4]/95 shadow-[0_-10px_30px_rgba(70,50,35,0.08)] backdrop-blur-xl safe-bottom print:hidden dark:border-[#3b2d25] dark:bg-[#211a16]/95">
      <div className="mx-auto flex max-w-xl items-end justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = currentScreen === item.id || (item.id === 'enter-topic' && currentScreen === 'generate-notes');
          if (item.highlight) {
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)} className="group -mt-7 flex min-w-[68px] flex-col items-center">
                <span className={`flex h-14 w-14 items-center justify-center rounded-[21px] border-4 border-[#fffaf4] shadow-lg transition-all group-active:scale-95 dark:border-[#211a16] ${active ? 'bg-[#7c4f2c] text-[#f3d39f]' : 'bg-[#a9683d] text-white'}`}>
                  <Icon size={22} />
                </span>
                <span className={`mt-1 text-[9px] font-black uppercase tracking-wider ${active ? 'text-[#754925]' : 'text-[#8b796b]'}`}>{item.label}</span>
              </button>
            );
          }
          return (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`relative flex min-w-[58px] flex-col items-center rounded-2xl px-2 py-1.5 transition-colors ${active ? 'text-[#754925]' : 'text-[#8b796b] hover:text-[#59473a]'}`}>
              <span className={`relative rounded-xl p-1.5 ${active ? 'bg-[#f1e2d3]' : ''}`}>
                <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
                {item.badge && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#a9683d] px-1 text-[8px] font-black text-white">{item.badge}</span>}
              </span>
              <span className="mt-0.5 text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

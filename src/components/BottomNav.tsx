import React from 'react';
import { ScreenId } from '../types';
import { Home, BookOpen, PenTool, Bookmark, FileSpreadsheet } from 'lucide-react';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  savedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  savedCount
}) => {
  const navItems = [
    {
      id: 'home' as ScreenId,
      label: 'Home',
      icon: Home
    },
    {
      id: 'select-subject' as ScreenId,
      label: 'Subjects',
      icon: BookOpen
    },
    {
      id: 'enter-topic' as ScreenId,
      label: 'Generate',
      icon: PenTool,
      highlight: true
    },
    {
      id: 'mock-exam' as ScreenId,
      label: 'Mock Paper',
      icon: FileSpreadsheet
    },
    {
      id: 'save' as ScreenId,
      label: 'Revision',
      icon: Bookmark,
      badge: savedCount > 0 ? savedCount : null
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-surface-border shadow-elevated safe-bottom print:hidden">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'enter-topic' && currentScreen === 'generate-notes');

          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center -top-3 focus:outline-none transition-all duration-200 group`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${
                    isActive
                      ? 'bg-brand-800 text-white ring-4 ring-brand-100'
                      : 'bg-brand-900 text-amber-300'
                  }`}
                >
                  <Icon size={22} className="stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-condensed font-bold mt-1 text-brand-900 uppercase tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-brand-800 font-semibold'
                  : 'text-surface-muted hover:text-surface-dark'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 bg-brand-800 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight mt-0.5">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

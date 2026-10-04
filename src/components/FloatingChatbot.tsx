import React from 'react';
import { ScreenId } from '../types';
import { Bot, Sparkles, MessageSquare } from 'lucide-react';

interface FloatingChatbotProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  currentScreen,
  onNavigate
}) => {
  // Don't show if already on the chatbot screen or in print mode
  if (currentScreen === 'chatbot') return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 print:hidden animate-fade-in">
      <button
        onClick={() => onNavigate('chatbot')}
        className="group relative flex items-center space-x-2 bg-gradient-to-r from-[var(--accent-900)] to-amber-700 hover:from-[var(--accent-800)] hover:to-amber-600 text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-[var(--shadow-lg)] border border-amber-400/40 transition-all duration-300 hover:scale-105 active:scale-95"
        title="Open StudyMate AI Tutor"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>

        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
          <Bot size={16} className="text-amber-300" />
        </div>

        <span className="text-xs font-bold tracking-tight pr-1">
          Ask AI Tutor
        </span>

        <span className="absolute -top-2 -right-1 bg-amber-400 text-brand-950 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full shadow-sm">
          24/7
        </span>
      </button>
    </div>
  );
};

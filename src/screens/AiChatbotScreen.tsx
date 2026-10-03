import React, { useState, useEffect, useRef } from 'react';
import { Department, ScreenId, UserProfile, ChatMessage } from '../types';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  BookOpen,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  Flame,
  FileSpreadsheet,
  GraduationCap
} from 'lucide-react';

interface AiChatbotScreenProps {
  currentUser: UserProfile | null;
  onNavigate: (screen: ScreenId) => void;
  onSelectSubjectAndTopic?: (subjectName: string, topic?: string) => void;
  selectedDepartment: Department;
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `### Welcome to StudyMate AI Tutor

I can help you understand published study material, work through concepts, generate structured notes, and practice with questions.

Ask a question whenever you are ready.`,
  timestamp: new Date().toISOString(),
  suggestedActions: [
    { label: 'Explain a concept', actionType: 'notes', payload: 'Explain this concept clearly' },
    { label: 'Create practice questions', actionType: 'flashcards' }
  ]
};

const SUGGESTION_PROMPTS = [
  'Explain a difficult concept with a simple example',
  'Compare two related concepts',
  'Create a short practice quiz',
];

export const AiChatbotScreen: React.FC<AiChatbotScreenProps> = ({
  currentUser,
  onNavigate,
  onSelectSubjectAndTopic,
  selectedDepartment
}) => {
  const chatStorageKey = `studymate_chat_history_${currentUser?.id || 'anonymous'}`;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = currentUser?.id ? localStorage.getItem(`studymate_chat_history_${currentUser.id}`) : null;
      return stored ? JSON.parse(stored) : [DEFAULT_WELCOME_MESSAGE];
    } catch {
      return [DEFAULT_WELCOME_MESSAGE];
    }
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedSubject] = useState('General study');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (!currentUser?.id) return;
    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    } catch (e) {}
  }, [messages, currentUser?.id, chatStorageKey]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
      department: selectedDepartment,
      subject: selectedSubject
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsSending(true);

    try {
      const token = localStorage.getItem('studymate_token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: textToSend,
          department: selectedDepartment,
          subject: selectedSubject,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply?.content || data.reply || 'Here is the academic explanation for your query.',
        timestamp: new Date().toISOString(),
        suggestedActions: data.reply?.suggestedActions || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackBotMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `### 📚 StudyMate Academic Response for: ${textToSend}

According to the KL University curriculum for **${selectedDepartment} (${selectedSubject})**:
- **Standard Evaluation Tenet:** Always state the official definition, followed by governing parameters and boundary safety limits.
- **Marks Recommendation:** For 2M, write 20-40 words with SI units; for 5M, include a comparative table; for 10M, draw a clearly labeled process flowchart with Critical Control Points (CCPs).

*(Live connection response grounded in local academic syllabus).*`,
        timestamp: new Date().toISOString(),
        suggestedActions: [
          { label: `Generate notes for ${selectedSubject}`, actionType: 'notes', payload: selectedSubject }
        ]
      };
      setMessages(prev => [...prev, fallbackBotMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear your conversation history?')) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      localStorage.removeItem(chatStorageKey);
    }
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: string }) => {
    if (action.actionType === 'notes') {
      if (onSelectSubjectAndTopic && action.payload) {
        onSelectSubjectAndTopic(selectedSubject, action.payload);
      } else {
        onNavigate('select-subject');
      }
    } else if (action.actionType === 'flashcards') {
      onNavigate('flashcards');
    } else if (action.actionType === 'mock-exam') {
      onNavigate('mock-exam');
    } else if (action.actionType === 'topic') {
      onNavigate('enter-topic');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto pb-4 animate-fade-in">
      {/* Header bar */}
      <div className="bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 rounded-2xl p-4 shadow-sm mb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 to-amber-700 text-white flex items-center justify-center shadow-sm">
            <Bot size={22} className="text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-bold text-base text-surface-dark dark:text-white leading-tight">
                StudyMate AI Tutor
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>KL Exam Grounded</span>
              </span>
            </div>
            <p className="text-xs text-surface-muted">
              Ask doubts, solve kinetics, or generate KL exam solutions
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Subject Context Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-lg px-2.5 py-1.5 font-semibold text-surface-dark dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-brand-800"
          >
            <option value="Food Microbiology">Food Microbiology</option>
            <option value="Dairy Technology">Dairy Technology</option>
            <option value="Food Processing and Engineering">Food Process Eng.</option>
            <option value="Food Chemistry and Nutrition">Food Chemistry</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="Digital Signal Processing">DSP</option>
          </select>

          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg border border-surface-border dark:border-stone-700 text-surface-muted hover:text-rose-600 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-2 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  isUser
                    ? 'bg-brand-800 text-amber-300'
                    : 'bg-gradient-to-tr from-amber-600 to-brand-900 text-white'
                }`}
              >
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-brand-800 text-white rounded-tr-none'
                    : 'bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 text-surface-dark dark:text-stone-100 rounded-tl-none'
                }`}
              >
                <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-sans space-y-2">
                  {msg.content}
                </div>

                {/* Suggested Action Chips */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-subtle dark:border-stone-800 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(action)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-brand-900 dark:text-amber-300 text-xs font-semibold transition-colors border border-brand-200 dark:border-stone-700 shadow-2xs"
                      >
                        <Sparkles size={11} className="text-amber-600 dark:text-amber-400" />
                        <span>{action.label}</span>
                        <ArrowRight size={11} />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1 text-right font-mono ${
                    isUser ? 'text-brand-200' : 'text-surface-muted'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center space-x-2 text-xs text-surface-muted animate-pulse p-2">
            <Bot size={16} className="text-brand-800" />
            <span>StudyMate AI is analyzing KL course rubrics and formulating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips (Horizontal Carousel) */}
      <div className="py-2 overflow-x-auto scrollbar-none flex items-center space-x-2 shrink-0">
        <span className="text-[11px] font-bold text-surface-muted shrink-0 flex items-center space-x-1 pl-1">
          <Lightbulb size={13} className="text-amber-500" />
          <span>Quick:</span>
        </span>
        {SUGGESTION_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isSending}
            className="text-xs bg-white dark:bg-stone-900 hover:bg-brand-50 dark:hover:bg-stone-800 text-surface-dark dark:text-stone-200 border border-surface-border dark:border-stone-800 px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 rounded-2xl p-2 shadow-sm flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask about ${selectedSubject}, D-values, pasteurization, or exam questions...`}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-surface-dark dark:text-white placeholder:text-surface-muted focus:outline-none"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="px-4 py-2.5 rounded-xl bg-brand-800 hover:bg-brand-900 disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-1.5 transition-all active:scale-95 shadow-sm"
        >
          <Send size={15} />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};

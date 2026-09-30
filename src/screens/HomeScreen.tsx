import React from 'react';
import { Department, Subject, ScreenId, ExamNote } from '../types';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  FileText,
  Layers,
  Calendar,
  LayoutDashboard,
  FileSearch,
  BookMarked,
  FileSpreadsheet,
  GraduationCap,
  RefreshCw,
  Bot
} from 'lucide-react';

interface HomeScreenProps {
  subjects: Subject[];
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onSelectSubject: (subject: Subject) => void;
  onNavigate: (screen: ScreenId) => void;
  recentNotes: ExamNote[];
  onOpenNote: (note: ExamNote) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  subjects,
  selectedDepartment,
  onSelectDepartment,
  onSelectSubject,
  onNavigate,
  recentNotes,
  onOpenNote
}) => {
  const departments: Department[] = ['All', 'CSE', 'AIDS', 'ECE', 'EEE', 'Food Technology'];

  const filteredSubjects = subjects.filter(
    (s) => selectedDepartment === 'All' || s.department === selectedDepartment
  );

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Hero Banner / Academic Introduction */}
      <div className="bg-gradient-to-br from-brand-900 via-brand-800 to-stone-900 text-white rounded-2xl p-5 shadow-elevated relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center space-x-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-condensed font-semibold tracking-wider text-amber-300 uppercase">
            <Sparkles size={13} />
            <span>KL University Exam Mode v0.1</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white leading-tight">
            Study the way KL exams expect.
          </h1>

          <p className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-sans max-w-lg">
            Grounded in KL course materials, previous semester papers, and exact examiner mark rubrics across all engineering departments.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onNavigate('select-subject')}
              className="inline-flex items-center justify-center space-x-2 bg-white text-brand-900 hover:bg-brand-50 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <span>Pick Subject & Generate Notes</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('mock-exam')}
              className="inline-flex items-center justify-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-3 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              <FileSpreadsheet size={15} />
              <span>Full Mock Exam Paper</span>
            </button>
            <button
              onClick={() => onNavigate('chatbot')}
              className="inline-flex items-center justify-center space-x-1.5 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-stone-950 px-4 py-3 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              <Bot size={15} />
              <span>Ask AI Tutor</span>
            </button>
            <button
              onClick={() => onNavigate('lms-sync')}
              className="inline-flex items-center justify-center space-x-1.5 bg-brand-700/80 hover:bg-brand-600 text-white px-3.5 py-3 rounded-xl font-bold text-xs transition-colors border border-brand-500/30 backdrop-blur-sm"
            >
              <RefreshCw size={14} className="text-amber-300" />
              <span>KL LMS Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* KL University LMS Sync Quick Callout */}
      <div
        onClick={() => onNavigate('lms-sync')}
        className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-amber-500/10 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-950/40 transition-all group shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-brand-950 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-brand-950 dark:text-amber-200">
                KL University LMS Moodle Integrated
              </h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-surface-muted dark:text-stone-300">
              Track 85% attendance eligibility, In-Sem assignments, and synced Food Tech courses directly from <span className="font-mono font-semibold">lms.kluniversity.in</span>.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs font-bold text-brand-900 dark:text-amber-300 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
          <span className="hidden sm:inline">Open LMS Gateway</span>
          <ChevronRight size={14} />
        </div>
      </div>

      {/* Feature Suite Hub */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-condensed uppercase tracking-wider font-bold text-surface-muted block">
            KL Exam Preparation Suite
          </span>
          <span className="text-[10px] text-brand-800 font-semibold">
            All Depts Supported
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Mock Exam Paper */}
          <div
            onClick={() => onNavigate('mock-exam')}
            className="bg-white border border-surface-border p-3 rounded-xl shadow-mobile-card hover:border-brand-400 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-surface-dark group-hover:text-brand-800">
                Mock Paper
              </h4>
              <p className="text-[10px] text-surface-muted mt-0.5">
                Full 75M exam sheet
              </p>
            </div>
          </div>

          {/* Flashcards */}
          <div
            onClick={() => onNavigate('flashcards')}
            className="bg-white border border-surface-border p-3 rounded-xl shadow-mobile-card hover:border-brand-400 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-surface-dark group-hover:text-brand-800">
                Flashcards
              </h4>
              <p className="text-[10px] text-surface-muted mt-0.5">
                Rapid 2M recall
              </p>
            </div>
          </div>

          {/* Past Papers */}
          <div
            onClick={() => onNavigate('pdf-analyzer')}
            className="bg-white border border-surface-border p-3 rounded-xl shadow-mobile-card hover:border-brand-400 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <FileSearch size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-surface-dark group-hover:text-brand-800">
                Past Papers
              </h4>
              <p className="text-[10px] text-surface-muted mt-0.5">
                Inspect KL papers
              </p>
            </div>
          </div>

          {/* Exam Planner */}
          <div
            onClick={() => onNavigate('planner')}
            className="bg-white border border-surface-border p-3 rounded-xl shadow-mobile-card hover:border-brand-400 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-surface-dark group-hover:text-brand-800">
                Study Planner
              </h4>
              <p className="text-[10px] text-surface-muted mt-0.5">
                Unit countdown
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Filter Pills */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-condensed uppercase tracking-wider font-bold text-surface-muted">
            Choose Department
          </span>
          <span className="text-[11px] text-surface-muted">
            {filteredSubjects.length} Subjects available
          </span>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept;
            return (
              <button
                key={dept}
                onClick={() => onSelectDepartment(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-800 text-white shadow-sm ring-1 ring-brand-800'
                    : 'bg-white text-surface-dark border border-surface-border hover:bg-surface-subtle'
                }`}
              >
                {dept === 'All' ? 'All Depts' : dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Subjects & Knowledge Base Catalog */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-serif font-bold text-surface-dark flex items-center space-x-2">
            <BookOpen size={16} className="text-brand-800" />
            <span>KL Knowledge Base Subjects</span>
          </h2>
          <button
            onClick={() => onNavigate('select-subject')}
            className="text-xs font-semibold text-brand-800 hover:underline flex items-center space-x-0.5"
          >
            <span>View All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredSubjects.slice(0, 4).map((subject) => (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="bg-white border border-surface-border rounded-xl p-3.5 shadow-mobile-card hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-surface-subtle text-surface-muted border border-surface-border">
                    {subject.code}
                  </span>
                  <span className="text-[10px] font-bold font-condensed uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-800">
                    {subject.department}
                  </span>
                </div>
                <h3 className="font-semibold text-surface-dark text-xs sm:text-sm group-hover:text-brand-800 transition-colors line-clamp-1">
                  {subject.name}
                </h3>
                <p className="text-[11px] text-surface-muted mt-1">
                  {subject.units?.length || 5} Course Units • {subject.questionCount || 4}+ Previous Exam Questions
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-surface-border/50 flex items-center justify-between text-xs font-medium text-brand-800">
                <span>Select & Generate</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Revision Notes */}
      {recentNotes.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-serif font-bold text-surface-dark flex items-center space-x-2">
              <Clock size={15} className="text-brand-800" />
              <span>Recent Revision Notes</span>
            </h2>
            <button
              onClick={() => onNavigate('save')}
              className="text-xs font-semibold text-brand-800 hover:underline"
            >
              See all ({recentNotes.length})
            </button>
          </div>

          <div className="space-y-2">
            {recentNotes.slice(0, 3).map((note, index) => (
              <div
                key={index}
                onClick={() => onOpenNote(note)}
                className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card hover:border-brand-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-800 flex items-center justify-center font-bold text-xs">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-surface-dark line-clamp-1">
                      {note.topic}
                    </h4>
                    <p className="text-[10px] text-surface-muted">
                      {note.subject} • {note.department}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-surface-muted" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluator Guarantee Card */}
      <div className="bg-surface-subtle border border-surface-border rounded-xl p-3.5 space-y-1.5">
        <div className="flex items-center space-x-2 text-brand-900 font-semibold text-xs">
          <Award size={16} className="text-brand-800" />
          <span>The KL Exam Format Guarantee</span>
        </div>
        <p className="text-[11px] text-surface-muted leading-relaxed">
          Every note generated by StudyMate AI strictly conforms to KL University marking rubrics: concise 2-mark definitions, 5-mark structured answers with flowcharts, and 10-mark full academic essays with keyword scoring density.
        </p>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Department, ScreenId, Subject, ExamNote } from '../types';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
  BookmarkCheck,
  Zap
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  savedNotes: ExamNote[];
  selectedDepartment: Department;
}

type Attempt = { id: string; subject: string; mode: 'quiz' | 'model'; score: number; total: number; percentage: number; completedAt: string };

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  subjects,
  savedNotes,
  selectedDepartment
}) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  useEffect(() => {
    const token = localStorage.getItem('studymate_token');
    if (!token) return;
    fetch('/api/quiz/attempts?limit=20', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setAttempts(Array.isArray(data) ? data : []))
      .catch(() => setAttempts([]));
  }, []);

  const totalSubjects = subjects.length;
  const savedCount = savedNotes.length;
  const reviewedCount = savedNotes.filter((n) => n.isReviewed).length;

  // Calculate readiness metric
  const averageScore = attempts.length ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
  const readinessPercent = attempts.length ? averageScore : null;

  const deptStats = Array.from(new Set(subjects.map((subject) => subject.department).filter(Boolean))).map((dept) => {
    const deptSubjs = subjects.filter((s) => s.department === dept);
    const deptSaved = savedNotes.filter((n) => n.department === dept);
    return {
      department: dept,
      subjectCount: deptSubjs.length,
      savedNotesCount: deptSaved.length,
      completionRate: Math.min(100, deptSaved.length * 25 + 10)
    };
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Dashboard Top Header */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[var(--accent)]">
          Study Progress
        </span>
        <h1 className="font-serif text-3xl font-medium text-[var(--foreground)] leading-tight">
          Student Dashboard
        </h1>
        <p className="text-xs text-[var(--muted-foreground)]">
          A private view of the work you have actually completed in StudyMate.
        </p>
      </div>

      {/* Hero Readiness Score Card */}
      <div className="bg-gradient-to-br from-[var(--accent)] to-[#60a5fa] text-white rounded-lg p-8 shadow-[var(--shadow-md)] relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#f2d0a5] flex items-center space-x-1.5">
              <Zap size={13} />
              <span>Your study progress</span>
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-bold text-white">
                {readinessPercent === null ? '—' : `${readinessPercent}%`}
              </span>
              <span className="text-xs text-[#ead6c0]">
                {readinessPercent === null ? 'No assessments yet' : readinessPercent > 70 ? 'Strong progress' : 'In progress'}
              </span>
            </div>
            <p className="text-[11px] text-[#f0e0cf] max-w-xs leading-relaxed">
              Based on {savedCount} saved notes, {reviewedCount} reviewed answers, and {attempts.length} recorded assessments.
            </p>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-[#e5bf93]/40 border-t-[#e5bf93] flex items-center justify-center font-mono font-bold text-sm bg-[#ffffff]/5">
            {readinessPercent}%
          </div>
        </div>

        {/* Quick Action Pills inside Hero */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
          <button
            onClick={() => onNavigate('select-subject')}
            className="flex-1 bg-[#ffffff] text-[#5a371f] py-2 px-3 rounded-xl text-xs font-bold hover:bg-[var(--muted)] transition-colors flex items-center justify-center space-x-1 shadow-sm"
          >
            <span>Generate New Notes</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => onNavigate('save')}
            className="flex-1 bg-[#ffffff]/15 text-white hover:bg-[#ffffff]/20 py-2 px-3 rounded-xl text-xs font-medium transition-colors text-center"
          >
            Review Saved ({savedCount})
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[var(--muted-foreground)] block font-sans uppercase tracking-wider">
            Total Subjects
          </span>
          <span className="text-lg font-mono font-bold text-[var(--foreground)]">
            {totalSubjects}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            From administrator data
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[var(--muted-foreground)] block font-sans uppercase tracking-wider">
            Saved Notes
          </span>
          <span className="text-lg font-mono font-bold text-[var(--accent)]">
            {savedCount}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] block">
            Offline Ready
          </span>
        </div>

        <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[var(--muted-foreground)] block font-sans uppercase tracking-wider">
            Exam Reviewed
          </span>
          <span className="text-lg font-mono font-bold text-emerald-700">
            {reviewedCount}
          </span>
          <span className="text-[10px] text-emerald-600 block">
            Verified
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-[var(--border)] bg-[#ffffff] p-3 text-center shadow-sm">
          <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Assessment Average</span>
          <span className="text-xl font-black text-[var(--accent)]">{attempts.length ? `${averageScore}%` : '—'}</span>
          <span className="block text-[10px] text-[var(--muted-foreground)]">{attempts.length ? `${attempts.length} attempts` : 'Take a quiz to start'}</span>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[#ffffff] p-3 text-center shadow-sm">
          <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Latest Test</span>
          <span className="text-xl font-black text-[var(--accent)]">{attempts[0] ? `${attempts[0].percentage}%` : '—'}</span>
          <span className="block truncate text-[10px] text-[var(--muted-foreground)]">{attempts[0]?.subject || 'No test recorded'}</span>
        </div>
      </div>

      {/* Department Readiness Progress Bars */}
      <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-[var(--foreground)] flex items-center space-x-1.5">
            <TrendingUp size={15} className="text-[var(--accent)]" />
            <span>Readiness by Department</span>
          </h3>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            Administrator-managed curriculum
          </span>
        </div>

        <div className="space-y-2.5">
          {deptStats.map((item) => (
            <div key={item.department} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--foreground)] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-800"></span>
                  <span>{item.department}</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                  {item.savedNotesCount} notes • {item.completionRate}%
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-[var(--border)]/40">
                <div
                  className="bg-brand-800 h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exam Format Marks Distribution */}
      <div className="bg-surface-subtle border border-[var(--border)] rounded-xl p-3.5 space-y-2">
        <h4 className="text-xs font-semibold text-[var(--foreground)] flex items-center space-x-1.5">
          <Award size={14} className="text-[var(--accent)]" />
          <span>Assessment activity</span>
        </h4>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-[#ffffff] p-2 rounded-lg border border-[var(--border)]/60">
            <span className="text-[9px] font-mono font-bold text-blue-700 block">Part A (10M)</span>
            <span className="text-[10px] text-[var(--foreground)] font-medium">Direct questions</span>
          </div>
          <div className="bg-[#ffffff] p-2 rounded-lg border border-[var(--border)]/60">
            <span className="text-[9px] font-mono font-bold text-purple-700 block">Part B (25M)</span>
            <span className="text-[10px] text-[var(--foreground)] font-medium">Structured questions</span>
          </div>
          <div className="bg-[#ffffff] p-2 rounded-lg border border-[var(--border)]/60">
            <span className="text-[9px] font-mono font-bold text-emerald-700 block">Part C (40M)</span>
            <span className="text-[10px] text-[var(--foreground)] font-medium">Long-answer questions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

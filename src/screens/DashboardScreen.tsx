import React, { useEffect, useState } from 'react';
import { StatCard, PageHeader, EditorialCard } from '../components/Editorial';
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
    const deptAttempts = attempts.filter((attempt) => deptSubjs.some((subject) => subject.name === attempt.subject));
    const deptAverage = deptAttempts.length
      ? Math.round(deptAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / deptAttempts.length)
      : null;
    return { department: dept, subjectCount: deptSubjs.length, attemptCount: deptAttempts.length, average: deptAverage };
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Dashboard Top Header */}
      <div className="space-y-1 pt-1">
        <PageHeader
          eyebrow="Study progress"
          title="Student Dashboard"
          description="A private view of the work you have actually completed in StudyMate."
        />
      </div>

      {/* Hero Readiness Score Card */}
      <EditorialCard className="border-t-2 border-t-[var(--accent)] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <span className="small-caps flex items-center gap-1.5 text-[var(--accent)]">
              <Zap size={13} />
              <span>Your study progress</span>
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-medium text-[var(--foreground)]">
                {readinessPercent === null ? '—' : `${readinessPercent}%`}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {readinessPercent === null ? 'No assessments yet' : readinessPercent > 70 ? 'Strong progress' : 'In progress'}
              </span>
            </div>
            <p className="max-w-xs text-[11px] leading-relaxed text-[var(--muted-foreground)]">
              Based on {savedCount} saved notes, {reviewedCount} reviewed answers, and {attempts.length} recorded assessments.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--accent)] font-mono text-sm font-medium text-[var(--accent)]">
            {readinessPercent}%
          </div>
        </div>

        {/* Quick Action Pills inside Hero */}
        <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-4 sm:flex-row">
          <button
            onClick={() => onNavigate('select-subject')}
            className="editorial-primary flex-1 px-3 py-2 text-xs"
          >
            <span>Generate New Notes</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => onNavigate('save')}
            className="editorial-secondary flex-1 px-3 py-2 text-xs text-center"
          >
            Review Saved ({savedCount})
          </button>
        </div>
      </EditorialCard>

      {/* Grid of Key Metrics */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Published subjects" value={totalSubjects} detail="Administrator-published" />
        <StatCard label="Saved notes" value={savedCount} detail="Account-scoped" />
        <StatCard label="Reviewed notes" value={reviewedCount} detail="Marked reviewed by you" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <EditorialCard className="p-4 text-center">
          <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Assessment Average</span>
          <span className="text-xl font-black text-[var(--accent)]">{attempts.length ? `${averageScore}%` : '—'}</span>
          <span className="block text-[10px] text-[var(--muted-foreground)]">{attempts.length ? `${attempts.length} attempts` : 'Take a quiz to start'}</span>
        </EditorialCard>
        <EditorialCard className="p-4 text-center">
          <span className="block text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">Latest test</span>
          <span className="text-xl font-black text-[var(--accent)]">{attempts[0] ? `${attempts[0].percentage}%` : '—'}</span>
          <span className="block truncate text-[10px] text-[var(--muted-foreground)]">{attempts[0]?.subject || 'No test recorded'}</span>
        </EditorialCard>
      </div>

      {/* Department Readiness Progress Bars */}
      <EditorialCard className="p-4 space-y-3">
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
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                  <span>{item.department}</span>
                </span>
                <span className="font-mono text-[11px] text-[var(--muted-foreground)]">
                  {item.attemptCount} attempts • {item.average === null ? '—' : `${item.average}%`}
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-[var(--border)]/40">
                <div
                  className="bg-brand-800 h-full rounded-full transition-all duration-300"
                  style={{ width: `${item.average ?? 0}%` }}
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

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
  const readinessPercent = attempts.length
    ? Math.min(100, Math.round(averageScore * 0.65 + Math.min(100, savedCount * 12 + reviewedCount * 8 + 10) * 0.35))
    : Math.min(100, Math.round((savedCount * 12 + reviewedCount * 8) + 20));

  const deptStats = ['CSE', 'AIDS', 'ECE', 'EEE', 'Food Technology'].map((dept) => {
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
        <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#7c4f2c]">
          Analytics & Readiness
        </span>
        <h1 className="text-xl font-sans font-bold text-[#3b2b23] leading-tight">
          KL Exam Readiness Dashboard
        </h1>
        <p className="text-xs text-[#806f61]">
          Track syllabus coverage, revision streaks, and exam preparation metrics.
        </p>
      </div>

      {/* Hero Readiness Score Card */}
      <div className="bg-gradient-to-br from-[#7c4f2c] to-[#4a3326] text-white rounded-2xl p-5 shadow-elevated relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#f2d0a5] flex items-center space-x-1.5">
              <Zap size={13} />
              <span>Overall KL Exam Preparedness</span>
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-bold text-white">
                {readinessPercent}%
              </span>
              <span className="text-xs text-[#ead6c0]">
                {readinessPercent > 70 ? 'Exam Ready' : 'In Progress'}
              </span>
            </div>
            <p className="text-[11px] text-[#f0e0cf] max-w-xs leading-relaxed">
              Based on {savedCount} saved notes, {reviewedCount} reviewed answers, and {attempts.length} recorded assessments.
            </p>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-[#e5bf93]/40 border-t-[#e5bf93] flex items-center justify-center font-mono font-bold text-sm bg-[#fffaf4]/5">
            {readinessPercent}%
          </div>
        </div>

        {/* Quick Action Pills inside Hero */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
          <button
            onClick={() => onNavigate('select-subject')}
            className="flex-1 bg-[#fffaf4] text-[#5a371f] py-2 px-3 rounded-xl text-xs font-bold hover:bg-[#f4eadf] transition-colors flex items-center justify-center space-x-1 shadow-sm"
          >
            <span>Generate New Notes</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => onNavigate('save')}
            className="flex-1 bg-[#fffaf4]/15 text-white hover:bg-[#fffaf4]/20 py-2 px-3 rounded-xl text-xs font-medium transition-colors text-center"
          >
            Review Saved ({savedCount})
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#806f61] block font-sans uppercase tracking-wider">
            Total Subjects
          </span>
          <span className="text-lg font-mono font-bold text-[#3b2b23]">
            {totalSubjects}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            5 Depts Active
          </span>
        </div>

        <div className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#806f61] block font-sans uppercase tracking-wider">
            Saved Notes
          </span>
          <span className="text-lg font-mono font-bold text-[#7c4f2c]">
            {savedCount}
          </span>
          <span className="text-[10px] text-[#806f61] block">
            Offline Ready
          </span>
        </div>

        <div className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#806f61] block font-sans uppercase tracking-wider">
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
        <div className="rounded-xl border border-[#e3d6cb] bg-[#fffaf4] p-3 text-center shadow-sm">
          <span className="block text-[10px] uppercase tracking-wider text-[#806f61]">Assessment Average</span>
          <span className="text-xl font-black text-[#7c4f2c]">{attempts.length ? `${averageScore}%` : '—'}</span>
          <span className="block text-[10px] text-[#806f61]">{attempts.length ? `${attempts.length} attempts` : 'Take a quiz to start'}</span>
        </div>
        <div className="rounded-xl border border-[#e3d6cb] bg-[#fffaf4] p-3 text-center shadow-sm">
          <span className="block text-[10px] uppercase tracking-wider text-[#806f61]">Latest Test</span>
          <span className="text-xl font-black text-[#7c4f2c]">{attempts[0] ? `${attempts[0].percentage}%` : '—'}</span>
          <span className="block truncate text-[10px] text-[#806f61]">{attempts[0]?.subject || 'No test recorded'}</span>
        </div>
      </div>

      {/* Department Readiness Progress Bars */}
      <div className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-[#3b2b23] flex items-center space-x-1.5">
            <TrendingUp size={15} className="text-[#7c4f2c]" />
            <span>Readiness by Department</span>
          </h3>
          <span className="text-[10px] text-[#806f61]">
            KL Engineering
          </span>
        </div>

        <div className="space-y-2.5">
          {deptStats.map((item) => (
            <div key={item.department} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#3b2b23] flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-800"></span>
                  <span>{item.department}</span>
                </span>
                <span className="font-mono text-[11px] text-[#806f61]">
                  {item.savedNotesCount} notes • {item.completionRate}%
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-[#e3d6cb]/40">
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
      <div className="bg-surface-subtle border border-[#e3d6cb] rounded-xl p-3.5 space-y-2">
        <h4 className="text-xs font-semibold text-[#3b2b23] flex items-center space-x-1.5">
          <Award size={14} className="text-[#7c4f2c]" />
          <span>KL Exam Scheme Distribution (100 Marks Target)</span>
        </h4>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-[#fffaf4] p-2 rounded-lg border border-[#e3d6cb]/60">
            <span className="text-[9px] font-mono font-bold text-blue-700 block">Part A (10M)</span>
            <span className="text-[10px] text-[#3b2b23] font-medium">5 × 2M Direct</span>
          </div>
          <div className="bg-[#fffaf4] p-2 rounded-lg border border-[#e3d6cb]/60">
            <span className="text-[9px] font-mono font-bold text-purple-700 block">Part B (25M)</span>
            <span className="text-[10px] text-[#3b2b23] font-medium">5 × 5M Flowcharts</span>
          </div>
          <div className="bg-[#fffaf4] p-2 rounded-lg border border-[#e3d6cb]/60">
            <span className="text-[9px] font-mono font-bold text-emerald-700 block">Part C (40M)</span>
            <span className="text-[10px] text-[#3b2b23] font-medium">4 × 10M Essays</span>
          </div>
        </div>
      </div>
    </div>
  );
};

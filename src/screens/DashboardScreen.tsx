import React from 'react';
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

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  subjects,
  savedNotes,
  selectedDepartment
}) => {
  const totalSubjects = subjects.length;
  const savedCount = savedNotes.length;
  const reviewedCount = savedNotes.filter((n) => n.isReviewed).length;

  // Calculate readiness metric
  const readinessPercent = Math.min(100, Math.round((savedCount * 12 + reviewedCount * 8) + 20));

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
        <span className="text-[10px] font-condensed font-bold tracking-wider uppercase text-brand-800">
          Analytics & Readiness
        </span>
        <h1 className="text-xl font-serif font-bold text-surface-dark leading-tight">
          KL Exam Readiness Dashboard
        </h1>
        <p className="text-xs text-surface-muted">
          Track syllabus coverage, revision streaks, and exam preparation metrics.
        </p>
      </div>

      {/* Hero Readiness Score Card */}
      <div className="bg-gradient-to-br from-brand-900 to-stone-900 text-white rounded-2xl p-5 shadow-elevated relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-condensed font-bold uppercase tracking-wider text-amber-300 flex items-center space-x-1.5">
              <Zap size={13} />
              <span>Overall KL Exam Preparedness</span>
            </span>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-mono font-bold text-white">
                {readinessPercent}%
              </span>
              <span className="text-xs text-brand-200">
                {readinessPercent > 70 ? 'Exam Ready' : 'In Progress'}
              </span>
            </div>
            <p className="text-[11px] text-brand-100 max-w-xs leading-relaxed">
              Based on {savedCount} saved KL exam notes, {reviewedCount} reviewed answers, and question bank coverage.
            </p>
          </div>

          <div className="w-16 h-16 rounded-full border-4 border-amber-400/40 border-t-amber-400 flex items-center justify-center font-mono font-bold text-sm bg-white/5">
            {readinessPercent}%
          </div>
        </div>

        {/* Quick Action Pills inside Hero */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2">
          <button
            onClick={() => onNavigate('select-subject')}
            className="flex-1 bg-white text-brand-950 py-2 px-3 rounded-xl text-xs font-bold hover:bg-brand-50 transition-colors flex items-center justify-center space-x-1 shadow-sm"
          >
            <span>Generate New Notes</span>
            <ArrowRight size={13} />
          </button>
          <button
            onClick={() => onNavigate('save')}
            className="flex-1 bg-white/15 text-white hover:bg-white/20 py-2 px-3 rounded-xl text-xs font-medium transition-colors text-center"
          >
            Review Saved ({savedCount})
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
            Total Subjects
          </span>
          <span className="text-lg font-mono font-bold text-surface-dark">
            {totalSubjects}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium block">
            5 Depts Active
          </span>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
            Saved Notes
          </span>
          <span className="text-lg font-mono font-bold text-brand-800">
            {savedCount}
          </span>
          <span className="text-[10px] text-surface-muted block">
            Offline Ready
          </span>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
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

      {/* Department Readiness Progress Bars */}
      <div className="bg-white border border-surface-border rounded-xl p-4 shadow-mobile-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-serif font-bold text-surface-dark flex items-center space-x-1.5">
            <TrendingUp size={15} className="text-brand-800" />
            <span>Readiness by Department</span>
          </h3>
          <span className="text-[10px] text-surface-muted">
            KL Engineering
          </span>
        </div>

        <div className="space-y-2.5">
          {deptStats.map((item) => (
            <div key={item.department} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-surface-dark flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-800"></span>
                  <span>{item.department}</span>
                </span>
                <span className="font-mono text-[11px] text-surface-muted">
                  {item.savedNotesCount} notes • {item.completionRate}%
                </span>
              </div>
              <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-surface-border/40">
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
      <div className="bg-surface-subtle border border-surface-border rounded-xl p-3.5 space-y-2">
        <h4 className="text-xs font-semibold text-surface-dark flex items-center space-x-1.5">
          <Award size={14} className="text-brand-800" />
          <span>KL Exam Scheme Distribution (100 Marks Target)</span>
        </h4>
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="bg-white p-2 rounded-lg border border-surface-border/60">
            <span className="text-[9px] font-mono font-bold text-blue-700 block">Part A (10M)</span>
            <span className="text-[10px] text-surface-dark font-medium">5 × 2M Direct</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-surface-border/60">
            <span className="text-[9px] font-mono font-bold text-purple-700 block">Part B (25M)</span>
            <span className="text-[10px] text-surface-dark font-medium">5 × 5M Flowcharts</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-surface-border/60">
            <span className="text-[9px] font-mono font-bold text-emerald-700 block">Part C (40M)</span>
            <span className="text-[10px] text-surface-dark font-medium">4 × 10M Essays</span>
          </div>
        </div>
      </div>
    </div>
  );
};

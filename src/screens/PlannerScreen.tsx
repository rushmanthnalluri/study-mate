import React, { useState } from 'react';
import { Department, ScreenId, Subject } from '../types';
import {
  Calendar,
  Clock,
  CheckSquare,
  Square,
  ArrowLeft,
  Sparkles,
  Award,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

interface PlannerScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  onSelectSubject: (subject: Subject) => void;
}

interface PlanItem {
  id: string;
  subjectName: string;
  unitTitle: string;
  targetDate: string;
  completed: boolean;
  priority: 'High' | 'Medium' | 'Low';
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  onNavigate,
  subjects,
  onSelectSubject
}) => {
  const [examDate, setExamDate] = useState('2026-11-20');
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: 'p-1',
      subjectName: 'Operating Systems',
      unitTitle: 'Unit III: Banker’s Algorithm & Deadlock Avoidance',
      targetDate: 'Today',
      completed: true,
      priority: 'High'
    },
    {
      id: 'p-2',
      subjectName: 'Machine Learning',
      unitTitle: 'Unit IV: Support Vector Machines & Kernel Trick',
      targetDate: 'Tomorrow',
      completed: false,
      priority: 'High'
    },
    {
      id: 'p-3',
      subjectName: 'Digital Signal Processing',
      unitTitle: 'Unit II: Radix-2 DIT FFT Butterfly Diagram',
      targetDate: 'In 2 days',
      completed: false,
      priority: 'High'
    },
    {
      id: 'p-4',
      subjectName: 'Control Systems',
      unitTitle: 'Unit III: Root Locus Construction 8 Rules',
      targetDate: 'This Friday',
      completed: false,
      priority: 'Medium'
    },
    {
      id: 'p-5',
      subjectName: 'Food Microbiology',
      unitTitle: 'Unit IV: Thermal Death Kinetics (D, z, F values)',
      targetDate: 'This Weekend',
      completed: false,
      priority: 'Medium'
    }
  ]);

  const togglePlan = (id: string) => {
    setPlans(
      plans.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  // Calculate days remaining
  const calculateDaysLeft = () => {
    const target = new Date(examDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const daysLeft = calculateDaysLeft();
  const completedCount = plans.filter((p) => p.completed).length;

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          type="button"
          aria-label="Back to home"
          onClick={() => onNavigate('home')}
          className="p-1.5 rounded-lg border border-[var(--border)] bg-[#ffffff] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[var(--accent)]">
            Study Schedule
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] leading-tight">
            KL Exam Planner
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Structure your revision schedule unit-by-unit according to KL semester examination timelines.
      </p>

      {/* Countdown Hero Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-brand-950 text-white rounded-2xl p-4 shadow-elevated flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-wider text-amber-300 font-bold flex items-center space-x-1">
            <Clock size={12} />
            <span>KL End-Semester Examinations</span>
          </span>
          <h2 className="text-2xl font-mono font-bold text-white">
            {daysLeft} <span className="text-sm font-sans font-normal text-stone-300">Days Left</span>
          </h2>
          <p className="text-[11px] text-stone-300">
            Target Exam Date: {examDate}
          </p>
        </div>

        <div className="text-right">
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="text-xs font-mono bg-[#ffffff]/10 text-white border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Daily Target Recommendation */}
      <div className="bg-[#fbf3e9] border border-[#e2c8ad] rounded-xl p-3.5 flex items-start space-x-3">
        <AlertCircle size={18} className="text-[#7b5432] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-amber-950">
            Recommended Daily Study Target
          </h3>
          <p className="text-[11px] text-[#714628]/90 leading-relaxed">
            To comfortably cover 5 units before exams, generate and revise <strong>2 10-mark essays</strong>, <strong>3 5-mark short notes</strong>, and <strong>6 2-mark flashcards</strong> daily.
          </p>
        </div>
      </div>

      {/* Revision Milestones Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-[var(--muted-foreground)] flex items-center space-x-1.5">
            <Calendar size={13} className="text-[var(--accent)]" />
            <span>Unit Revision Milestones</span>
          </h3>
          <span className="text-[10px] font-mono font-bold text-[var(--muted-foreground)]">
            {completedCount} / {plans.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => togglePlan(plan.id)}
              className={`bg-[#ffffff] border rounded-xl p-3 shadow-sm transition-all cursor-pointer flex items-center justify-between ${
                plan.completed
                  ? 'border-emerald-200 bg-emerald-50/30'
                  : 'border-[var(--border)] hover:border-brand-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  className={`text-lg transition-colors ${
                    plan.completed ? 'text-emerald-700' : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  {plan.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-surface-subtle text-[var(--muted-foreground)] font-mono">
                      {plan.subjectName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        plan.priority === 'High'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-[#f0e0cf] text-[#7b5432]'
                      }`}
                    >
                      {plan.priority}
                    </span>
                  </div>
                  <h4
                    className={`text-xs font-semibold mt-0.5 ${
                      plan.completed
                        ? 'line-through text-[var(--muted-foreground)]'
                        : 'text-[var(--foreground)]'
                    }`}
                  >
                    {plan.unitTitle}
                  </h4>
                </div>
              </div>

              <span className="text-[10px] text-[var(--muted-foreground)] font-mono whitespace-nowrap pl-2">
                {plan.targetDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

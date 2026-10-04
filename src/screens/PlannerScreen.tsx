import React, { useMemo, useState } from 'react';
import { ScreenId, Subject } from '../types';
import { Calendar, Clock, CheckSquare, Square, ArrowLeft, ChevronRight } from 'lucide-react';
import { EditorialCard, EmptyState, PageHeader, EditorialButton, SectionLabel } from '../components/Editorial';

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
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({ onNavigate, subjects, onSelectSubject }) => {
  const [examDate, setExamDate] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId) || null;

  const plans = useMemo<PlanItem[]>(() => {
    if (!selectedSubject || !examDate) return [];
    const units = Array.isArray(selectedSubject.units) ? selectedSubject.units : [];
    if (!units.length) return [];

    const exam = new Date(examDate + 'T12:00:00');
    const start = new Date();
    start.setHours(12, 0, 0, 0);
    const totalDays = Math.max(1, Math.ceil((exam.getTime() - start.getTime()) / 86400000));
    const spacing = Math.max(1, Math.floor(totalDays / units.length));

    return units.map((unit, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + Math.min(totalDays, spacing * (index + 1)));
      return {
        id: selectedSubject.id + ':' + index,
        subjectName: selectedSubject.name,
        unitTitle: unit,
        targetDate: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
        completed: Boolean(completed[selectedSubject.id + ':' + index])
      };
    });
  }, [selectedSubject, examDate, completed]);

  const daysLeft = examDate
    ? Math.max(0, Math.ceil((new Date(examDate + 'T12:00:00').getTime() - Date.now()) / 86400000))
    : null;

  const completedCount = plans.filter((plan) => plan.completed).length;

  return (
    <div className="editorial-page-wide space-y-10 animate-fade-in">
      <PageHeader
        eyebrow="Study planner"
        title="Build a revision plan"
        description="Choose a published subject and an exam date. StudyMate derives milestones from the subject units instead of inventing curriculum content."
        actions={
          <EditorialButton variant="secondary" type="button" onClick={() => onNavigate('home')}>
            <ArrowLeft size={15} /> Home
          </EditorialButton>
        }
      />

      <EditorialCard className="p-5 sm:p-6">
        <SectionLabel>Plan setup</SectionLabel>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="space-y-2">
            <span className="small-caps text-[var(--muted-foreground)]">Published subject</span>
            <select
              value={selectedSubjectId}
              onChange={(event) => {
                setSelectedSubjectId(event.target.value);
                setCompleted({});
              }}
              className="editorial-input w-full border bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)]"
            >
              <option value="">Choose a subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name} · {subject.department}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="small-caps text-[var(--muted-foreground)]">Exam date</span>
            <input
              type="date"
              value={examDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setExamDate(event.target.value)}
              className="editorial-input w-full border bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--foreground)]"
            />
          </label>

          <EditorialButton
            type="button"
            disabled={!selectedSubject || !examDate}
            onClick={() => selectedSubject && onSelectSubject(selectedSubject)}
          >
            Open subject <ChevronRight size={15} />
          </EditorialButton>
        </div>
      </EditorialCard>

      {selectedSubject && examDate && plans.length > 0 ? (
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="small-caps text-[var(--accent)]">{selectedSubject.code}</p>
              <h2 className="mt-1 font-serif text-3xl text-[var(--foreground)]">{selectedSubject.name}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{selectedSubject.units?.length || 0} published units · {daysLeft} days left</p>
            </div>
            <span className="font-mono text-xs text-[var(--muted-foreground)]">{completedCount} / {plans.length} completed</span>
          </div>

          <div className="space-y-3">
            {plans.map((plan, index) => (
              <EditorialCard key={plan.id} className={plan.completed ? 'border-[var(--accent)] bg-[var(--muted)]' : ''}>
                <button
                  type="button"
                  onClick={() => setCompleted((current) => ({ ...current, [plan.id]: !current[plan.id] }))}
                  className="flex min-h-16 w-full items-center gap-4 p-4 text-left"
                  aria-pressed={plan.completed}
                >
                  {plan.completed
                    ? <CheckSquare size={19} className="shrink-0 text-[var(--accent)]" />
                    : <Square size={19} className="shrink-0 text-[var(--muted-foreground)]" />}
                  <span className="min-w-0 flex-1">
                    <span className="small-caps text-[var(--muted-foreground)]">Unit {index + 1}</span>
                    <span className={plan.completed ? 'mt-1 block text-sm text-[var(--muted-foreground)] line-through' : 'mt-1 block text-sm font-medium text-[var(--foreground)]'}>
                      {plan.unitTitle}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                    <Clock size={12} /> {plan.targetDate}
                  </span>
                </button>
              </EditorialCard>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={<Calendar size={30} />}
          title="No revision plan yet"
          description="Select an administrator-published subject and exam date. The planner will distribute that subject's real units across the available days."
        />
      )}
    </div>
  );
};

import React from 'react';
import { Department, Subject, ScreenId, ExamNote } from '../types';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Award,
  ChevronRight,
  Sparkles,
  FileText,
  Layers,
  Calendar,
  FileSearch,
  FileSpreadsheet,
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
  const departments: Department[] = ['All', ...Array.from(new Set(subjects.map(subject => subject.department))).filter(Boolean)] as Department[];
  const filteredSubjects = subjects.filter(subject =>
    selectedDepartment === 'All' || subject.department === selectedDepartment
  );

  const features = [
    { id: 'mock-exam' as ScreenId, title: 'Mock papers', text: 'Build a complete exam sheet', icon: FileSpreadsheet },
    { id: 'flashcards' as ScreenId, title: 'Flashcards', text: 'Practice active recall', icon: Layers },
    { id: 'pdf-analyzer' as ScreenId, title: 'Past papers', text: 'Extract useful patterns', icon: FileSearch },
    { id: 'planner' as ScreenId, title: 'Study planner', text: 'Organize your revision', icon: Calendar },
    { id: 'quiz' as ScreenId, title: 'Quiz & model test', text: 'Test your understanding', icon: Award },
    { id: 'studio' as ScreenId, title: 'Study studio', text: 'Turn material into study tools', icon: Bot }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-14 pb-32 pt-8 sm:pt-12">
      <section className="relative px-1 sm:px-4">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[var(--accent)]/[0.035] blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <div className="editorial-section-label">
            <span>StudyMate</span>
          </div>
          <h1 className="text-[2.6rem] font-normal leading-[1.1] tracking-[-0.02em] text-[var(--foreground)] sm:text-6xl">
            Study with clarity.
            <span className="block text-[var(--accent)]">Write with structure.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
            A private academic workspace for notes, practice, revision and AI tutoring — grounded in the subjects and resources published for your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => onNavigate('select-subject')} className="editorial-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold tracking-[0.02em]">
              Choose a subject <ArrowRight size={16} />
            </button>
            <button type="button" onClick={() => onNavigate('chatbot')} className="editorial-secondary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
              <Bot size={16} /> Ask the AI tutor
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="editorial-section-label"><span>Workspace</span></div>
        <div className="grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ id, title, text, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className="group min-h-40 bg-white p-6 text-left transition-colors duration-200 hover:bg-[var(--muted)]"
            >
              <Icon size={20} strokeWidth={1.5} className="text-[var(--accent)]" />
              <h2 className="mt-5 font-serif text-xl font-medium text-[var(--foreground)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{text}</p>
              <span className="mt-5 inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent)]">
                Open <ChevronRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="editorial-section-label"><span>Published subjects</span></div>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-[var(--foreground)]">Your academic library</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Only administrator-published subjects appear here.
            </p>
          </div>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)] sm:block">
            {filteredSubjects.length} {filteredSubjects.length === 1 ? 'subject' : 'subjects'}
          </span>
        </div>

        {departments.length > 1 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {departments.map(dept => {
              const active = selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => onSelectDepartment(dept)}
                  className={`min-h-11 whitespace-nowrap border px-4 py-2 text-xs font-medium tracking-[0.04em] transition-colors ${
                    active
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border)] bg-white text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {dept === 'All' ? 'All departments' : dept}
                </button>
              );
            })}
          </div>
        )}

        {filteredSubjects.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
            <BookOpen size={25} strokeWidth={1.4} className="mx-auto text-[var(--accent)]" />
            <h3 className="mt-5 font-serif text-2xl text-[var(--foreground)]">The library is waiting for a publication.</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
              No administrator-managed subjects are currently published for this selection.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {filteredSubjects.slice(0, 6).map(subject => (
              <button
                key={subject.id}
                type="button"
                onClick={() => onSelectSubject(subject)}
                className="editorial-card editorial-card-accent group p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    {subject.code}
                  </span>
                  <span className="small-caps text-[9px] text-[var(--accent)]">{subject.department}</span>
                </div>
                <h3 className="mt-5 font-serif text-2xl text-[var(--foreground)] group-hover:text-[var(--accent)]">
                  {subject.name}
                </h3>
                {subject.description && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--muted-foreground)]">{subject.description}</p>
                )}
                <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--muted-foreground)]">
                    {subject.units?.length || 0} units · {subject.questionCount || 0} questions
                  </span>
                  <ArrowRight size={15} className="text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {recentNotes.length > 0 && (
        <section>
          <div className="editorial-section-label"><span>Recent revision</span></div>
          <div className="editorial-card divide-y divide-[var(--border)] overflow-hidden">
            {recentNotes.slice(0, 3).map((note, index) => (
              <button
                key={note.id || index}
                type="button"
                onClick={() => onOpenNote(note)}
                className="flex min-h-16 w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--muted)]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <FileText size={17} strokeWidth={1.5} className="shrink-0 text-[var(--accent)]" />
                  <span className="min-w-0">
                    <span className="block truncate font-serif text-base text-[var(--foreground)]">{note.topic}</span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--muted-foreground)]">{note.subject} · {note.department}</span>
                  </span>
                </span>
                <ChevronRight size={15} className="shrink-0 text-[var(--accent)]" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-[var(--border)] pt-6">
        <div className="flex items-start gap-4">
          <Sparkles size={18} strokeWidth={1.5} className="mt-1 text-[var(--accent)]" />
          <div>
            <p className="small-caps text-[var(--accent)]">A quieter interface</p>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]">
              StudyMate keeps the interface intentionally restrained: content first, generous space, clear rules and one warm accent.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

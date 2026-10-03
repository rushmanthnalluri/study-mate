import React, { useState } from 'react';
import { Department, Subject, ScreenId } from '../types';
import { Search, BookOpen, ChevronRight, Layers, ArrowLeft } from 'lucide-react';

interface SelectSubjectScreenProps {
  subjects: Subject[];
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onSelectSubject: (subject: Subject) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SelectSubjectScreen: React.FC<SelectSubjectScreenProps> = ({
  subjects,
  selectedDepartment,
  onSelectDepartment,
  onSelectSubject,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const departments: Department[] = ['All', ...Array.from(new Set(subjects.map(subject => subject.department))).filter(Boolean)] as Department[];

  const filteredSubjects = subjects.filter(subject => {
    const matchesDept = selectedDepartment === 'All' || subject.department === selectedDepartment;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      subject.name.toLowerCase().includes(query) ||
      subject.code.toLowerCase().includes(query) ||
      subject.department.toLowerCase().includes(query);
    return matchesDept && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-32 pt-8">
      <header className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="Back to home"
          className="editorial-secondary flex h-11 w-11 shrink-0 items-center justify-center"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <p className="small-caps text-[var(--accent)]">Library</p>
          <h1 className="mt-2 text-4xl font-normal text-[var(--foreground)]">Choose a subject</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
            This catalog contains only subjects published by an administrator. Units, topics and resources are read from the StudyMate database.
          </p>
        </div>
      </header>

      <div className="editorial-rule" />

      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <span className="small-caps mb-2 block text-[var(--muted-foreground)]">Search</span>
          <span className="relative block">
            <Search size={16} strokeWidth={1.6} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Subject name, code or department"
              className="h-12 w-full border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/70 transition-colors focus:border-[var(--accent)]"
            />
          </span>
        </label>

        {departments.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {departments.map(dept => {
              const active = selectedDepartment === dept;
              return (
                <button
                  key={dept}
                  type="button"
                  onClick={() => onSelectDepartment(dept)}
                  className={`min-h-11 whitespace-nowrap border px-4 text-xs font-medium tracking-[0.04em] transition-colors ${
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
      </div>

      <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
        <h2 className="font-serif text-2xl text-[var(--foreground)]">Published subjects</h2>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
          {filteredSubjects.length} {filteredSubjects.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {filteredSubjects.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
          <BookOpen size={26} strokeWidth={1.4} className="mx-auto text-[var(--accent)]" />
          <h3 className="mt-5 font-serif text-2xl text-[var(--foreground)]">No published subjects</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            An administrator has not published a subject matching this selection.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredSubjects.map(subject => (
            <button
              key={subject.id}
              type="button"
              onClick={() => onSelectSubject(subject)}
              className="editorial-card editorial-card-accent group p-6 text-left"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{subject.code}</p>
                  <h3 className="mt-4 font-serif text-2xl text-[var(--foreground)] group-hover:text-[var(--accent)]">{subject.name}</h3>
                </div>
                <ChevronRight size={18} strokeWidth={1.5} className="shrink-0 text-[var(--accent)] transition-transform duration-200 group-hover:translate-x-1" />
              </div>

              {subject.description && (
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{subject.description}</p>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div>
                  <span className="small-caps text-[var(--muted-foreground)]">Department</span>
                  <p className="mt-1 text-sm text-[var(--foreground)]">{subject.department}</p>
                </div>
                <div>
                  <span className="small-caps text-[var(--muted-foreground)]">Course structure</span>
                  <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[var(--foreground)]">
                    <Layers size={14} className="text-[var(--accent)]" />
                    {subject.units?.length || 0} units
                  </p>
                </div>
              </div>

              {subject.topics?.length ? (
                <p className="mt-4 truncate text-xs text-[var(--muted-foreground)]">
                  Topics: {subject.topics.slice(0, 3).join(' · ')}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

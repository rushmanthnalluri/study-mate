import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Printer } from 'lucide-react';
import { Department, ScreenId, Subject } from '../types';

interface MockExamScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  selectedDepartment: Department;
  onOpenGeneratedNote: (topic: string, subjectName: string, dept: Department) => void;
}

export const MockExamScreen: React.FC<MockExamScreenProps> = ({
  onNavigate,
  subjects,
  selectedDepartment,
  onOpenGeneratedNote
}) => {
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [selectedSubjId, setSelectedSubjId] = useState(subjects[0]?.id || '');

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(subjects.map(subject => subject.department).filter(Boolean)))],
    [subjects]
  );

  const filteredSubjects = useMemo(
    () => subjects.filter(subject => deptFilter === 'All' || subject.department === deptFilter),
    [subjects, deptFilter]
  );

  const activeSubject =
    subjects.find(subject => subject.id === selectedSubjId && (deptFilter === 'All' || subject.department === deptFilter)) ||
    filteredSubjects[0] ||
    subjects[0];

  const questions = useMemo(
    () => (activeSubject?.questionBank || []).filter(question =>
      question &&
      typeof question.question === 'string' &&
      question.question.trim() &&
      [2, 5, 10].includes(Number(question.marks))
    ),
    [activeSubject]
  );

  const grouped = useMemo(
    () => ({
      2: questions.filter(question => Number(question.marks) === 2),
      5: questions.filter(question => Number(question.marks) === 5),
      10: questions.filter(question => Number(question.marks) === 10)
    }),
    [questions]
  );

  const handleDepartmentChange = (department: Department) => {
    setDeptFilter(department);
    const next = subjects.find(subject =>
      (department === 'All' || subject.department === department) &&
      subject.id
    );
    if (next) setSelectedSubjId(next.id);
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6 pb-28 print:p-0">
      <header className="flex items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            aria-label="Back to home"
            className="editorial-secondary flex h-11 w-11 items-center justify-center"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <p className="small-caps text-[var(--accent)]">Assessment library</p>
            <h1 className="mt-1 font-serif text-2xl text-[var(--foreground)]">Published mock paper</h1>
          </div>
        </div>
        <button type="button" onClick={handlePrint} className="editorial-secondary inline-flex min-h-11 items-center gap-2 px-4 text-xs font-semibold">
          <Printer size={15} /> Print / PDF
        </button>
      </header>

      <section className="editorial-card p-5 sm:p-6 print:border-b print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="small-caps text-[var(--muted-foreground)]">Administrator-published question bank</p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--foreground)]">
              {activeSubject?.name || 'No subject selected'}
            </h2>
            {activeSubject && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {activeSubject.code} · {activeSubject.department}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            {departments.map(department => (
              <button
                key={department}
                type="button"
                onClick={() => handleDepartmentChange(department as Department)}
                className={deptFilter === department ? 'editorial-primary min-h-11 px-3 text-xs' : 'editorial-secondary min-h-11 px-3 text-xs'}
              >
                {department === 'All' ? 'All' : department}
              </button>
            ))}
          </div>
        </div>

        {filteredSubjects.length > 0 && (
          <label className="mt-5 block max-w-xl print:hidden">
            <span className="small-caps mb-2 block text-[var(--muted-foreground)]">Subject</span>
            <select
              value={activeSubject?.id || ''}
              onChange={event => setSelectedSubjId(event.target.value)}
              className="editorial-input w-full"
            >
              {filteredSubjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} · {subject.code}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>

      {!activeSubject ? (
        <section className="editorial-card p-10 text-center">
          <BookOpen size={28} className="mx-auto text-[var(--accent)]" />
          <h2 className="mt-4 font-serif text-2xl text-[var(--foreground)]">No published subjects</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            An administrator must publish a subject before an assessment paper can be created.
          </p>
        </section>
      ) : questions.length === 0 ? (
        <section className="editorial-card p-10 text-center">
          <BookOpen size={28} className="mx-auto text-[var(--accent)]" />
          <h2 className="mt-4 font-serif text-2xl text-[var(--foreground)]">No mock-paper questions published</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
            StudyMate no longer fabricates exam questions, marks, regulations, CO mappings or paper metadata. Ask an administrator to publish a question bank for this subject.
          </p>
        </section>
      ) : (
        <article className="editorial-card overflow-hidden print:border-none print:shadow-none">
          <div className="border-b border-[var(--border)] p-6 text-center">
            <p className="small-caps text-[var(--muted-foreground)]">{activeSubject.department}</p>
            <h2 className="mt-2 font-serif text-2xl text-[var(--foreground)]">{activeSubject.name}</h2>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              {activeSubject.code} · {questions.length} published questions
            </p>
          </div>

          <div className="space-y-8 p-5 sm:p-8">
            {([2, 5, 10] as const).map(marks => (
              <section key={marks}>
                <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
                  <h3 className="font-serif text-xl text-[var(--foreground)]">{marks}-mark questions</h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                    {grouped[marks].length} published
                  </span>
                </div>

                {grouped[marks].length === 0 ? (
                  <p className="py-5 text-sm text-[var(--muted-foreground)]">No questions published for this mark category.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {grouped[marks].map((question, index) => (
                      <div key={question.id || question.question + index} className="border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--accent)]">
                              {question.paperYear || 'Published'} · Unit {question.unit}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{question.question}</p>
                          </div>
                          <span className="shrink-0 font-mono text-xs font-bold text-[var(--accent)]">{marks}M</span>
                        </div>
                        <div className="mt-3 flex justify-end print:hidden">
                          <button
                            type="button"
                            onClick={() => onOpenGeneratedNote(question.question, activeSubject.name, activeSubject.department)}
                            className="editorial-ghost inline-flex min-h-11 items-center gap-1.5 px-3 text-xs font-semibold"
                          >
                            Generate grounded answer <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </article>
      )}
    </div>
  );
};

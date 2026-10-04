import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookMarked, Search, Sparkles } from 'lucide-react';
import { Department, GlossaryTerm, ScreenId, Subject } from '../types';

interface GlossaryScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onGenerateForTerm: (term: string, dept: Department) => void;
  selectedDepartment: Department;
}

export const GlossaryScreen: React.FC<GlossaryScreenProps> = ({
  onNavigate,
  onGenerateForTerm,
  selectedDepartment
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => setDeptFilter(selectedDepartment), [selectedDepartment]);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('studymate_token');
    if (!token) {
      setSubjects([]);
      setLoading(false);
      return;
    }

    fetch('/api/subjects', {
      headers: { Authorization: 'Bearer ' + token }
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Published glossary content could not be loaded.');
        const data = await response.json();
        if (!cancelled) setSubjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSubjects([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const terms = useMemo(
    () => subjects.flatMap((subject) => (subject.glossary || []).map((term) => ({
      ...term,
      department: term.department || subject.department,
      subject: term.subject || subject.name
    }))),
    [subjects]
  );

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(terms.map((term) => term.department).filter(Boolean)))],
    [terms]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return terms.filter((item) => {
      const matchesDept = deptFilter === 'All' || item.department === deptFilter;
      const matchesSearch = !query ||
        item.term.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        String(item.subject || '').toLowerCase().includes(query);
      return matchesDept && matchesSearch;
    });
  }, [terms, deptFilter, searchQuery]);

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      <div className="flex items-center gap-3 pt-1">
        <button type="button" aria-label="Back to home" onClick={() => onNavigate('home')} className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] editorial-focus">
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--accent)]">Published reference</span>
          <h1 className="text-xl font-serif font-bold text-[var(--foreground)] leading-tight">Technical Glossary</h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">Only glossary entries published by an administrator for the available subjects appear here.</p>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          id="glossary-search"
          name="search"
          aria-label="Search glossary"
          type="search"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search published terms…"
          aria-label="Search glossary"
          className="w-full min-h-11 bg-[var(--card)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[var(--foreground)] editorial-focus"
        />
      </div>

      {departments.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {departments.map((dept) => (
            <button key={dept} type="button" onClick={() => setDeptFilter(dept as Department)} className={`min-h-11 px-3 rounded-xl text-xs font-semibold whitespace-nowrap border ${deptFilter === dept ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]'}`}>
              {dept === 'All' ? 'All' : dept}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading published glossary…</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <BookMarked size={24} className="mx-auto mb-3 text-[var(--accent)]" />
          <h2 className="font-serif font-bold text-[var(--foreground)]">No published glossary entries</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Ask an administrator to publish glossary content for this subject.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <article key={item.term + '-' + index} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-serif font-bold text-[var(--foreground)]">{item.term}</h2>
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg bg-[var(--surface)] text-[var(--accent)]">{item.department}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{item.subject}</span>
              </div>
              <p className="text-sm leading-6 text-[var(--foreground)]">{item.definition}</p>
              {item.keyRule ? (
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--foreground)]">
                  <span className="font-semibold text-[var(--accent)]">Key rule: </span>{item.keyRule}
                </div>
              ) : null}
              <div className="pt-2 border-t border-[var(--border)] flex justify-end">
                <button type="button" onClick={() => onGenerateForTerm(item.term, item.department || selectedDepartment)} className="min-h-11 px-3 rounded-xl text-xs font-semibold text-[var(--accent)] hover:underline editorial-focus">
                  <Sparkles size={13} className="inline mr-1" /> Generate full note <ArrowRight size={13} className="inline ml-1" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

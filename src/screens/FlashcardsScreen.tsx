import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, HelpCircle, Layers, RotateCcw, Sparkles } from 'lucide-react';
import { Department, ScreenId, Subject, SubjectFlashcard } from '../types';

interface FlashcardsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onGenerateForTopic: (topic: string, subjectName: string, dept: Department) => void;
  selectedDepartment: Department;
}

export const FlashcardsScreen: React.FC<FlashcardsScreenProps> = ({
  onNavigate,
  onGenerateForTopic,
  selectedDepartment
}) => {
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>('flashcards');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewSchedule, setReviewSchedule] = useState<Record<string, string>>({});
  const [progressError, setProgressError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDeptFilter(selectedDepartment);
  }, [selectedDepartment]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const token = localStorage.getItem('studymate_token');
    const headers = token ? { Authorization: 'Bearer ' + token } : undefined;

    fetch('/api/subjects', { headers })
      .then(async (response) => {
        if (!response.ok) throw new Error('Published content could not be loaded.');
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

  useEffect(() => {
    const token = localStorage.getItem('studymate_token');
    if (!token) return;

    fetch('/api/flashcards/progress', { headers: { Authorization: 'Bearer ' + token } })
      .then(async (response) => response.ok ? response.json() : [])
      .then((rows) => {
        if (!Array.isArray(rows)) return;
        const mastered = rows.filter((item: any) => item.mastered).map((item: any) => String(item.flashcardId));
        const schedule: Record<string, string> = {};
        rows.forEach((item: any) => {
          if (item.nextReviewAt) schedule[String(item.flashcardId)] = item.nextReviewAt;
        });
        setMasteredIds(mastered);
        setReviewSchedule(schedule);
      })
      .catch(() => {});
  }, []);

  const availableDepartments = useMemo(
    () => ['All', ...Array.from(new Set(subjects.flatMap((subject) => subject.flashcards || []).map((card) => card.department || subjectDepartment(subjects, card)).filter(Boolean)))],
    [subjects]
  );

  const filteredCards = useMemo(
    () => subjects
      .filter((subject) => deptFilter === 'All' || subject.department === deptFilter)
      .flatMap((subject) => (subject.flashcards || []).map((card) => ({
        ...card,
        department: card.department || subject.department,
        subject: card.subject || subject.name
      }))),
    [subjects, deptFilter]
  );

  useEffect(() => {
    setCurrentIndex((index) => Math.min(index, Math.max(filteredCards.length - 1, 0)));
    setIsFlipped(false);
  }, [deptFilter, filteredCards.length]);

  const currentCard = filteredCards[currentIndex];

  const handleToggleMastered = async (id: string) => {
    const token = localStorage.getItem('studymate_token');
    if (!token) {
      setProgressError('Your session is missing. Please sign in again.');
      return;
    }

    const wasMastered = masteredIds.includes(id);
    const previousMastered = masteredIds;
    const previousSchedule = reviewSchedule;
    const nextMastered = wasMastered ? masteredIds.filter((item) => item !== id) : [...masteredIds, id];
    const nextDate = new Date(Date.now() + (wasMastered ? 24 : 24 * 7) * 60 * 60 * 1000).toISOString();
    const nextSchedule = { ...reviewSchedule, [id]: nextDate };

    setMasteredIds(nextMastered);
    setReviewSchedule(nextSchedule);
    setProgressError('');

    try {
      const response = await fetch('/api/flashcards/progress/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify({ mastered: !wasMastered, nextReviewAt: nextDate })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Progress could not be saved.');
    } catch (error) {
      setMasteredIds(previousMastered);
      setReviewSchedule(previousSchedule);
      setProgressError(error instanceof Error ? error.message : 'Progress could not be saved.');
    }
  };

  const progressPercent = filteredCards.length
    ? Math.round((masteredIds.filter((id) => filteredCards.some((card) => card.id === id)).length / filteredCards.length) * 100)
    : 0;

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Back to home" onClick={() => onNavigate('home')} className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] editorial-focus">
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[var(--accent)]">Published study practice</span>
            <h1 className="text-xl font-serif font-bold text-[var(--foreground)] leading-tight">Flashcards & Quiz</h1>
          </div>
        </div>
        <div className="flex items-center bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] text-xs font-semibold">
          <button type="button" onClick={() => setActiveTab('flashcards')} className={`px-3 py-2 rounded-lg flex items-center gap-1.5 ${activeTab === 'flashcards' ? 'bg-[var(--card)] text-[var(--accent)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>
            <Layers size={14} /> Cards
          </button>
          <button type="button" onClick={() => setActiveTab('quiz')} className={`px-3 py-2 rounded-lg flex items-center gap-1.5 ${activeTab === 'quiz' ? 'bg-[var(--card)] text-[var(--accent)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>
            <HelpCircle size={14} /> Quiz
          </button>
        </div>
      </div>

      {progressError && <div className="p-3 rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] text-[var(--danger)] text-xs">{progressError}</div>}

      {activeTab === 'flashcards' ? (
        <>
          <p className="text-xs text-[var(--muted-foreground)]">Only flashcards published by an administrator for your available subjects appear here.</p>

          {availableDepartments.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {availableDepartments.map((dept) => (
                <button key={dept} type="button" onClick={() => setDeptFilter(dept as Department)} className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap border ${deptFilter === dept ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]'}`}>
                  {dept === 'All' ? 'All' : dept}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Loading published flashcards…</div>
          ) : !currentCard ? (
            <div className="p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-2xl">
              <BookOpen size={24} className="mx-auto mb-3 text-[var(--accent)]" />
              <h2 className="font-serif font-bold text-[var(--foreground)]">No published flashcards yet</h2>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Ask an administrator to publish flashcard content for this subject.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">
                <span>{currentIndex + 1} / {filteredCards.length}</span>
                <span>{progressPercent}% mastered</span>
              </div>

              <button type="button" onClick={() => setIsFlipped((value) => !value)} className="w-full min-h-[260px] text-left rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm editorial-focus">
                {!isFlipped ? (
                  <div className="h-full flex flex-col justify-between gap-8">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">{currentCard.subject} · {currentCard.department}</span>
                      <h2 className="mt-4 text-2xl font-serif font-bold text-[var(--foreground)]">{currentCard.question}</h2>
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)]">Tap to reveal the answer.</span>
                  </div>
                ) : (
                  <div className="h-full space-y-5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent)]">Answer · {currentCard.topic}</span>
                    <p className="text-sm leading-7 text-[var(--foreground)] whitespace-pre-wrap">{currentCard.answer}</p>
                    {currentCard.keywords?.length ? <div className="flex flex-wrap gap-2">{currentCard.keywords.map((keyword) => <span key={keyword} className="px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[10px] font-mono">{keyword}</span>)}</div> : null}
                  </div>
                )}
              </button>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setCurrentIndex((index) => (index - 1 + filteredCards.length) % filteredCards.length)} className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs editorial-focus"><ChevronLeft size={15} className="inline" /> Previous</button>
                <button type="button" onClick={() => setIsFlipped(false)} className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs editorial-focus"><RotateCcw size={15} className="inline" /> Reset</button>
                <button type="button" onClick={() => handleToggleMastered(currentCard.id)} className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs editorial-focus"><CheckCircle2 size={15} className="inline mr-1" /> {masteredIds.includes(currentCard.id) ? 'Unmark mastered' : 'Mark mastered'}</button>
                <button type="button" onClick={() => onGenerateForTopic(currentCard.topic, currentCard.subject || '', currentCard.department || selectedDepartment)} className="px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-xs editorial-focus"><Sparkles size={15} className="inline mr-1" /> Generate note</button>
                <button type="button" onClick={() => setCurrentIndex((index) => (index + 1) % filteredCards.length)} className="ml-auto px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs editorial-focus">Next <ChevronRight size={15} className="inline" /></button>
              </div>

              {reviewSchedule[currentCard.id] && (
                <p className="text-[10px] font-mono text-[var(--muted-foreground)]">Next review: {new Date(reviewSchedule[currentCard.id]).toLocaleString()}</p>
              )}
            </>
          )}
        </>
      ) : (
        <div className="p-8 text-center bg-[var(--card)] border border-[var(--border)] rounded-2xl">
          <HelpCircle size={24} className="mx-auto mb-3 text-[var(--accent)]" />
          <h2 className="font-serif font-bold text-[var(--foreground)]">No MCQ bank published</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Quiz mode will appear here when an administrator publishes structured multiple-choice content.</p>
          <button type="button" onClick={() => onNavigate('quiz')} className="mt-4 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs editorial-focus">Open Quiz</button>
        </div>
      )}
    </div>
  );
};

function subjectDepartment(subjects: Subject[], card: SubjectFlashcard) {
  const subject = subjects.find((item) => item.name === card.subject);
  return subject?.department || '';
}

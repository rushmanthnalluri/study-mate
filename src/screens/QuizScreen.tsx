import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, RotateCcw, Trophy, Timer, ChevronRight, BookOpen, Sparkles, AlertCircle } from 'lucide-react';
import { Department, ScreenId, Subject } from '../types';

type Q = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  topic?: string;
};

interface Props {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  selectedDepartment: Department;
}

export const QuizScreen: React.FC<Props> = ({ onNavigate, subjects, selectedDepartment }) => {
  const filtered = useMemo(
    () => subjects.filter(s => selectedDepartment === 'All' || s.department === selectedDepartment),
    [subjects, selectedDepartment]
  );

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [mode, setMode] = useState<'quiz' | 'model'>('quiz');
  const [questions, setQuestions] = useState<Q[]>([]);
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [seconds, setSeconds] = useState(600);

  const subject = subjects.find(s => s.id === subjectId) || filtered[0] || subjects[0];

  useEffect(() => {
    if (!subject) return;
    if (!filtered.some(s => s.id === subjectId)) {
      setSubjectId(filtered[0]?.id || subject.id);
    }
  }, [filtered, subject, subjectId]);

  useEffect(() => {
    if (!started || finished || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds(value => value - 1), 1000);
    return () => window.clearInterval(timer);
  }, [started, finished, seconds]);

  useEffect(() => {
    if (started && seconds === 0) {
      setFinished(true);
      void recordAttempt();
    }
  }, [seconds, started]);

  const start = async () => {
    if (!subject) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('studymate_token');
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ subjectId: subject.id, mode })
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error(data.error || 'No questions are available for this subject.');
      }

      setQuestions(data.questions);
      setStarted(true);
      setFinished(false);
      setIndex(0);
      setSelected(null);
      setScore(0);
      setSeconds(mode === 'model' ? 1800 : 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start the assessment.');
    } finally {
      setLoading(false);
    }
  };

  const answer = (choice: number) => {
    if (selected !== null) return;
    setSelected(choice);
    if (choice === questions[index]?.answer) setScore(value => value + 1);
  };

  const recordAttempt = async () => {
    const token = localStorage.getItem('studymate_token');
    if (!token || !subject) return;
    try {
      await fetch('/api/quiz/attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject: subject.name, mode, score, total: questions.length })
      });
    } catch {}
  };

  const next = () => {
    if (index + 1 >= questions.length) {
      setFinished(true);
      void recordAttempt();
    } else {
      setIndex(value => value + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setIndex(0);
    setSelected(null);
    setScore(0);
    setError('');
  };

  const current = questions[index];
  const percentage = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="rounded-xl border border-[#e2d4c8] bg-[#fffaf4] p-2 text-[#6f594a] hover:bg-[#f7eee6]"
          aria-label="Back to home"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Assessment Lab</p>
          <h1 className="text-xl font-black text-[#3b2b23]">Quiz & Model Test</h1>
        </div>
        <div className="w-9" />
      </div>

      {!started && (
        <div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#ead9c8] bg-[#fbf3eb] p-3 text-[11px] text-[#6f594a]">
            <Sparkles size={15} className="text-[#a56f42]" />
            <span>Questions are generated from the subject question bank using the administrator-configured AI provider. If the provider is unavailable, the assessment will not invent questions.</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-[#4b392e]">
              Course
              <select
                value={subject?.id || ''}
                onChange={e => setSubjectId(e.target.value)}
                className="auth-input mt-1.5"
              >
                {filtered.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>

            <label className="text-xs font-bold text-[#4b392e]">
              Mode
              <select
                value={mode}
                onChange={e => setMode(e.target.value as 'quiz' | 'model')}
                className="auth-input mt-1.5"
              >
                <option value="quiz">Quick Quiz · 10 min · 10 questions</option>
                <option value="model">Model Test · 30 min · 20 questions</option>
              </select>
            </label>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              [mode === 'model' ? '20' : '10', 'Questions'],
              [mode === 'model' ? '30' : '10', 'Minutes'],
              ['4', 'Options']
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl bg-[#f7eee6] p-3 text-center">
                <b className="block text-lg text-[#7c4f2c]">{value}</b>
                <span className="text-[9px] font-bold text-[#8d7868]">{label}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-[#e3b9ad] bg-[#fff1ed] p-3 text-[11px] font-semibold text-[#8a4335]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={start}
            disabled={!subject || loading}
            className="mt-5 w-full rounded-2xl bg-[#7c4f2c] py-3.5 text-xs font-black text-white hover:bg-[#643c20] disabled:opacity-50"
          >
            {loading ? 'Building assessment…' : `Start ${mode === 'model' ? 'Model Test' : 'Quiz'}`}
            {!loading && <ChevronRight className="ml-1 inline" size={16} />}
          </button>
        </div>
      )}

      {started && !finished && current && (
        <div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-[#a0704b]">
              Question {index + 1}/{questions.length}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3e4d5] px-3 py-1 text-[10px] font-black text-[#76513a]">
              <Timer size={12} />
              {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
            </span>
          </div>

          <h2 className="whitespace-pre-line text-base font-extrabold leading-7 text-[#3b2b23]">{current.question}</h2>

          <div className="mt-5 space-y-2">
            {current.options.map((option, choice) => {
              const correct = choice === current.answer;
              const chosen = selected === choice;
              const revealed = selected !== null;

              return (
                <button
                  key={choice}
                  disabled={revealed}
                  onClick={() => answer(choice)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-xs font-semibold transition ${revealed && correct ? 'border-[#86a276] bg-[#eaf3e5]' : revealed && chosen ? 'border-[#c98b7b] bg-[#fff0ec]' : 'border-[#e4d7cc] bg-white hover:bg-[#f8f0e8]'}`}
                >
                  {revealed && correct
                    ? <CheckCircle2 size={18} className="shrink-0 text-[#55734a]" />
                    : chosen
                      ? <Circle size={18} className="shrink-0 text-[#a04434]" />
                      : <Circle size={18} className="shrink-0 text-[#b7a396]" />}
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="mt-4 rounded-2xl bg-[#f7eee6] p-3 text-[11px] leading-5 text-[#705b4c]">
              <b>Explanation:</b> {current.explanation}
            </div>
          )}

          <button
            disabled={selected === null}
            onClick={next}
            className="mt-5 w-full rounded-2xl bg-[#3b2b23] py-3 text-xs font-black text-white disabled:opacity-40"
          >
            {index + 1 === questions.length ? 'Finish test' : 'Next question'}
            <ChevronRight className="ml-1 inline" size={15} />
          </button>
        </div>
      )}

      {finished && (
        <div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-7 text-center shadow-sm">
          <Trophy className="mx-auto text-[#b77943]" size={42} />
          <p className="mt-3 text-[10px] font-black uppercase tracking-[.2em] text-[#a0704b]">Test complete</p>
          <h2 className="mt-1 text-3xl font-black text-[#3b2b23]">{score}/{questions.length}</h2>
          <p className="mt-2 text-xs text-[#806f61]">{percentage}% • {mode === 'model' ? 'Model Test' : 'Quick Quiz'} • {subject?.name}</p>
          <div className="mt-5 flex gap-2">
            <button onClick={reset} className="flex-1 rounded-2xl border border-[#ddcdbd] bg-white py-3 text-xs font-black text-[#5e4a3d]">
              <RotateCcw className="mr-1 inline" size={14} />Retake
            </button>
            <button onClick={() => onNavigate('flashcards')} className="flex-1 rounded-2xl bg-[#7c4f2c] py-3 text-xs font-black text-white">
              <BookOpen className="mr-1 inline" size={14} />Revise
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

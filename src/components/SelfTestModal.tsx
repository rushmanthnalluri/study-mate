import React, { useState } from 'react';
import { ExamNote } from '../types';
import { X, CheckCircle2, Sparkles, Award, RotateCcw } from 'lucide-react';

interface SelfTestModalProps {
  note: ExamNote;
  onClose: () => void;
}

export const SelfTestModal: React.FC<SelfTestModalProps> = ({ note, onClose }) => {
  const [targetMarks, setTargetMarks] = useState<2 | 5 | 10>(2);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<{
    coveragePercent: number;
    wordCount: number;
    matchedKeywords: string[];
    missingKeywords: string[];
    feedback: string;
  } | null>(null);

  const getQuestion = () => {
    if (targetMarks === 2) return note.twoMarks.question;
    if (targetMarks === 5) return note.fiveMarks.question;
    return note.tenMarks.question;
  };

  const handleEvaluate = () => {
    const text = studentAnswer.toLowerCase().trim();
    const words = text ? text.split(/\s+/).length : 0;
    const keywords = Array.isArray(note.keywords) ? note.keywords : [];
    const matched = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    const missing = keywords.filter(keyword => !text.includes(keyword.toLowerCase()));
    const coveragePercent = keywords.length
      ? Math.round((matched.length / keywords.length) * 100)
      : 0;

    const recommendedMinimum = targetMarks === 2 ? 20 : targetMarks === 5 ? 60 : 120;
    let feedback = '';

    if (words < recommendedMinimum) {
      feedback = `Your response is shorter than a general practice target of about ${recommendedMinimum} words. Check the published assessment guidance for the actual expected length.`;
    } else if (coveragePercent >= 60) {
      feedback = 'Good keyword coverage. Compare your answer with the published subject material before submitting it.';
    } else {
      feedback = 'Several source keywords are missing. Review the published material and strengthen the concepts you actually need to explain.';
    }

    setEvaluation({
      coveragePercent,
      wordCount: words,
      matchedKeywords: matched,
      missingKeywords: missing,
      feedback
    });
  };

  const handleReset = () => {
    setStudentAnswer('');
    setEvaluation(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-[var(--border)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-50)] text-[var(--accent-800)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] font-serif">Self-Test</h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Heuristic keyword coverage only — this is not an official grading rubric.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close self-test"
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[var(--foreground)]">Question type:</span>
          {([2, 5, 10] as const).map(mark => (
            <button
              type="button"
              key={mark}
              onClick={() => {
                setTargetMarks(mark);
                setEvaluation(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                targetMarks === mark
                  ? 'bg-[var(--accent-800)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              {mark} marks
            </button>
          ))}
        </div>

        <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]/60 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--muted-foreground)]">
            Published question · {targetMarks} marks
          </span>
          <p className="text-xs font-bold text-[var(--foreground)]">{getQuestion()}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-[var(--foreground)]" htmlFor="self-test-answer">Write your answer</label>
            <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
              {studentAnswer ? studentAnswer.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <textarea
            id="self-test-answer"
            rows={6}
            value={studentAnswer}
            onChange={event => setStudentAnswer(event.target.value)}
            placeholder="Write your answer using the published subject material…"
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] editorial-focus leading-relaxed font-sans"
          />
        </div>

        {!evaluation ? (
          <button
            type="button"
            onClick={handleEvaluate}
            disabled={!studentAnswer.trim()}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--accent-800)] text-white hover:bg-[var(--accent-900)] transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>Check practice coverage</span>
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-[var(--border)]/60 animate-fade-in">
            <div className="bg-gradient-to-r from-stone-900 to-[var(--accent-950)] text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                  Keyword coverage
                </span>
                <div className="text-2xl font-mono font-bold">
                  {evaluation.coveragePercent}<span className="text-sm font-normal text-[var(--card)]">%</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono text-[var(--card)]">{evaluation.wordCount} words</span>
                <div className="text-amber-300 font-bold">
                  {evaluation.matchedKeywords.length}/{note.keywords.length} keywords
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]/60 text-xs space-y-1">
              <span className="font-bold text-[var(--foreground)] flex items-center space-x-1">
                <CheckCircle2 size={13} className="text-emerald-700" />
                <span>Practice feedback</span>
              </span>
              <p className="text-[var(--foreground)] leading-relaxed">{evaluation.feedback}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--muted-foreground)] block">
                Keyword coverage
              </span>
              <div className="flex flex-wrap gap-1">
                {evaluation.matchedKeywords.map((keyword, index) => (
                  <span key={index} className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    ✓ {keyword}
                  </span>
                ))}
                {evaluation.missingKeywords.map((keyword, index) => (
                  <span key={index} className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                    Missing: {keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button type="button" onClick={handleReset} className="flex-1 py-2 px-3 rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--foreground)] flex items-center justify-center gap-1">
                <RotateCcw size={14} /> Try Again
              </button>
              <button type="button" onClick={onClose} className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent-800)] text-white text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ExamNote } from '../types';
import { X, CheckCircle2, AlertTriangle, Sparkles, Award, RotateCcw } from 'lucide-react';

interface SelfTestModalProps {
  note: ExamNote;
  onClose: () => void;
}

export const SelfTestModal: React.FC<SelfTestModalProps> = ({ note, onClose }) => {
  const [targetMarks, setTargetMarks] = useState<2 | 5 | 10>(2);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    maxScore: number;
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

    // Check matching keywords
    const matched = note.keywords.filter((kw) => text.includes(kw.toLowerCase()));
    const missing = note.keywords.filter((kw) => !text.includes(kw.toLowerCase()));

    const matchRatio = note.keywords.length > 0 ? matched.length / note.keywords.length : 0.5;

    let score = 0;
    let feedback = '';

    if (targetMarks === 2) {
      if (words < 12) {
        score = 1;
        feedback = 'Answer is too brief. Include the explicit definition or formula to secure 2/2 marks.';
      } else if (matchRatio >= 0.4) {
        score = 2;
        feedback = 'Excellent crisp definition matching KL University scoring rubrics!';
      } else {
        score = 1;
        feedback = `Missing key evaluation terms: "${missing.slice(0, 2).join('", "')}". Add them to secure full marks.`;
      }
    } else if (targetMarks === 5) {
      if (words < 50) {
        score = 2.5;
        feedback = 'Answer is too short for 5 marks. KL evaluators expect 4-5 structured bullet points and a principle.';
      } else if (matchRatio >= 0.5) {
        score = words >= 90 ? 5 : 4;
        feedback = 'Great coverage of principles and core steps.';
      } else {
        score = 3;
        feedback = `Missing key scoring concepts: "${missing.slice(0, 3).join('", "')}".`;
      }
    } else {
      // 10 Marks
      if (words < 120) {
        score = 5;
        feedback = '10-mark questions require comprehensive sections: Working Principle, Mechanism, and Industrial Applications.';
      } else if (matchRatio >= 0.6) {
        score = words >= 250 ? 10 : 8.5;
        feedback = 'Outstanding comprehensive essay! Strong keyword density and clear structural organization.';
      } else {
        score = 6.5;
        feedback = `Decent attempt. Incorporate: "${missing.slice(0, 3).join('", "')}" and an architectural diagram to score full marks.`;
      }
    }

    setEvaluation({
      score,
      maxScore: targetMarks,
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-50)] text-[var(--accent-800)] flex items-center justify-center">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--foreground)] font-serif">
                KL Evaluator Self-Test
              </h3>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Test your answer against the official KL mark rubric
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mark Type Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-[var(--foreground)]">Test for:</span>
          {([2, 5, 10] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setTargetMarks(m);
                setEvaluation(null);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                targetMarks === m
                  ? 'bg-[var(--accent-800)] text-white shadow-sm'
                  : 'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--border)]'
              }`}
            >
              {m} Marks
            </button>
          ))}
        </div>

        {/* Question Prompt */}
        <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]/60 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--muted-foreground)]">
            Question ({targetMarks} Marks)
          </span>
          <p className="text-xs font-bold text-[var(--foreground)]">
            {getQuestion()}
          </p>
        </div>

        {/* Answer Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-[var(--foreground)]">Write Your Answer:</label>
            <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
              {studentAnswer ? studentAnswer.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <textarea
            rows={5}
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder={
              targetMarks === 2
                ? 'Type your crisp 2-3 sentence definition here...'
                : 'Write your structured answer with headings and points...'
            }
            className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] editorial-focus leading-relaxed font-sans"
          />
        </div>

        {/* Actions */}
        {!evaluation ? (
          <button
            onClick={handleEvaluate}
            disabled={!studentAnswer.trim()}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--accent-800)] text-white hover:bg-[var(--accent-900)] transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50 active:scale-[0.98]"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>Simulate KL Evaluator Grade</span>
          </button>
        ) : (
          <div className="space-y-3 pt-2 border-t border-[var(--border)]/60 animate-fade-in">
            {/* Score Banner */}
            <div className="bg-gradient-to-r from-stone-900 to-[var(--accent-950)] text-white p-4 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                  Simulated KL Score
                </span>
                <div className="text-2xl font-mono font-bold">
                  {evaluation.score} <span className="text-sm font-normal text-[var(--card)]">/ {evaluation.maxScore}</span>
                </div>
              </div>
              <div className="text-right text-xs">
                <span className="font-mono text-[var(--card)]">{evaluation.wordCount} Words</span>
                <div className="text-amber-300 font-bold">
                  {evaluation.matchedKeywords.length}/{note.keywords.length} Keywords
                </div>
              </div>
            </div>

            {/* Evaluator Feedback */}
            <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]/60 text-xs space-y-1">
              <span className="font-bold text-[var(--foreground)] flex items-center space-x-1">
                <CheckCircle2 size={13} className="text-emerald-700" />
                <span>Evaluator Feedback:</span>
              </span>
              <p className="text-[var(--foreground)] leading-relaxed">
                {evaluation.feedback}
              </p>
            </div>

            {/* Matched vs Missing Keywords */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[var(--muted-foreground)] block">
                Keywords Analysis:
              </span>
              <div className="flex flex-wrap gap-1">
                {evaluation.matchedKeywords.map((kw, i) => (
                  <span key={i} className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-medium">
                    ✓ {kw}
                  </span>
                ))}
                {evaluation.missingKeywords.map((kw, i) => (
                  <span key={i} className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-full font-medium">
                    ✗ Missing: {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 py-2 px-3 rounded-xl border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface)] text-xs font-semibold flex items-center justify-center space-x-1"
              >
                <RotateCcw size={14} />
                <span>Try Again</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent-800)] text-white hover:bg-[var(--accent-900)] text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

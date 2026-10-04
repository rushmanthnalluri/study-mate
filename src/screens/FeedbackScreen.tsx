import React, { useState } from 'react';
import { FeedbackSource, ScreenId, FeedbackItem } from '../types';
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Users,
  Award,
  GraduationCap
} from 'lucide-react';

interface FeedbackScreenProps {
  currentTopic?: string;
  currentDepartment?: string;
  currentSubject?: string;
  onNavigate: (screen: ScreenId) => void;
  onSubmitFeedback: (feedback: {
    topic: string;
    department: string;
    subject: string;
    source: FeedbackSource;
    rating: 'useful' | 'not_useful';
    comment: string;
  }) => Promise<void>;
  recentFeedbacks: FeedbackItem[];
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  currentTopic = "Banker's Algorithm for Deadlock Avoidance",
  currentDepartment = "CSE",
  currentSubject = "Operating Systems",
  onNavigate,
  onSubmitFeedback,
  recentFeedbacks
}) => {
  const [rating, setRating] = useState<'useful' | 'not_useful'>('useful');
  const [source, setSource] = useState<FeedbackSource>('Student');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitFeedback({
        topic: currentTopic,
        department: currentDepartment,
        subject: currentSubject,
        source,
        rating,
        comment
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Step 06 of 06
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] leading-tight">
            Give Feedback
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Every answer produces a signal. Your feedback directly improves the prompt grounding and knowledge base context.
      </p>

      {/* Blueprint Step 06 Form */}
      <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-4">
        {isSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-sans font-bold text-[var(--foreground)]">
              Signal Recorded!
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
              Thank you. Your feedback has been logged to improve the KL examination prompts and scoring weights.
            </p>
            <div className="pt-2 flex justify-center space-x-2">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setComment('');
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-surface-subtle"
              >
                Send Another Note
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-[var(--accent)] text-white"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Topic Context */}
            <div className="bg-surface-subtle p-3 rounded-lg border border-[var(--border)]/60">
              <span className="text-[10px] uppercase font-sans tracking-wider font-bold text-[var(--muted-foreground)] block mb-0.5">
                Feedback for Topic:
              </span>
              <p className="text-xs font-bold text-[var(--foreground)] line-clamp-1">
                {currentTopic}
              </p>
              <p className="text-[10px] text-[var(--muted-foreground)]">
                {currentSubject} • {currentDepartment}
              </p>
            </div>

            {/* Quick Rating: Useful or Not Useful */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                Was this answer useful for KL exams?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRating('useful')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                    rating === 'useful'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'bg-[#ffffff] border-[var(--border)] text-[var(--foreground)] hover:bg-surface-subtle'
                  }`}
                >
                  <ThumbsUp size={15} />
                  <span>Useful</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRating('not_useful')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
                    rating === 'not_useful'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20'
                      : 'bg-[#ffffff] border-[var(--border)] text-[var(--foreground)] hover:bg-surface-subtle'
                  }`}
                >
                  <ThumbsDown size={15} />
                  <span>Needs Improvement</span>
                </button>
              </div>
            </div>

            {/* Blueprint Section 04: Three Sources of Signal */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                Your Signal Perspective (Three Sources):
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'Student' as FeedbackSource,
                    label: 'Student',
                    desc: 'General clarity & ease',
                    icon: Users
                  },
                  {
                    id: 'Top student' as FeedbackSource,
                    label: 'Top Student',
                    desc: 'Scoring structure',
                    icon: Award
                  },
                  {
                    id: 'Professor' as FeedbackSource,
                    label: 'Professor',
                    desc: 'Rubrics & keywords',
                    icon: GraduationCap
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = source === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSource(item.id)}
                      className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        isSelected
                          ? 'bg-brand-50 border-brand-500 text-[var(--accent)] ring-1 ring-brand-500/20'
                          : 'bg-[#ffffff] border-[var(--border)] text-[var(--foreground)] hover:bg-surface-subtle'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)]'} />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>}
                      </div>
                      <span className="text-[11px] font-bold block">{item.label}</span>
                      <span className="text-[9px] text-[var(--muted-foreground)] leading-tight mt-0.5">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Short Comment / Examiner Insight
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  source === 'Top student'
                    ? 'e.g. Suggest putting the formula in a box or adding 2 more bullet points...'
                    : source === 'Professor'
                    ? 'e.g. Ensure the D121 and z-value units are explicitly defined...'
                    : 'Tell us how this helped or what was missing...'
                }
                className="w-full bg-[#ffffff] border border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 shadow-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[var(--accent)] text-white hover:bg-[var(--accent)] transition-all flex items-center justify-center space-x-1.5 shadow-sm active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span>Recording Signal...</span>
              ) : (
                <>
                  <MessageSquare size={14} />
                  <span>Submit Signal to KL Knowledge Base</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Blueprint Section 04: Community Signal Loop Feed */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-[var(--muted-foreground)] flex items-center space-x-1.5">
            <Sparkles size={13} className="text-amber-600" />
            <span>Active KL Exam Signals Loop</span>
          </h3>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {recentFeedbacks.length} Signals
          </span>
        </div>

        <div className="space-y-2">
          {recentFeedbacks.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3 shadow-sm text-left space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-[var(--accent)]">
                  {item.source}
                </span>
                <span className="text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ✓ {item.rating === 'useful' ? 'Verified Useful' : 'Refinement noted'}
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--foreground)] line-clamp-1">
                {item.topic}
              </p>
              {item.comment && (
                <p className="text-[11px] text-[var(--muted-foreground)] italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Department, ScreenId, QuizQuestion } from '../types';
import { initialFlashcards, Flashcard } from '../data/flashcardsData';
import { initialQuizQuestions } from '../data/quizData';
import {
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  HelpCircle,
  Trophy,
  XCircle,
  RefreshCw,
  Award
} from 'lucide-react';

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
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);

  // Flashcards state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [reviewDueIds, setReviewDueIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('studymate_user') || 'null');
      const key = user?.id ? `studymate_flashcard_progress_${user.id}` : '';
      if (!key) return;
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      const mastered = Array.isArray(stored.masteredIds) ? stored.masteredIds : [];
      const schedule = stored.schedule || {};
      const due = mastered.filter((id:string) => !schedule[id] || new Date(schedule[id]).getTime() <= Date.now());
      setMasteredIds(mastered);
      setReviewDueIds(due);
    } catch {}
  }, []);

  const persistProgress = (nextMastered:string[], nextSchedule:Record<string,string>) => {
    try {
      const user = JSON.parse(localStorage.getItem('studymate_user') || 'null');
      if (!user?.id) return;
      localStorage.setItem(`studymate_flashcard_progress_${user.id}`, JSON.stringify({ masteredIds: nextMastered, schedule: nextSchedule }));
    } catch {}
  };

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const filteredCards = initialFlashcards.filter(
    (c) => deptFilter === 'All' || c.department === deptFilter
  );

  const filteredQuiz = initialQuizQuestions.filter(
    (q) => deptFilter === 'All' || q.department === deptFilter
  );

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];
  const currentQuizItem: QuizQuestion | undefined = filteredQuiz[quizIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleToggleMastered = (id: string) => {
    const wasMastered = masteredIds.includes(id);
    const nextMastered = wasMastered ? masteredIds.filter(i => i !== id) : [...masteredIds, id];
    const nextSchedule: Record<string,string> = {};
    try {
      const user = JSON.parse(localStorage.getItem('studymate_user') || 'null');
      const stored = user?.id ? JSON.parse(localStorage.getItem(`studymate_flashcard_progress_${user.id}`) || '{}') : {};
      Object.assign(nextSchedule, stored.schedule || {});
    } catch {}
    nextSchedule[id] = new Date(Date.now() + (wasMastered ? 24*60*60*1000 : 7*24*60*60*1000)).toISOString();
    setMasteredIds(nextMastered);
    setReviewDueIds(nextMastered.filter(i => !nextSchedule[i] || new Date(nextSchedule[i]).getTime() <= Date.now()));
    persistProgress(nextMastered, nextSchedule);
  };

  // Quiz Handlers
  const handleSelectOption = (index: number) => {
    if (selectedOption !== null || !currentQuizItem) return;
    setSelectedOption(index);

    if (index === currentQuizItem.correctAnswerIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex < filteredQuiz.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const isMastered = currentCard ? masteredIds.includes(currentCard.id) : false;
  const progressPercent =
    filteredCards.length > 0
      ? Math.round(
          (masteredIds.filter((id) => filteredCards.some((c) => c.id === id)).length /
            filteredCards.length) *
            100
        )
      : 0;

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg border border-[#e3d6cb] bg-[#fffaf4] dark:bg-stone-900 text-[#806f61] hover:text-[#3b2b23] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#7c4f2c] dark:text-amber-300">
              Exam Practice & Memory Suite
            </span>
            <h1 className="text-xl font-sans font-bold text-[#3b2b23] dark:text-white leading-tight">
              Flashcards & Interactive Quiz
            </h1>
          </div>
        </div>

        {/* Tab switcher: Flashcards vs Quiz */}
        <div className="flex items-center bg-surface-subtle dark:bg-stone-800 p-1 rounded-xl border border-[#e3d6cb] dark:border-stone-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeTab === 'flashcards'
                ? 'bg-[#fffaf4] dark:bg-stone-900 text-[#7c4f2c] dark:text-amber-300 shadow-sm font-bold'
                : 'text-[#806f61] hover:text-[#3b2b23]'
            }`}
          >
            <Layers size={14} />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors ${
              activeTab === 'quiz'
                ? 'bg-[#fffaf4] dark:bg-stone-900 text-[#7c4f2c] dark:text-amber-300 shadow-sm font-bold'
                : 'text-[#806f61] hover:text-[#3b2b23]'
            }`}
          >
            <HelpCircle size={14} />
            <span>Quiz Mode</span>
          </button>
        </div>
      </div>

      <p className="text-xs text-[#806f61]">
        {activeTab === 'flashcards'
          ? 'Master high-yield 2-mark definitions, standards, and kinetics evaluated in KL University exams.'
          : 'Self-assess with multiple-choice questions aligned with KL In-Sem exam standards.'}
      </p>

      {/* Department Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'Food Technology', 'CSE', 'AIDS', 'ECE', 'EEE'].map((dept) => (
          <button
            key={dept}
            onClick={() => {
              setDeptFilter(dept as Department);
              setCurrentIndex(0);
              setIsFlipped(false);
              handleRestartQuiz();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              deptFilter === dept
                ? 'bg-[#7c4f2c] text-white shadow-sm'
                : 'bg-[#fffaf4] dark:bg-stone-900 text-[#3b2b23] dark:text-stone-300 border border-[#e3d6cb] dark:border-stone-800 hover:bg-surface-subtle'
            }`}
          >
            {dept === 'All' ? 'All Depts' : dept}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FLASHCARDS MODE */}
      {/* ========================================================================= */}
      {activeTab === 'flashcards' && (
        <>
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#806f61] font-medium">
              <span>Card {filteredCards.length > 0 ? currentIndex + 1 : 0} of {filteredCards.length}</span>
              <span>{progressPercent}% Mastered · {reviewDueIds.length} due</span>
            </div>
            <div className="w-full bg-surface-subtle dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#7c4f2c] dark:bg-amber-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Flashcard Container */}
          {currentCard ? (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="bg-[#fffaf4] dark:bg-stone-900 border border-[#e3d6cb] dark:border-stone-800 rounded-2xl p-6 min-h-[260px] flex flex-col justify-between shadow-card cursor-pointer hover:border-brand-300 transition-all select-none relative group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono px-2 py-0.5 rounded bg-[#f4eadf] dark:bg-stone-800 text-[#7c4f2c] dark:text-amber-300 font-bold">
                  {currentCard.subject}
                </span>
                <span className="text-[11px] text-[#806f61] flex items-center space-x-1">
                  <RotateCcw size={12} className="group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click to flip</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="my-auto py-4 text-center">
                {!isFlipped ? (
                  <div className="space-y-2 animate-fade-in">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#806f61] block">
                      Topic: {currentCard.topic}
                    </span>
                    <h3 className="text-lg font-sans font-bold text-[#3b2b23] dark:text-white leading-snug">
                      {currentCard.question}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-2 animate-fade-in">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-emerald-600 block">
                      KL Exam Standard Answer
                    </span>
                    <p className="text-sm font-sans text-[#3b2b23] dark:text-stone-200 leading-relaxed font-medium">
                      {currentCard.answer}
                    </p>
                    {currentCard.keywords && currentCard.keywords.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1 justify-center">
                        {currentCard.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-[#fbf3e9] dark:bg-stone-800 text-[#714628] dark:text-amber-300 border border-[#e2c8ad] dark:border-stone-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-subtle dark:border-stone-800 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleMastered(currentCard.id);
                  }}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                    isMastered
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-surface-subtle dark:bg-stone-800 text-[#806f61] hover:text-[#3b2b23]'
                  }`}
                >
                  <CheckCircle2 size={15} />
                  <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateForTopic(currentCard.topic, currentCard.subject, currentCard.department);
                  }}
                  className="inline-flex items-center space-x-1 text-[#7c4f2c] dark:text-amber-300 hover:underline font-semibold"
                >
                  <span>Generate Full Note</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#fffaf4] dark:bg-stone-900 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 p-6">
              <p className="text-xs text-[#806f61]">No flashcards available for {deptFilter}.</p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevCard}
              disabled={filteredCards.length <= 1}
              className="px-4 py-2.5 rounded-xl border border-[#e3d6cb] dark:border-stone-800 bg-[#fffaf4] dark:bg-stone-900 text-[#3b2b23] dark:text-stone-200 font-semibold text-xs hover:bg-surface-subtle flex items-center space-x-1 shadow-sm disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNextCard}
              disabled={filteredCards.length <= 1}
              className="px-4 py-2.5 rounded-xl bg-[#7c4f2c] hover:bg-[#7c4f2c] text-white font-semibold text-xs flex items-center space-x-1 shadow-sm disabled:opacity-40"
            >
              <span>Next Card</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE QUIZ MODE */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-4">
          {!isQuizFinished && currentQuizItem ? (
            <div className="bg-[#fffaf4] dark:bg-stone-900 border border-[#e3d6cb] dark:border-stone-800 rounded-2xl p-6 shadow-card space-y-4">
              {/* Question Header */}
              <div className="flex items-center justify-between text-xs pb-3 border-b border-surface-subtle dark:border-stone-800">
                <div className="flex items-center space-x-2">
                  <span className="font-mono px-2 py-0.5 rounded bg-[#f4eadf] dark:bg-stone-800 text-[#7c4f2c] dark:text-amber-300 font-bold">
                    {currentQuizItem.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f0e0cf] dark:bg-stone-800 text-[#714628] dark:text-amber-300 text-[10px] font-bold">
                    {currentQuizItem.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[#806f61] font-mono">
                  <span>Score: <b className="text-[#7c4f2c] dark:text-amber-300">{quizScore}</b> / {quizIndex}</span>
                  <span>•</span>
                  <span>Q {quizIndex + 1} of {filteredQuiz.length}</span>
                </div>
              </div>

              {/* Question Title */}
              <div>
                <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#806f61] block mb-1">
                  Topic: {currentQuizItem.topic}
                </span>
                <h3 className="text-base sm:text-lg font-sans font-bold text-[#3b2b23] dark:text-white leading-snug">
                  {currentQuizItem.question}
                </h3>
              </div>

              {/* Options List */}
              <div className="space-y-2 pt-2">
                {currentQuizItem.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = idx === currentQuizItem.correctAnswerIndex;
                  const hasAnswered = selectedOption !== null;

                  let optionStyle = 'bg-surface-subtle dark:bg-stone-800 border-[#e3d6cb] dark:border-stone-700 text-[#3b2b23] dark:text-stone-200 hover:border-brand-400';

                  if (hasAnswered) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                    } else {
                      optionStyle = 'opacity-50 border-transparent';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={hasAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start space-x-3 ${optionStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#fffaf4] dark:bg-stone-900 border border-[#e3d6cb] dark:border-stone-700 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {hasAnswered && isSelected && !isCorrect && (
                        <XCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Immediate Explanation Box */}
              {selectedOption !== null && (
                <div className="mt-4 p-4 rounded-xl bg-[#fbf3e9]/70 dark:bg-stone-800/80 border border-[#e2c8ad]/80 dark:border-stone-700 space-y-1.5 animate-fade-in text-xs">
                  <div className="flex items-center space-x-1.5 font-bold text-[#714628] dark:text-amber-300">
                    <Sparkles size={14} />
                    <span>KL Evaluator Explanation:</span>
                  </div>
                  <p className="text-[#3b2b23] dark:text-stone-300 leading-relaxed font-sans">
                    {currentQuizItem.explanation}
                  </p>
                </div>
              )}

              {/* Next Question / Finish Action */}
              {selectedOption !== null && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuizQuestion}
                    className="px-5 py-2.5 rounded-xl bg-[#7c4f2c] hover:bg-[#7c4f2c] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all"
                  >
                    <span>{quizIndex < filteredQuiz.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          ) : isQuizFinished ? (
            /* Quiz Completed Score Card */
            <div className="bg-[#fffaf4] dark:bg-stone-900 border border-[#e3d6cb] dark:border-stone-800 rounded-2xl p-8 text-center shadow-card space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-[#f0e0cf] dark:bg-stone-800 text-[#8d5a37] dark:text-amber-300 mx-auto flex items-center justify-center">
                <Trophy size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-sans text-[#3b2b23] dark:text-white">
                  Quiz Completed!
                </h3>
                <p className="text-xs text-[#806f61] mt-1">
                  You scored <span className="font-bold text-[#7c4f2c] dark:text-amber-300 text-base">{quizScore}</span> out of {filteredQuiz.length} questions ({Math.round((quizScore / (filteredQuiz.length || 1)) * 100)}%).
                </p>
              </div>

              <div className="max-w-xs mx-auto p-3 rounded-xl bg-surface-subtle dark:bg-stone-800 text-xs text-[#806f61]">
                {quizScore >= filteredQuiz.length * 0.8
                  ? '🌟 Outstanding! You have mastered these KL In-Sem concepts.'
                  : '💡 Good effort! Review your notes and retry to achieve 100% mastery.'}
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleRestartQuiz}
                  className="px-4 py-2.5 rounded-xl bg-[#7c4f2c] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm hover:bg-[#7c4f2c]"
                >
                  <RefreshCw size={14} />
                  <span>Restart Quiz</span>
                </button>
                <button
                  onClick={() => onNavigate('select-subject')}
                  className="px-4 py-2.5 rounded-xl border border-[#e3d6cb] dark:border-stone-800 bg-[#fffaf4] dark:bg-stone-900 text-[#3b2b23] dark:text-stone-200 font-bold text-xs hover:bg-surface-subtle"
                >
                  <span>Study Notes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#fffaf4] dark:bg-stone-900 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 p-6">
              <p className="text-xs text-[#806f61]">No quiz questions found for {deptFilter}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

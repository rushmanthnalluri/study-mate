import React, { useState } from 'react';
import { Subject, ScreenId, ExamQuestion } from '../types';
import { ArrowLeft, Sparkles, ArrowRight, HelpCircle, Layers, FileCheck, Check } from 'lucide-react';

interface EnterTopicScreenProps {
  subject: Subject | null;
  onNavigate: (screen: ScreenId) => void;
  onGenerate: (topic: string) => void;
  isLoading: boolean;
}

export const EnterTopicScreen: React.FC<EnterTopicScreenProps> = ({
  subject,
  onNavigate,
  onGenerate,
  isLoading
}) => {
  const [topicInput, setTopicInput] = useState('');

  if (!subject) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-base font-semibold text-[#3b2b23]">No subject selected</h3>
        <p className="text-xs text-[#806f61]">Please choose a subject first from the knowledge base.</p>
        <button
          onClick={() => onNavigate('select-subject')}
          className="bg-[#7c4f2c] text-white px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Select a Subject
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topicInput.trim()) {
      onGenerate(topicInput.trim());
    }
  };

  const handleSelectQuestion = (q: ExamQuestion) => {
    setTopicInput(q.topic);
  };

  const sampleQuestions = subject.questionBank || [];

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          onClick={() => onNavigate('select-subject')}
          className="p-1.5 rounded-lg border border-[#e3d6cb] bg-[#fffaf4] text-[#806f61] hover:text-[#3b2b23] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#7c4f2c]">
            Step 03 of 06
          </span>
          <h1 className="text-xl font-sans font-bold text-[#3b2b23] leading-tight">
            Enter Topic
          </h1>
        </div>
      </div>

      {/* Selected Subject Context Card */}
      <div className="bg-[#fffaf4] border border-[#d7b99d] rounded-xl p-3.5 shadow-sm flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-[#806f61]">
              {subject.code}
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[#7c4f2c]">
              {subject.department}
            </span>
          </div>
          <h3 className="text-xs font-bold text-[#3b2b23]">
            {subject.name}
          </h3>
        </div>
        <button
          onClick={() => onNavigate('select-subject')}
          className="text-xs text-[#7c4f2c] hover:underline font-medium"
        >
          Change
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#3b2b23] mb-1">
            Topic or Past Exam Question
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. Banker's Algorithm safety steps, AVL tree rotations, Nyquist criterion, or paste an exact question..."
              className="w-full bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-3 text-xs text-[#3b2b23] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 shadow-sm leading-relaxed"
            />
          </div>
          <p className="text-[11px] text-[#806f61] mt-1 italic">
            Tip: Type any topic or tap any previous KL exam question below.
          </p>
        </div>

        {/* Blueprint Scope Checklist */}
        <div className="bg-surface-subtle border border-[#e3d6cb] rounded-xl p-3 space-y-2">
          <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[#806f61]">
            Outputs Generated in KL Exam Format
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[#3b2b23]">
            <div className="flex items-center space-x-1.5">
              <Check size={14} className="text-[#7c4f2c] stroke-[3]" />
              <span>2 Marks Answer (Direct)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check size={14} className="text-[#7c4f2c] stroke-[3]" />
              <span>5 Marks Answer (Structured)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check size={14} className="text-[#7c4f2c] stroke-[3]" />
              <span>10 Marks Answer (Essay)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check size={14} className="text-[#7c4f2c] stroke-[3]" />
              <span>Key Scoring Words</span>
            </div>
            <div className="flex items-center space-x-1.5 col-span-2">
              <Check size={14} className="text-[#7c4f2c] stroke-[3]" />
              <span>Process Flowchart / Diagram</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={!topicInput.trim() || isLoading}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.98] ${
            !topicInput.trim() || isLoading
              ? 'bg-surface-border text-[#806f61] cursor-not-allowed'
              : 'bg-[#7c4f2c] text-white hover:bg-[#7c4f2c] ring-2 ring-brand-800/20'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Grounding in KL Knowledge Base...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} className="text-amber-300" />
              <span>Generate KL Exam Notes</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      {/* Suggested Questions from KL Previous Papers */}
      {sampleQuestions.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-sans uppercase tracking-wider font-bold text-[#806f61] flex items-center space-x-1.5">
              <FileCheck size={14} className="text-[#7c4f2c]" />
              <span>From KL University Previous Papers</span>
            </h3>
            <span className="text-[10px] text-[#806f61] font-mono">
              {sampleQuestions.length} Questions
            </span>
          </div>

          <div className="space-y-2">
            {sampleQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-3 shadow-sm hover:border-brand-300 transition-all cursor-pointer group text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#f0e0cf] text-[#7c4f2c] font-mono">
                      {q.marks} Marks
                    </span>
                    <span className="text-[9px] text-[#806f61] font-sans">
                      Unit {q.unit}
                    </span>
                  </div>
                  <span className="text-[9px] text-stone-400 italic">
                    {q.paperYear}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#3b2b23] group-hover:text-[#7c4f2c] transition-colors line-clamp-2">
                  {q.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

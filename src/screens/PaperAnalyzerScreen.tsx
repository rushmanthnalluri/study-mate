import React, { useState } from 'react';
import { Department, ScreenId, Subject } from '../types';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ArrowRight,
  Search,
  Filter,
  Layers,
  BookOpen,
  FileCheck,
  HelpCircle,
  Clock
} from 'lucide-react';

interface PaperAnalyzerScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  onGenerateQuestion: (topic: string, subjectName: string, dept: Department) => void;
}

export const PaperAnalyzerScreen: React.FC<PaperAnalyzerScreenProps> = ({
  onNavigate,
  subjects,
  onGenerateQuestion
}) => {
  const [selectedDept, setSelectedDept] = useState<Department>('All');
  const [customText, setCustomText] = useState('');
  const [docTitle, setDocTitle] = useState('Uploaded Document');
  const [targetSubject, setTargetSubject] = useState(subjects[0]?.name || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    keyDefinitions: { term: string; def: string }[];
    questions: Array<{ text: string; marks: 2 | 5 | 10; unit: number }>;
  } | null>(null);

  // Collect all questions from knowledge base
  const allPaperQuestions = subjects.flatMap((s) =>
    (s.questionBank || []).map((q) => ({
      text: q.question,
      marks: q.marks,
      unit: q.unit,
      subject: s.name,
      dept: s.department
    }))
  );

  const filteredQuestions = allPaperQuestions.filter(
    (q) => selectedDept === 'All' || q.dept === selectedDept
  );

  const handleAnalyzeText = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customText.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      const lines = customText.split('\n').map((line) => line.trim()).filter((line) => line.length > 10);
      const parsedQuestions = lines
        .filter((line) => /\?|^(?:\d+[\.\)]|Q(?:uestion)?\s*\d*)/i.test(line))
        .map((line, idx) => {
          let marks: 2 | 5 | 10 = 5;
          if (/define|what is|state|list/i.test(line)) marks = 2;
          else if (/explain in detail|derive|demonstrate|discuss in detail|comprehensive/i.test(line)) marks = 10;
          return { text: line.replace(/^(?:Q(?:uestion)?\s*)?\d*[\.\)]?\s*/i, ''), marks, unit: (idx % 5) + 1 };
        });

      const keyDefinitions = lines
        .map((line) => {
          const match = line.match(/^([^:—–-]{2,80})\s*(?::|—|–|- )\s*(.{10,240})$/);
          return match ? { term: match[1].trim(), def: match[2].trim() } : null;
        })
        .filter((item): item is { term: string; def: string } => Boolean(item))
        .slice(0, 6);

      const summaryText = lines.slice(0, 3).join(' ');
      const wordCount = customText.trim().split(/\s+/).filter(Boolean).length;
      setAnalysisResult({
        summary: summaryText
          ? 'Parsed ' + docTitle + ' from the text you supplied: ' + wordCount.toLocaleString() + ' words across ' + lines.length + ' non-empty lines. Opening material: ' + summaryText.slice(0, 700)
          : 'No analyzable text was found in ' + docTitle + '.',
        keyDefinitions,
        questions: parsedQuestions
      });
      setIsAnalyzing(false);
    }, 500);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          type="button"
          aria-label="Back to home"
          onClick={() => onNavigate('home')}
          className="p-1.5 rounded-lg border border-[var(--border)] bg-[#ffffff] dark:bg-[var(--foreground)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[var(--accent)] ">
            Document & Exam Parser
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] dark:text-white leading-tight">
            Lecture & Paper Analyzer
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Paste text from professor slides, notes, or question papers to extract key definitions and 2M/5M/10M exam-question candidates. Real PDF files should be uploaded through Study Studio.
      </p>

      <div className="bg-[#fbf3e9]/60 dark:bg-[var(--foreground)]/60 border border-[#e2c8ad] dark:border-[var(--border)] rounded-2xl p-3.5">
        <p className="text-[11px] leading-5 text-[#714628] ">
          Need to analyze a real PDF? Open <button type="button" onClick={() => onNavigate('studio')} className="font-extrabold underline underline-offset-2">Study Studio</button> and upload it to your private source library. This analyzer intentionally uses real pasted text rather than fabricated sample documents.
        </p>
      </div>

      {/* Upload or Paste Box */}
      <div className="bg-[#ffffff] dark:bg-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--foreground)] dark:text-white flex items-center space-x-1.5">
            <UploadCloud size={16} className="text-[var(--accent)] " />
            <span>Document / Slide Text</span>
          </span>
          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
            Auto-extracts 2M, 5M, 10M
          </span>
        </div>

        <form onSubmit={handleAnalyzeText} className="space-y-2.5">
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste text from lecture slides, syllabus notes, or question papers..."
            className="w-full bg-surface-subtle dark:bg-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] rounded-xl p-3 text-xs text-[var(--foreground)] dark:text-white placeholder-surface-muted focus:outline-none focus:ring-1 focus:ring-brand-800 leading-relaxed"
          />
          <button
            type="submit"
            disabled={!customText.trim() || isAnalyzing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-[var(--accent)] text-white hover:bg-[var(--accent)] transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>{isAnalyzing ? 'Extracting Exam High-Yields...' : 'Analyze Document & Extract Questions'}</span>
          </button>
        </form>

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="pt-3 border-t border-surface-subtle dark:border-[var(--border)] space-y-3 animate-fade-in">
            {/* Executive Summary */}
            <div className="bg-[var(--muted)]/60 dark:bg-[var(--foreground)]/80 p-3 rounded-xl border border-[#d7b99d]/60 dark:border-[var(--border)] space-y-1">
              <span className="text-[11px] font-bold text-[var(--accent)]  flex items-center space-x-1">
                <FileCheck size={14} />
                <span>Executive Academic Summary:</span>
              </span>
              <p className="text-xs text-[var(--foreground)] dark:text-[var(--card)] leading-relaxed font-sans">
                {analysisResult.summary}
              </p>
            </div>

            {/* Key Definitions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--foreground)] dark:text-white">
                Key Exam Definitions Identified:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {analysisResult.keyDefinitions.map((kd, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-[var(--border)] dark:border-[var(--border)] bg-surface-subtle dark:bg-[var(--foreground)]/60 text-xs"
                  >
                    <span className="font-bold block text-[var(--accent)]  mb-0.5">
                      {kd.term}
                    </span>
                    <span className="text-[11px] text-[var(--muted-foreground)] leading-tight block">
                      {kd.def}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Exam Questions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 size={13} />
                  <span>Potential Exam Questions ({analysisResult.questions.length}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('flashcards')}
                  className="text-xs font-bold text-[var(--accent)]  hover:underline flex items-center space-x-1"
                >
                  <Layers size={13} />
                  <span>Open Quiz with these</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {analysisResult.questions.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => onGenerateQuestion(q.text, targetSubject, selectedDept === 'All' ? (subjects.find(s => s.name === targetSubject)?.department || '') : selectedDept)}
                    className="bg-surface-subtle dark:bg-[var(--foreground)]/80 border border-[var(--border)] dark:border-[var(--border)] p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-400 group"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#f0e0cf] text-[var(--accent)] font-mono">
                        {q.marks} Marks
                      </span>
                      <p className="text-xs text-[var(--foreground)] dark:text-[var(--card)] group-hover:text-[var(--accent)] transition-colors">
                        {q.text}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--muted-foreground)] group-hover:text-[var(--accent)] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KL Previous Exam Question Bank Explorer */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-sans font-bold text-[var(--foreground)] dark:text-white flex items-center space-x-1.5">
            <BookOpen size={16} className="text-[var(--accent)] " />
            <span>Official KL Previous Papers Archive</span>
          </h3>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {filteredQuestions.length} Questions
          </span>
        </div>

        {/* Department Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...Array.from(new Set(subjects.map(subject => subject.department).filter(Boolean)))].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept as Department)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-[var(--accent)] text-white shadow-sm'
                  : 'bg-[#ffffff] dark:bg-[var(--foreground)] text-[var(--foreground)] dark:text-[var(--card)] border border-[var(--border)] dark:border-[var(--border)]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Questions Catalog */}
        <div className="space-y-2">
          {filteredQuestions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => onGenerateQuestion(q.text, q.subject, q.dept)}
              className="bg-[#ffffff] dark:bg-[var(--foreground)] border border-[var(--border)] dark:border-[var(--border)] rounded-xl p-3 shadow-sm hover:border-brand-400 cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#f0e0cf] text-[var(--accent)]">
                    {q.marks} Marks
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] font-sans">
                    {q.dept} • {q.subject}
                  </span>
                </div>
                <span className="text-[9px] text-[var(--muted-foreground)] font-mono">
                  Unit {q.unit}
                </span>
              </div>
              <p className="text-xs font-semibold text-[var(--foreground)] dark:text-[var(--card)] group-hover:text-[var(--accent)] transition-colors leading-relaxed">
                {q.text}
              </p>
              <div className="mt-2 pt-1.5 border-t border-surface-subtle dark:border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--accent)]  font-medium">
                <span>Generate Model Answer</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

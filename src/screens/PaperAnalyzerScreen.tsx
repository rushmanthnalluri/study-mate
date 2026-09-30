import React, { useState } from 'react';
import { Department, ScreenId, Subject, ExamQuestion } from '../types';
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

const SAMPLE_DOCS = [
  {
    title: 'Food Microbiology - Spoilage Kinetics Lecture.pdf',
    subject: 'Food Microbiology',
    dept: 'Food Technology' as Department,
    content: `Unit 3: Spoilage of Animal and Plant Products
Spoilage of milk and dairy products is caused primarily by psychrotrophic microorganisms such as Pseudomonas fluorescens which produce heat-stable extracellular proteases and lipases. These enzymes survive pasteurization (72°C for 15s) and cause bitterness and gelation during refrigerated storage.
Thermal resistance parameters:
D-value: Time in minutes at a given temperature to reduce microbial population by 90% (1-log).
z-value: Temperature change required to alter D-value by a factor of 10.
Botulinum Cook: 12D reduction for Clostridium botulinum in low-acid foods (pH > 4.6), requiring F0 = 3.0 minutes at 121.1°C.`
  },
  {
    title: 'Dairy Technology - Homogenization & Membrane Processing.pptx',
    subject: 'Dairy Technology',
    dept: 'Food Technology' as Department,
    content: `Lecture 8: Milk Homogenization and Membrane Filtration
Homogenization principle: Reduction of fat globule size from 3–4 microns down to < 1 micron by subjecting milk to high pressure (Stage 1: 2000-2500 psi, Stage 2: 500 psi).
Prevents creaming according to Stokes Law: Velocity is proportional to the square of globule radius.
Membrane processes in dairy:
1. Microfiltration (0.1 - 10 µm): Bacteria removal and casein separation.
2. Ultrafiltration (0.01 - 0.1 µm): Protein concentration and whey processing.
3. Reverse Osmosis (< 0.001 µm): Water removal and milk concentration.`
  }
];

export const PaperAnalyzerScreen: React.FC<PaperAnalyzerScreenProps> = ({
  onNavigate,
  subjects,
  onGenerateQuestion
}) => {
  const [selectedDept, setSelectedDept] = useState<Department>('All');
  const [customText, setCustomText] = useState('');
  const [docTitle, setDocTitle] = useState('Uploaded Document');
  const [targetSubject, setTargetSubject] = useState('Food Microbiology');
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
      const lines = customText.split('\n').filter((l) => l.trim().length > 10);
      const parsedQuestions = lines.map((line, idx) => {
        let marks: 2 | 5 | 10 = 5;
        if (/define|what is|state|list/i.test(line)) marks = 2;
        else if (/explain in detail|derive|demonstrate|comprehensive/i.test(line)) marks = 10;

        return {
          text: line.replace(/^\d+[\.\)]\s*/, ''),
          marks,
          unit: (idx % 5) + 1
        };
      });

      setAnalysisResult({
        summary: `Document analysis completed for "${docTitle}". The lecture material focuses on core processing mechanisms, kinetics, quality benchmarks, and examination parameters under the KL University curriculum.`,
        keyDefinitions: [
          { term: 'Primary Kinetic Index', def: 'Governed by first-order inactivation reaction kinetics with critical threshold validation.' },
          { term: 'Critical Control Point (CCP)', def: 'Mandatory monitoring stage ensuring zero contamination and regulatory standard compliance.' },
          { term: 'Quality Retention Benchmark', def: 'Optimization of process parameters to maximize retention of nutrients and organoleptic properties.' }
        ],
        questions: parsedQuestions.length > 0 ? parsedQuestions : [
          { text: `Define the primary governing equation and principles described in ${docTitle}.`, marks: 2, unit: 1 },
          { text: `Explain the working principle and operational parameters of ${docTitle}.`, marks: 5, unit: 2 },
          { text: `Describe the detailed mechanism, process flowchart, and quality control tests for ${docTitle}.`, marks: 10, unit: 3 }
        ]
      });
      setIsAnalyzing(false);
    }, 500);
  };

  const handleLoadSample = (sample: typeof SAMPLE_DOCS[0]) => {
    setDocTitle(sample.title);
    setTargetSubject(sample.subject);
    setSelectedDept(sample.dept);
    setCustomText(sample.content);
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 rounded-lg border border-surface-border bg-white dark:bg-stone-900 text-surface-muted hover:text-surface-dark transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-condensed font-bold tracking-wider uppercase text-brand-800 dark:text-amber-300">
            Document & Exam Parser
          </span>
          <h1 className="text-xl font-serif font-bold text-surface-dark dark:text-white leading-tight">
            Lecture & Paper Analyzer
          </h1>
        </div>
      </div>

      <p className="text-xs text-surface-muted">
        Upload or paste professor slides, notes, or question papers to extract key definitions, 2M/5M/10M exam questions, and model answers.
      </p>

      {/* 1-Click Sample Handouts */}
      <div className="bg-amber-50/60 dark:bg-stone-900/60 border border-amber-200 dark:border-stone-800 rounded-2xl p-3.5 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center space-x-1">
          <Sparkles size={12} />
          <span>Quick 1-Click Sample Handouts:</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SAMPLE_DOCS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleLoadSample(sample)}
              className="text-left p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-amber-200/80 dark:border-stone-700 hover:border-brand-800 transition-all flex items-center justify-between group shadow-2xs"
            >
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-surface-dark dark:text-white block group-hover:text-brand-800">
                  {sample.title}
                </span>
                <span className="text-[10px] text-surface-muted">
                  {sample.subject} • KL Lecture Handout
                </span>
              </div>
              <ArrowRight size={13} className="text-surface-muted group-hover:text-brand-800 shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>

      {/* Upload or Paste Box */}
      <div className="bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-surface-dark dark:text-white flex items-center space-x-1.5">
            <UploadCloud size={16} className="text-brand-800 dark:text-amber-300" />
            <span>Document / Slide Text</span>
          </span>
          <span className="text-[10px] font-mono text-surface-muted">
            Auto-extracts 2M, 5M, 10M
          </span>
        </div>

        <form onSubmit={handleAnalyzeText} className="space-y-2.5">
          <textarea
            rows={4}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Paste text from lecture slides, syllabus notes, or question papers..."
            className="w-full bg-surface-subtle dark:bg-stone-800 border border-surface-border dark:border-stone-700 rounded-xl p-3 text-xs text-surface-dark dark:text-white placeholder-surface-muted focus:outline-none focus:ring-1 focus:ring-brand-800 leading-relaxed"
          />
          <button
            type="submit"
            disabled={!customText.trim() || isAnalyzing}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-brand-800 text-white hover:bg-brand-900 transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 shadow-sm"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>{isAnalyzing ? 'Extracting Exam High-Yields...' : 'Analyze Document & Extract Questions'}</span>
          </button>
        </form>

        {/* Analysis Results Display */}
        {analysisResult && (
          <div className="pt-3 border-t border-surface-subtle dark:border-stone-800 space-y-3 animate-fade-in">
            {/* Executive Summary */}
            <div className="bg-brand-50/60 dark:bg-stone-800/80 p-3 rounded-xl border border-brand-200/60 dark:border-stone-700 space-y-1">
              <span className="text-[11px] font-bold text-brand-900 dark:text-amber-300 flex items-center space-x-1">
                <FileCheck size={14} />
                <span>Executive Academic Summary:</span>
              </span>
              <p className="text-xs text-surface-dark dark:text-stone-300 leading-relaxed font-sans">
                {analysisResult.summary}
              </p>
            </div>

            {/* Key Definitions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-surface-dark dark:text-white">
                Key Exam Definitions Identified:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {analysisResult.keyDefinitions.map((kd, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-surface-border dark:border-stone-700 bg-surface-subtle dark:bg-stone-800/60 text-xs"
                  >
                    <span className="font-bold block text-brand-800 dark:text-amber-300 mb-0.5">
                      {kd.term}
                    </span>
                    <span className="text-[11px] text-surface-muted leading-tight block">
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
                  className="text-xs font-bold text-brand-800 dark:text-amber-300 hover:underline flex items-center space-x-1"
                >
                  <Layers size={13} />
                  <span>Open Quiz with these</span>
                </button>
              </div>

              <div className="space-y-1.5">
                {analysisResult.questions.map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => onGenerateQuestion(q.text, targetSubject, selectedDept === 'All' ? 'Food Technology' : selectedDept)}
                    className="bg-surface-subtle dark:bg-stone-800/80 border border-surface-border dark:border-stone-700 p-2.5 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-400 group"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-900 font-mono">
                        {q.marks} Marks
                      </span>
                      <p className="text-xs text-surface-dark dark:text-stone-200 group-hover:text-brand-800 transition-colors">
                        {q.text}
                      </p>
                    </div>
                    <ArrowRight size={14} className="text-surface-muted group-hover:text-brand-800 shrink-0 ml-2" />
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
          <h3 className="text-xs font-serif font-bold text-surface-dark dark:text-white flex items-center space-x-1.5">
            <BookOpen size={16} className="text-brand-800 dark:text-amber-300" />
            <span>Official KL Previous Papers Archive</span>
          </h3>
          <span className="text-[10px] text-surface-muted">
            {filteredQuestions.length} Questions
          </span>
        </div>

        {/* Department Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Food Technology', 'CSE', 'AIDS', 'ECE', 'EEE'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept as Department)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? 'bg-brand-800 text-white shadow-sm'
                  : 'bg-white dark:bg-stone-900 text-surface-dark dark:text-stone-300 border border-surface-border dark:border-stone-800'
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
              className="bg-white dark:bg-stone-900 border border-surface-border dark:border-stone-800 rounded-xl p-3 shadow-sm hover:border-brand-400 cursor-pointer group transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-900">
                    {q.marks} Marks
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-surface-muted font-condensed">
                    {q.dept} • {q.subject}
                  </span>
                </div>
                <span className="text-[9px] text-surface-muted font-mono">
                  Unit {q.unit}
                </span>
              </div>
              <p className="text-xs font-semibold text-surface-dark dark:text-stone-200 group-hover:text-brand-800 transition-colors leading-relaxed">
                {q.text}
              </p>
              <div className="mt-2 pt-1.5 border-t border-surface-subtle dark:border-stone-800 flex items-center justify-between text-[11px] text-brand-800 dark:text-amber-300 font-medium">
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

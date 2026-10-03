import React, { useState } from 'react';
import { Department, ScreenId, Subject, ExamNote } from '../types';
import {
  FileText,
  Printer,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { MermaidViewer } from '../components/MermaidViewer';

interface MockExamScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  selectedDepartment: Department;
  onOpenGeneratedNote: (topic: string, subjectName: string, dept: Department) => void;
}

export const MockExamScreen: React.FC<MockExamScreenProps> = ({
  onNavigate,
  subjects,
  selectedDepartment,
  onOpenGeneratedNote
}) => {
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [selectedSubjId, setSelectedSubjId] = useState<string>(subjects[0]?.id || '');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const filteredSubjects = subjects.filter(
    (s) => deptFilter === 'All' || s.department === deptFilter
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjId) || filteredSubjects[0] || subjects[0];

  // Synthesize realistic KL Exam Paper structure: Part A (2M), Part B (5M), Part C (10M)
  const partAQuestions = [
    {
      id: 'pa-1',
      num: '1.(a)',
      text: `Define the primary governing principle of ${activeSubject.topics?.[0] || activeSubject.name}.`,
      marks: 2,
      co: 'CO1',
      btl: 'BTL 1 (Remember)'
    },
    {
      id: 'pa-2',
      num: '1.(b)',
      text: `State the standard mathematical relationship and boundary constraints for ${activeSubject.topics?.[1] || 'state stability'}.`,
      marks: 2,
      co: 'CO2',
      btl: 'BTL 1 (Remember)'
    },
    {
      id: 'pa-3',
      num: '1.(c)',
      text: `Mention two critical parameters checked during ${activeSubject.topics?.[2] || 'system verification'}.`,
      marks: 2,
      co: 'CO3',
      btl: 'BTL 2 (Understand)'
    },
    {
      id: 'pa-4',
      num: '1.(d)',
      text: `What is the significance of boundary condition verification in ${activeSubject.name}?`,
      marks: 2,
      co: 'CO4',
      btl: 'BTL 2 (Understand)'
    },
    {
      id: 'pa-5',
      num: '1.(e)',
      text: `State the allowable tolerance or metric range required under KL academic standards.`,
      marks: 2,
      co: 'CO5',
      btl: 'BTL 1 (Remember)'
    }
  ];

  const partBQuestions = [
    {
      id: 'pb-1',
      num: '2',
      text: `Explain the structured operational phases and working mechanism of ${activeSubject.topics?.[0] || 'the core process'}. Draw a concise block flowchart.`,
      marks: 5,
      co: 'CO2',
      btl: 'BTL 3 (Apply)'
    },
    {
      id: 'pb-2',
      num: '3',
      text: `Compare and contrast conventional algorithms versus modern optimized approaches in ${activeSubject.name}. List 4 key differences.`,
      marks: 5,
      co: 'CO3',
      btl: 'BTL 4 (Analyze)'
    },
    {
      id: 'pb-3',
      num: '4',
      text: `Derive the fundamental governing equations for ${activeSubject.topics?.[1] || 'parameter response'} with clear definition of symbols.`,
      marks: 5,
      co: 'CO4',
      btl: 'BTL 3 (Apply)'
    }
  ];

  const partCQuestions = [
    {
      id: 'pc-1',
      num: '5',
      text: `Explain ${activeSubject.topics?.[0] || 'the foundational mechanism'} in detail with its mathematical formulation, step-by-step pipeline execution, architectural diagram, and practical industrial applications.`,
      marks: 10,
      co: 'CO3',
      btl: 'BTL 4 (Analyze / Evaluate)'
    },
    {
      id: 'pc-2',
      num: '6',
      text: `Formulate a comprehensive case study on ${activeSubject.topics?.[1] || 'system failure recovery'}. Detail trade-offs, stability criteria, and evaluator conclusion.`,
      marks: 10,
      co: 'CO5',
      btl: 'BTL 4 (Analyze)'
    }
  ];

  const toggleExpand = (id: string) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 pb-28 animate-fade-in print:p-0 print:m-0">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-1 print:hidden">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg border border-[#e3d6cb] bg-[#ffffff] text-[#64748b] hover:text-[#172554] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#2563eb]">
              Exam Simulation
            </span>
            <h1 className="text-lg font-sans font-bold text-[#172554] leading-tight">
              KL Full Mock Exam Paper
            </h1>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e3d6cb] bg-[#ffffff] text-[#172554] hover:bg-surface-subtle transition-colors shadow-2xs"
        >
          <Printer size={15} />
          <span>Print / PDF</span>
        </button>
      </div>

      {/* Subject Selector Bar */}
      <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-3 shadow-sm space-y-2 print:hidden">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#172554] flex items-center space-x-1.5">
            <BookOpen size={14} className="text-[#2563eb]" />
            <span>Select Examination Course:</span>
          </label>
          <span className="text-[10px] font-mono text-[#64748b]">
            {activeSubject.code}
          </span>
        </div>
        <select
          value={activeSubject.id}
          onChange={(e) => setSelectedSubjId(e.target.value)}
          className="w-full bg-surface-subtle border border-[#e3d6cb] rounded-lg p-2 text-xs font-medium text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) — {s.department}
            </option>
          ))}
        </select>
      </div>

      {/* The Official KL University Exam Paper Sheet */}
      <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-2xl p-5 sm:p-7 shadow-elevated space-y-5 print:border-none print:shadow-none print:p-0">
        {/* Official KL Header */}
        <div className="text-center border-b-2 border-stone-800 pb-4 space-y-1">
          <h2 className="text-sm sm:text-base font-sans font-extrabold uppercase tracking-wide text-stone-900">
            KONERU LAKSHMAIAH EDUCATION FOUNDATION
          </h2>
          <p className="text-[11px] text-stone-700 italic font-sans">
            (Deemed to be University, Estd. u/s 3 of UGC Act, 1956)
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-[#2563eb] pt-1">
            Department of {activeSubject.department}
          </p>
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 font-sans">
            End Semester Examination — {activeSubject.name} ({activeSubject.code})
          </h3>
          <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-stone-800 border-t border-stone-300 mt-2">
            <span>Time: 3 Hours</span>
            <span>Regulation: 2021-2026</span>
            <span>Max Marks: 75</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-[11px] text-stone-600 italic bg-surface-subtle p-2.5 rounded-lg border border-[#e3d6cb]/50">
          <p>Instructions: (1) Answer ALL questions in Part A. (2) Answer any THREE in Part B and TWO in Part C. (3) Draw neat diagrams wherever necessary.</p>
        </div>

        {/* PART A: 5 x 2 = 10 Marks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#f1e5da] px-3 py-1.5 rounded-md border border-[#e3d6cb]">
            <span className="text-xs font-bold uppercase font-sans tracking-wider text-stone-900">
              PART – A (Compulsory: 5 × 2 = 10 Marks)
            </span>
            <span className="text-[10px] font-mono text-stone-600">Cognitive Level: BTL 1 & 2</span>
          </div>

          <div className="space-y-2 text-xs">
            {partAQuestions.map((q) => (
              <div
                key={q.id}
                className="border border-[#e3d6cb]/80 rounded-xl p-3 hover:border-brand-300 transition-all bg-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#2563eb]">{q.num}</span>
                      <span className="text-[9px] font-mono bg-[#e7d9cd] text-stone-700 px-1.5 py-0.2 rounded">
                        {q.co} | {q.btl}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-stone-900 leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs bg-[#eff6ff] text-[#2563eb] px-2 py-0.5 rounded border border-[#d7b99d]">
                      {q.marks}M
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#e3d6cb]/50 flex justify-end print:hidden">
                  <button
                    onClick={() => onOpenGeneratedNote(q.text, activeSubject.name, activeSubject.department)}
                    className="text-[11px] font-semibold text-[#2563eb] hover:underline flex items-center space-x-1"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>View KL Model 2M Answer & Rubric</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PART B: 5 x 5 = 25 Marks */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between bg-[#f1e5da] px-3 py-1.5 rounded-md border border-[#e3d6cb]">
            <span className="text-xs font-bold uppercase font-sans tracking-wider text-stone-900">
              PART – B (Descriptive: 5 Marks Each)
            </span>
            <span className="text-[10px] font-mono text-stone-600">Cognitive Level: BTL 3 & 4</span>
          </div>

          <div className="space-y-2 text-xs">
            {partBQuestions.map((q) => (
              <div
                key={q.id}
                className="border border-[#e3d6cb]/80 rounded-xl p-3 hover:border-brand-300 transition-all bg-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#2563eb]">Q{q.num}.</span>
                      <span className="text-[9px] font-mono bg-[#e7d9cd] text-stone-700 px-1.5 py-0.2 rounded">
                        {q.co} | {q.btl}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-stone-900 leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs bg-purple-50 text-purple-900 px-2 py-0.5 rounded border border-purple-200">
                      {q.marks}M
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-[#e3d6cb]/50 flex justify-end print:hidden">
                  <button
                    onClick={() => onOpenGeneratedNote(q.text, activeSubject.name, activeSubject.department)}
                    className="text-[11px] font-semibold text-[#2563eb] hover:underline flex items-center space-x-1"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>View KL Model 5M Structured Answer</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PART C: 4 x 10 = 40 Marks */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between bg-[#f1e5da] px-3 py-1.5 rounded-md border border-[#e3d6cb]">
            <span className="text-xs font-bold uppercase font-sans tracking-wider text-stone-900">
              PART – C (Comprehensive Essays: 10 Marks Each)
            </span>
            <span className="text-[10px] font-mono text-stone-600">Cognitive Level: BTL 4 & 5</span>
          </div>

          <div className="space-y-2 text-xs">
            {partCQuestions.map((q) => (
              <div
                key={q.id}
                className="border border-[#e3d6cb]/80 rounded-xl p-3.5 hover:border-brand-300 transition-all bg-surface"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#2563eb]">Q{q.num}.</span>
                      <span className="text-[9px] font-mono bg-[#e7d9cd] text-stone-700 px-1.5 py-0.2 rounded">
                        {q.co} | {q.btl}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-stone-900 leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200">
                      {q.marks}M
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#e3d6cb]/50 flex justify-end print:hidden">
                  <button
                    onClick={() => onOpenGeneratedNote(q.text, activeSubject.name, activeSubject.department)}
                    className="text-[11px] font-semibold text-[#2563eb] hover:underline flex items-center space-x-1"
                  >
                    <Sparkles size={12} className="text-amber-500" />
                    <span>Generate Full 10M Essay & Diagram</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paper End Stamp */}
        <div className="text-center pt-4 text-xs font-mono font-bold text-stone-500 tracking-widest uppercase">
          *** END OF EXAMINATION QUESTION PAPER ***
        </div>
      </div>
    </div>
  );
};

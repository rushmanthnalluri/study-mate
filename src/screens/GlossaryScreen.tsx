import React, { useState } from 'react';
import { Department, ScreenId } from '../types';
import { Search, BookMarked, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface GlossaryScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onGenerateForTerm: (term: string, dept: Department) => void;
  selectedDepartment: Department;
}

interface GlossaryTerm {
  term: string;
  department: Department;
  subject: string;
  definition: string;
  keyRule: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  // CSE
  {
    term: "Belady's Anomaly",
    department: "CSE",
    subject: "Operating Systems",
    definition: "The phenomenon where increasing the number of physical page frames results in an increase (rather than decrease) in the number of page faults for certain memory access patterns under FIFO page replacement.",
    keyRule: "Does not occur in Stack algorithms like LRU and Optimal."
  },
  {
    term: "Critical Section",
    department: "CSE",
    subject: "Operating Systems",
    definition: "A segment of code in multi-threaded processes that accesses shared resources (memory, files) that must not be concurrently executed by more than one process.",
    keyRule: "Must satisfy Mutual Exclusion, Progress, and Bounded Waiting."
  },
  {
    term: "B+ Tree Index",
    department: "CSE",
    subject: "Database Management Systems",
    definition: "A self-balancing search tree where all data records are stored exclusively in leaf nodes linked as a doubly linked list, while internal nodes store only search keys and routing pointers.",
    keyRule: "Enables logarithmic O(log N) point queries and high-speed range scans."
  },

  // AI & DS
  {
    term: "Kernel Trick",
    department: "AIDS",
    subject: "Machine Learning",
    definition: "A mathematical technique that maps non-linearly separable inputs into a high-dimensional Hilbert feature space where a linear hyperplane can separate the classes, without explicitly computing the coordinates.",
    keyRule: "Computed via inner product K(x, z) = phi(x)^T phi(z)."
  },
  {
    term: "Self-Attention Mechanism",
    department: "AIDS",
    subject: "Deep Learning",
    definition: "An attention mechanism in Transformer models that computes representation by correlating different positions of a single sequence using Query (Q), Key (K), and Value (V) projections.",
    keyRule: "Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) V."
  },

  // ECE
  {
    term: "Twiddle Factor",
    department: "ECE",
    subject: "Digital Signal Processing",
    definition: "The complex trigonometric multiplier W_N = e^(-j 2π / N) used in Discrete Fourier Transform and Fast Fourier Transform algorithms.",
    keyRule: "Satisfies symmetry W_N^(k + N/2) = -W_N^k and periodicity W_N^(k+N) = W_N^k."
  },
  {
    term: "Euler Path Stick Diagram",
    department: "ECE",
    subject: "VLSI Design",
    definition: "A graph-theoretic traversal path that visits every transistor drain/source diffusion edge exactly once to enable uninterrupted diffusion strips in CMOS layout.",
    keyRule: "Minimizes parasitic layout capacitance and silicon area."
  },

  // EEE
  {
    term: "Ferranti Effect",
    department: "EEE",
    subject: "Power Systems",
    definition: "An anomalous voltage rise where receiving-end voltage exceeds sending-end voltage in unloaded or lightly loaded long transmission lines.",
    keyRule: "Neutralized by installing shunt reactors at the receiving substation."
  },
  {
    term: "Routh-Hurwitz Array",
    department: "EEE",
    subject: "Control Systems",
    definition: "A tabular algebraic method to determine the number of closed-loop poles in the right-half s-plane without factoring the characteristic polynomial.",
    keyRule: "The number of right-half plane poles equals the number of sign changes in the first column."
  },

];

export const GlossaryScreen: React.FC<GlossaryScreenProps> = ({
  onNavigate,
  onGenerateForTerm,
  selectedDepartment
}) => {
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = glossaryTerms.filter((item) => {
    const matchesDept = deptFilter === 'All' || item.department === deptFilter;
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

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
            KL Engineering Reference
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] leading-tight">
            Technical Glossary
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        High-yield technical terminology and governing principles frequently evaluated in KL exams.
      </p>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search glossary terms (e.g. Belady, Ferranti, 12D, Kernel)..."
          className="w-full bg-[#ffffff] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--foreground)] placeholder-surface-muted editorial-focus shadow-sm"
        />
      </div>

      {/* Department Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...Array.from(new Set(glossaryTerms.map(term => term.department).filter(Boolean)))].map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept as Department)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              deptFilter === dept
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[#ffffff] text-[var(--foreground)] border border-[var(--border)] hover:bg-surface-subtle'
            }`}
          >
            {dept === 'All' ? 'All Depts' : dept}
          </button>
        ))}
      </div>

      {/* Glossary Items List */}
      <div className="space-y-3 pt-1">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-2 hover:border-brand-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[var(--foreground)] font-sans">
                  {item.term}
                </span>
                <span className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--accent)]">
                  {item.department}
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                {item.subject}
              </span>
            </div>

            <p className="text-xs text-[var(--foreground)] leading-relaxed font-sans">
              {item.definition}
            </p>

            <div className="bg-surface-subtle p-2 rounded-lg border border-[var(--border)]/50 text-[11px] text-[var(--foreground)]">
              <span className="font-semibold text-[var(--accent)]">KL Evaluator Key Criterion: </span>
              <span>{item.keyRule}</span>
            </div>

            <div className="pt-2 border-t border-[var(--border)]/40 flex justify-end">
              <button
                onClick={() => onGenerateForTerm(item.term, item.department)}
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center space-x-1"
              >
                <Sparkles size={13} className="text-amber-500" />
                <span>Generate Full Exam Note</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

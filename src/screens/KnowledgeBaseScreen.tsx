import React, { useState } from 'react';
import { Department, ScreenId, Subject } from '../types';
import {
  Folder,
  FileText,
  FileCode,
  ArrowLeft,
  Search,
  BookOpen,
  Download,
  Copy,
  Check,
  Eye,
  X,
  ExternalLink,
  PlusCircle,
  Database
} from 'lucide-react';

interface KnowledgeBaseScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  selectedDepartment: Department;
}

export const KnowledgeBaseScreen: React.FC<KnowledgeBaseScreenProps> = ({
  onNavigate,
  subjects,
  selectedDepartment
}) => {
  const [deptFilter, setDeptFilter] = useState<Department>(selectedDepartment);
  const [selectedSubject, setSelectedSubject] = useState<Subject>(subjects[0]);
  const [activeFile, setActiveFile] = useState<{ name: string; type: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredSubjects = subjects.filter(
    (s) => deptFilter === 'All' || s.department === deptFilter
  );

  const currentSubject = subjects.find((s) => s.id === selectedSubject?.id) || filteredSubjects[0] || subjects[0];

  const getSubjectFiles = (subj: Subject) => {
    return [
      {
        name: 'course-materials.md',
        label: 'Course Materials',
        desc: 'Lecture notes & Bloom’s taxonomy units',
        icon: FileText,
        type: 'markdown',
        content: `# Course Materials: ${subj.name} (${subj.code})\nDepartment: ${subj.department} | KL University\n\n## Course Units\n${(subj.units || []).map((u) => `- ${u}`).join('\n')}\n\n## Syllabus Learning Outcomes\n- Understand fundamental theoretical formulations.\n- Analyze mathematical derivations under KL exam standards.\n- Formulate practical engineering implementations.`
      },
      {
        name: 'previous-papers.md',
        label: 'Previous Papers',
        desc: 'KL End-Sem & In-Sem Exam Catalog',
        icon: FileText,
        type: 'markdown',
        content: `# Previous Examination Papers — ${subj.name}\nDepartment of ${subj.department}, KL University\n\n## Catalog of Papers Mapped\n- KL End-Semester May 2024 (Regular & Supplementary)\n- KL End-Semester Dec 2023 (Odd Semester)\n- KL In-Semester Examination 1 (Mid-Term 2024)\n- KL In-Semester Examination 2 (Mid-Term 2024)\n\n## Question Structure\n- Part A: 5 questions × 2 marks = 10 marks\n- Part B: 5 questions × 5 marks = 25 marks\n- Part C: 4 questions × 10 marks = 40 marks`
      },
      {
        name: 'question-bank.json',
        label: 'Question Bank',
        desc: `${subj.questionCount || 4} Curated high-frequency questions`,
        icon: FileCode,
        type: 'json',
        content: JSON.stringify(subj.questionBank || [], null, 2)
      },
      {
        name: 'marks-pattern.md',
        label: 'Marks Pattern',
        desc: 'Official 2M, 5M, 10M grading rubrics',
        icon: FileText,
        type: 'markdown',
        content: `# KL University Marks Pattern & Grading Rubric\nSubject: ${subj.name} (${subj.code})\n\n## 2 Marks Questions\n- Target words: 20-40 words.\n- Exact definition, formula, standard units, zero fluff.\n\n## 5 Marks Questions\n- Target words: 120-180 words.\n- Subheadings, 4-5 bullet points, mini-flowchart.\n\n## 10 Marks Questions\n- Target words: 350-500 words.\n- Comprehensive essay: Intro, Principle, Mechanism, Flowchart, Industrial Applications, Conclusion.`
      },
      {
        name: 'answer-style.md',
        label: 'Answer Style',
        desc: 'KL Examiner expectations & keyword density',
        icon: FileText,
        type: 'markdown',
        content: `# KL University Examiner Answer Style Guide\nSubject: ${subj.name}\n\n1. Highlight Keywords First.\n2. Label all diagrams and state inputs, outputs, and parameters.\n3. Equations must have a legend defining variables.\n4. Avoid conversational filler; maintain high technical density.`
      },
      {
        name: 'syllabus.json',
        label: 'Syllabus & Metadata',
        desc: 'Course codes, units & taxonomy',
        icon: FileCode,
        type: 'json',
        content: JSON.stringify(
          {
            id: subj.id,
            name: subj.name,
            code: subj.code,
            department: subj.department,
            units: subj.units,
            topics: subj.topics,
            questionCount: subj.questionCount
          },
          null,
          2
        )
      }
    ];
  };

  const handleCopyFile = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
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
            KL Knowledge Base
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] leading-tight">
            Academic Drive Library
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        As specified in System Blueprint Section 02: A shared folder library containing the 6 standard items per subject.
      </p>

      {/* Department Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {['All', ...Array.from(new Set(subjects.map(subject => subject.department).filter(Boolean)))].map((dept) => (
          <button
            key={dept}
            onClick={() => setDeptFilter(dept as Department)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              deptFilter === dept
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'bg-[#ffffff] text-[var(--foreground)] border border-[var(--border)]'
            }`}
          >
            {dept === 'All' ? 'All Depts' : dept}
          </button>
        ))}
      </div>

      {/* Subject Dropdown / Picker */}
      <div className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3.5 shadow-sm space-y-2">
        <label className="text-xs font-semibold text-[var(--foreground)] flex items-center space-x-1.5">
          <Folder size={15} className="text-[var(--accent)]" />
          <span>Select Subject Folder in Knowledge Base:</span>
        </label>
        <select
          value={currentSubject.id}
          onChange={(e) => {
            const found = subjects.find((s) => s.id === e.target.value);
            if (found) setSelectedSubject(found);
          }}
          className="w-full bg-surface-subtle border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--foreground)] font-medium editorial-focus"
        >
          {filteredSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code}) — {s.department}
            </option>
          ))}
        </select>
      </div>

      {/* The 6 Standard Items Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[var(--muted-foreground)]">
            The 6 Standard Items in {currentSubject.name}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
            6 / 6 Items Grounded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {getSubjectFiles(currentSubject).map((file, idx) => {
            const Icon = file.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveFile(file)}
                className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3.5 shadow-sm hover:border-brand-400 cursor-pointer group transition-all flex items-start justify-between"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--muted)] text-[var(--accent)] flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {file.label}
                    </h4>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)] italic pt-1">
                      {file.desc}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-[var(--muted-foreground)] group-hover:text-[var(--accent)] p-1">
                  <Eye size={15} />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* File Preview Modal */}
      {activeFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#ffffff] rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-3 max-h-[85vh] flex flex-col border border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center space-x-2">
                <FileText size={18} className="text-[var(--accent)]" />
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--foreground)] font-mono">
                    {activeFile.name}
                  </h3>
                  <p className="text-[10px] text-[var(--muted-foreground)]">
                    KL Knowledge Base • {currentSubject.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleCopyFile(activeFile.content)}
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-surface-subtle text-xs flex items-center space-x-1"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => handleDownloadFile(activeFile.name, activeFile.content)}
                  className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-surface-subtle text-xs flex items-center space-x-1"
                >
                  <Download size={14} />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={() => setActiveFile(null)}
                  className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-surface-subtle"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-surface-subtle p-3.5 rounded-xl border border-[var(--border)]/60 text-xs font-mono text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {activeFile.content}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setActiveFile(null)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold text-xs"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

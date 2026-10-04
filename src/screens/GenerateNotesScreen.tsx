import React, { useState } from 'react';
import { ExamNote, ScreenId } from '../types';
import { MermaidViewer } from '../components/MermaidViewer';
import { SelfTestModal } from '../components/SelfTestModal';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  MessageSquareText,
  Printer,
  Sparkles,
  Download,
  Award,
  BookOpen,
  FileText,
  FileCode,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Info
} from 'lucide-react';

interface GenerateNotesScreenProps {
  note: ExamNote | null;
  onNavigate: (screen: ScreenId) => void;
  onSaveNote: (note: ExamNote) => void;
  isSaved: boolean;
  onOpenFeedback: () => void;
}

export const GenerateNotesScreen: React.FC<GenerateNotesScreenProps> = ({
  note,
  onNavigate,
  onSaveNote,
  isSaved,
  onOpenFeedback
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | '2m' | '5m' | '10m' | 'diagram'>('all');
  const [showSelfTest, setShowSelfTest] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<string | null>(null);

  if (!note) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-base font-semibold text-[var(--foreground)]">No notes generated yet</h3>
        <button
          onClick={() => onNavigate('enter-topic')}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-xs font-semibold"
        >
          Enter a Topic
        </button>
      </div>
    );
  }

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getFullExamSheetText = () => {
    return `STUDYMATE EXAM NOTES
Subject: ${note.subject} (${note.code})
Topic: ${note.topic}
Unit: ${note.unit}

================ KEYWORDS ================
${note.keywords.join(', ')}

================ 2 MARKS ANSWER ================
Q: ${note.twoMarks.question}
A: ${note.twoMarks.answer}

================ 5 MARKS ANSWER ================
Q: ${note.fiveMarks.question}
${note.fiveMarks.answer}

================ 10 MARKS ANSWER ================
Q: ${note.tenMarks.question}
${note.tenMarks.answer}
`;
  };

  const handleCopyAll = () => {
    handleCopy(getFullExamSheetText(), 'all');
  };

  const handleDownloadMarkdown = () => {
    const text = `# ${note.topic} — KL Exam Notes
**Department:** ${note.department} | **Subject:** ${note.subject} (${note.code})
**Unit:** ${note.unit}

## Essential Keywords
${note.keywords.map((k) => `- **${k}**`).join('\n')}

---

## 2 Marks Answer
**Question:** ${note.twoMarks.question}  
**Answer:** ${note.twoMarks.answer}

---

## 5 Marks Answer
**Question:** ${note.fiveMarks.question}  
${note.fiveMarks.answer}

---

## 10 Marks Answer
**Question:** ${note.tenMarks.question}  
${note.tenMarks.answer}

${note.diagram ? `\n---\n## Process Flowchart\n\`\`\`mermaid\n${note.diagram.code}\n\`\`\`\n` : ''}
`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${note.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_kl_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Grounded resources for laptop model
  const iconMap: Record<string, any> = {
    'course-materials': BookOpen,
    'previous-papers': FileText,
    'marks-pattern': Award,
    'answer-style': ShieldCheck,
    'question-bank': Layers,
    'syllabus': FileCode
  };

  const groundingResources = (note.resourcesUsed && note.resourcesUsed.length > 0)
    ? note.resourcesUsed.map((resource, index) => ({
        id: `res-${index}`,
        title: resource.title,
        file: resource.file,
        tag: 'Administrator-published material',
        icon: iconMap[resource.type] || BookOpen,
        excerpt: resource.excerpt
      }))
    : [];

  return (
    <div className="space-y-4 pb-28 animate-fade-in print:p-0 print:m-0 max-w-5xl mx-auto">
      {/* Screen Header & Quick Actions */}
      <div className="flex items-center justify-between pt-1 print:hidden">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('enter-topic')}
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[var(--accent)]">
              Step 04 of 06
            </span>
            <h1 className="text-lg font-sans font-bold text-[var(--foreground)] leading-tight">
              KL Exam Notes
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowSelfTest(true)}
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-amber-300 hover:bg-[var(--surface-strong)] font-semibold transition-colors"
            title="Test Recall & Grade Me"
          >
            <Award size={14} className="text-[var(--accent)]" />
            <span className="hidden sm:inline">Self-Test</span>
          </button>
          <button
            onClick={handleDownloadMarkdown}
            title="Download Markdown Notes"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors text-xs font-medium flex items-center space-x-1"
          >
            <Download size={14} />
            <span className="hidden md:inline">Download</span>
          </button>
          <button
            onClick={handlePrint}
            title="Print or Save PDF"
            className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
          >
            <Printer size={15} />
          </button>
          <button
            onClick={handleCopyAll}
            title="Copy Complete Exam Sheet"
            className="flex items-center space-x-1 text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors font-medium"
          >
            {copiedSection === 'all' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{copiedSection === 'all' ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={() => onSaveNote(note)}
            className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              isSaved
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)] shadow-sm'
            }`}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Note Meta Header Card */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)]">
            {note.code}
          </span>
          <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--accent)]">
            {note.department}
          </span>
          <span className="text-[10px] text-[var(--muted-foreground)]">
            {note.subject}
          </span>
        </div>
        <h2 className="text-base sm:text-xl font-sans font-bold text-[var(--foreground)] leading-snug">
          {note.topic}
        </h2>
        <p className="text-[11px] text-[var(--muted-foreground)] font-sans flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"></span>
          <span>{note.unit}</span>
        </p>
      </div>

      {/* LAPTOP MODEL LAYOUT: Main Content + Right Grounded Resources Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Center Canvas: The Core Exam Notes (8 cols on laptop) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Tabs for Quick Review */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none print:hidden">
            {[
              { id: 'all', label: 'All Answers' },
              { id: '2m', label: '2 Marks' },
              { id: '5m', label: '5 Marks' },
              { id: '10m', label: '10 Marks' },
              { id: 'diagram', label: 'Diagram' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent)] text-white shadow-sm'
                    : 'bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 🔑 SECTION: Essential Scoring Keywords */}
          {(activeTab === 'all' || activeTab === '2m' || activeTab === '5m') && (
            <div className="bg-[var(--surface)]/70 border border-[var(--border)]/80 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center space-x-1.5">
                  <Sparkles size={14} className="text-[var(--accent)]" />
                  <span>Source keywords to review</span>
                </span>
                <span className="text-[10px] text-[var(--accent)] font-medium">
                  Review against published material
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {note.keywords.map((kw, i) => (
                  <span
                    key={i}
                    onClick={() => handleCopy(kw, `kw-${i}`)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] hover:border-amber-400 cursor-pointer shadow-[var(--shadow-sm)] transition-colors"
                  >
                    <span>{kw}</span>
                    {copiedSection === `kw-${i}` ? (
                      <Check size={11} className="text-emerald-600" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 📌 SECTION: 2 Marks Answer */}
          {(activeTab === 'all' || activeTab === '2m') && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-[var(--accent-50)] text-[var(--accent-800)] border border-[var(--accent-200)]">
                    2 Marks
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] italic">
                    Short-answer response
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(note.twoMarks.answer, '2m')}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] flex items-center space-x-1"
                >
                  {copiedSection === '2m' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedSection === '2m' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <h3 className="text-xs font-semibold text-[var(--foreground)]">
                Q: {note.twoMarks.question}
              </h3>

              <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-sans bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]/50">
                {note.twoMarks.answer}
              </div>
            </div>
          )}

          {/* 📝 SECTION: 5 Marks Answer */}
          {(activeTab === 'all' || activeTab === '5m') && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-[var(--accent-50)] text-[var(--accent-800)] border border-[var(--accent-200)]">
                    5 Marks
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] italic">
                    Structured Points & Principle (~150 words)
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(note.fiveMarks.answer, '5m')}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] flex items-center space-x-1"
                >
                  {copiedSection === '5m' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedSection === '5m' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <h3 className="text-xs font-semibold text-[var(--foreground)]">
                Q: {note.fiveMarks.question}
              </h3>

              <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-sans space-y-2 prose prose-sm max-w-none">
                {note.fiveMarks.answer.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###')) {
                    return (
                      <h4 key={idx} className="font-bold text-[var(--foreground)] text-xs sm:text-sm mt-2 text-[var(--accent)]">
                        {paragraph.replace('###', '').trim()}
                      </h4>
                    );
                  }
                  return (
                    <p key={idx} className="text-[var(--foreground)]/90 leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📊 SECTION: Process Flowchart / Diagram */}
          {(activeTab === 'all' || activeTab === 'diagram' || activeTab === '10m') && note.diagram && (
            <MermaidViewer code={note.diagram.code} title={`${note.topic} — Process Flowchart`} />
          )}

          {/* 📚 SECTION: 10 Marks Answer */}
          {(activeTab === 'all' || activeTab === '10m') && (
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)]/60 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-50 text-emerald-800 border border-emerald-200">
                    10 Marks
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] italic">
                    Long-form response
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(note.tenMarks.answer, '10m')}
                  className="text-xs text-[var(--muted-foreground)] hover:text-[var(--accent)] flex items-center space-x-1"
                >
                  {copiedSection === '10m' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>{copiedSection === '10m' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-[var(--foreground)]">
                Q: {note.tenMarks.question}
              </h3>

              <div className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed font-sans space-y-3">
                {note.tenMarks.answer.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('###')) {
                    return (
                      <h4
                        key={idx}
                        className="font-bold text-[var(--foreground)] text-xs sm:text-sm pt-2 text-[var(--accent)] border-b border-[var(--border)]/40 pb-1"
                      >
                        {paragraph.replace('###', '').trim()}
                      </h4>
                    );
                  }
                  return (
                    <p key={idx} className="text-[var(--foreground)]/90 leading-relaxed whitespace-pre-line">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Inspector: LAPTOP MODEL GROUNDING RESOURCES (4 cols on laptop) */}
        <div className="hidden lg:block lg:col-span-4 space-y-3 sticky top-20">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-xs font-sans uppercase tracking-wider font-bold text-[var(--foreground)] flex items-center space-x-1.5">
                <BookOpen size={14} className="text-[var(--accent)]" />
                <span>Grounded Resources (Laptop View)</span>
              </span>
              <span className="text-[10px] bg-[var(--muted)] text-[var(--accent)] font-bold px-1.5 py-0.5 rounded">
                Published Subject Material
              </span>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              These answers are generated from the administrator-published subject material available for this account:
            </p>

            <div className="space-y-2">
              {groundingResources.map((res) => {
                const Icon = res.icon;
                return (
                  <div
                    key={res.id}
                    onClick={() => setSelectedCitation(selectedCitation === res.id ? null : res.id)}
                    className="p-2.5 rounded-lg border border-[var(--border)]/80 hover:border-[var(--accent-300)] bg-[var(--surface)] cursor-pointer transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icon size={14} className="text-[var(--accent)]" />
                        <span className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                          {res.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--muted-foreground)] bg-[var(--card)] px-1.5 py-0.2 rounded border border-[var(--border)]">
                        {res.file}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                      {res.excerpt}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[var(--muted-foreground)]">Need to add more materials?</span>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center space-x-1"
              >
                <span>Admin Portal</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* Quick Evaluator Tips Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-3.5 space-y-1.5">
            <span className="text-xs font-bold text-[var(--foreground)] flex items-center space-x-1.5">
              <Award size={14} className="text-[var(--accent)]" />
              <span>Food Tech Evaluator Check:</span>
            </span>
            <ul className="text-[11px] text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
              <li>Check D-value, z-value units (minutes, °C).</li>
              <li>Include labeled temperature/time combinations.</li>
              <li>State the relevant FSSAI / Codex regulation.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Self-Test Modal */}
      {showSelfTest && (
        <SelfTestModal note={note} onClose={() => setShowSelfTest(false)} />
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-14 left-0 right-0 z-30 bg-[var(--card)]/90 backdrop-blur-md border-t border-[var(--border)] py-2 px-4 print:hidden">
        <div className="max-w-md mx-auto flex items-center justify-between space-x-2">
          <button
            onClick={() => onSaveNote(note)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-[var(--accent)] text-white hover:bg-[var(--accent)]'
            }`}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            <span>{isSaved ? 'Saved for Revision' : 'Save Note (05)'}</span>
          </button>

          <button
            onClick={onOpenFeedback}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center space-x-1.5 transition-colors"
          >
            <MessageSquareText size={15} className="text-[var(--accent)]" />
            <span>Give Feedback (06)</span>
          </button>
        </div>
      </div>
    </div>
  );
};

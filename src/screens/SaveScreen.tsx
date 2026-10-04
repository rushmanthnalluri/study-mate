import React, { useState } from 'react';
import { ExamNote, Department, ScreenId } from '../types';
import {
  Bookmark,
  Search,
  Trash2,
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Share2,
  ExternalLink
} from 'lucide-react';

interface SaveScreenProps {
  savedNotes: ExamNote[];
  onOpenNote: (note: ExamNote) => void;
  onDeleteNote: (id: string) => void;
  onToggleReviewed: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SaveScreen: React.FC<SaveScreenProps> = ({
  savedNotes,
  onOpenNote,
  onDeleteNote,
  onToggleReviewed,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<Department>('All');

  const filteredNotes = savedNotes.filter((note) => {
    const matchesDept = selectedDeptFilter === 'All' || note.department === selectedDeptFilter;
    const matchesSearch =
      note.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.code.toLowerCase().includes(searchQuery.toLowerCase());
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
            Step 05 of 06
          </span>
          <h1 className="text-xl font-sans font-bold text-[var(--foreground)] leading-tight">
            Revision Library
          </h1>
        </div>
      </div>

      <p className="text-xs text-[var(--muted-foreground)]">
        Your saved notes remain private to your account and are available for revision.
      </p>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved revision notes..."
            className="w-full bg-[#ffffff] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--foreground)] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...Array.from(new Set(savedNotes.map(note => note.department).filter(Boolean)))].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDeptFilter(dept as Department)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDeptFilter === dept
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[#ffffff] text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-2.5 pt-1">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-14 bg-[#ffffff] border border-dashed border-[var(--border)] rounded-xl p-6 space-y-3">
            <Bookmark size={36} className="mx-auto text-[var(--muted-foreground)] opacity-40" />
            <h3 className="text-sm font-semibold text-[var(--foreground)]">No revision notes saved yet</h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
              Generate answers for any topic and click &quot;Save&quot; to keep them ready for quick pre-exam review.
            </p>
            <button
              onClick={() => onNavigate('select-subject')}
              className="bg-[var(--accent)] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm hover:bg-[var(--accent)] transition-colors"
            >
              Start Generating
            </button>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id || note.topic}
              className="bg-[#ffffff] border border-[var(--border)] rounded-xl p-3.5 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-subtle text-[var(--muted-foreground)]">
                      {note.code}
                    </span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-[var(--accent)]">
                      {note.department}
                    </span>
                    <span className="text-[10px] text-[var(--muted-foreground)] truncate max-w-[120px]">
                      {note.subject}
                    </span>
                  </div>
                  <h3
                    onClick={() => onOpenNote(note)}
                    className="text-xs sm:text-sm font-bold text-[var(--foreground)] hover:text-[var(--accent)] cursor-pointer line-clamp-2"
                  >
                    {note.topic}
                  </h3>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => note.id && onToggleReviewed(note.id)}
                    title={note.isReviewed ? "Mark as Need Revision" : "Mark as Revised"}
                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                      note.isReviewed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-[#ffffff] text-[var(--muted-foreground)] border-[var(--border)] hover:bg-surface-subtle'
                    }`}
                  >
                    <CheckCircle size={15} />
                  </button>
                  <button
                    onClick={() => note.id && onDeleteNote(note.id)}
                    title="Delete Note"
                    className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Keywords Tag Preview */}
              <div className="flex flex-wrap gap-1">
                {note.keywords.slice(0, 3).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[9px] bg-surface-subtle px-1.5 py-0.5 rounded text-[var(--muted-foreground)] font-medium"
                  >
                    #{kw}
                  </span>
                ))}
                {note.keywords.length > 3 && (
                  <span className="text-[9px] text-[var(--muted-foreground)]">
                    +{note.keywords.length - 3} more
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-[var(--border)]/50 flex items-center justify-between">
                <span className="text-[10px] text-[var(--muted-foreground)] flex items-center space-x-1">
                  <Clock size={11} />
                  <span>{note.savedAt ? new Date(note.savedAt).toLocaleDateString() : 'Ready'}</span>
                </span>
                <button
                  onClick={() => onOpenNote(note)}
                  className="text-xs font-semibold text-[var(--accent)] hover:underline flex items-center space-x-1"
                >
                  <span>Revise Now</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

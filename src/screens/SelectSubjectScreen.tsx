import React, { useState } from 'react';
import { Department, Subject, ScreenId } from '../types';
import { Search, BookOpen, ChevronRight, Layers, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface SelectSubjectScreenProps {
  subjects: Subject[];
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onSelectSubject: (subject: Subject) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SelectSubjectScreen: React.FC<SelectSubjectScreenProps> = ({
  subjects,
  selectedDepartment,
  onSelectDepartment,
  onSelectSubject,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const departments: Department[] = ['All', 'CSE', 'AIDS', 'ECE', 'EEE', 'Food Technology'];

  const filteredSubjects = subjects.filter((s) => {
    const matchesDept = selectedDepartment === 'All' || s.department === selectedDepartment;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Screen Header */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          onClick={() => onNavigate('home')}
          className="p-1.5 rounded-lg border border-[#e3d6cb] bg-[#fffaf4] text-[#806f61] hover:text-[#3b2b23] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#7c4f2c]">
            Step 02 of 06
          </span>
          <h1 className="text-xl font-sans font-bold text-[#3b2b23] leading-tight">
            Select Subject
          </h1>
        </div>
      </div>

      <p className="text-xs text-[#806f61]">
        Pick a subject from the KL Knowledge Base. All course units, question banks, and answer rubrics are pre-grounded.
      </p>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#806f61]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subjects by name or code (e.g. 21CS, OS, VLSI)..."
          className="w-full bg-[#fffaf4] border border-[#e3d6cb] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#3b2b23] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 shadow-sm"
        />
      </div>

      {/* Department Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {departments.map((dept) => {
          const isSelected = selectedDepartment === dept;
          return (
            <button
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#7c4f2c] text-white shadow-sm'
                  : 'bg-[#fffaf4] text-[#3b2b23] border border-[#e3d6cb] hover:bg-surface-subtle'
              }`}
            >
              {dept === 'All' ? 'All Depts' : dept}
            </button>
          );
        })}
      </div>

      {/* Subject List */}
      <div className="space-y-2.5 pt-1">
        {filteredSubjects.length === 0 ? (
          <div className="text-center py-12 bg-[#fffaf4] border border-dashed border-[#e3d6cb] rounded-xl p-6">
            <BookOpen size={32} className="mx-auto text-[#806f61] mb-2 opacity-50" />
            <h3 className="text-sm font-semibold text-[#3b2b23]">No subjects found</h3>
            <p className="text-xs text-[#806f61] mt-1">
              Try adjusting your search query or department filter.
            </p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(subject)}
              className="bg-[#fffaf4] border border-[#e3d6cb] rounded-xl p-4 shadow-sm hover:border-brand-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle border border-[#e3d6cb] text-[#3b2b23]">
                      {subject.code}
                    </span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f4eadf] text-[#7c4f2c]">
                      {subject.department}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#3b2b23] group-hover:text-[#7c4f2c] transition-colors">
                    {subject.name}
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-subtle group-hover:bg-[#f4eadf] group-hover:text-[#7c4f2c] flex items-center justify-center transition-colors">
                  <ChevronRight size={16} />
                </div>
              </div>

              {/* Units Preview */}
              <div className="mt-2.5 pt-2 border-t border-[#e3d6cb]/50 text-[11px] text-[#806f61] space-y-1">
                <div className="flex items-center space-x-2">
                  <Layers size={13} className="text-[#8d5a37]" />
                  <span>{subject.units?.length || 5} Course Units mapped to Bloom's Taxonomy</span>
                </div>
                {subject.topics && subject.topics.length > 0 && (
                  <p className="text-[10px] text-stone-500 italic line-clamp-1">
                    Exam topics: {subject.topics.slice(0, 3).join(' • ')}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Department, Subject, ScreenId, ExamNote } from '../types';
import { ArrowRight, BookOpen, Clock3, Award, ChevronRight, Sparkles, FileText, Layers, Calendar, FileSearch, FileSpreadsheet, GraduationCap, RefreshCw, Bot } from 'lucide-react';

interface HomeScreenProps {
  subjects: Subject[];
  selectedDepartment: Department;
  onSelectDepartment: (dept: Department) => void;
  onSelectSubject: (subject: Subject) => void;
  onNavigate: (screen: ScreenId) => void;
  recentNotes: ExamNote[];
  onOpenNote: (note: ExamNote) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  subjects, selectedDepartment, onSelectDepartment, onSelectSubject, onNavigate, recentNotes, onOpenNote
}) => {
  const departments: Department[] = ['All', ...Array.from(new Set(subjects.map((subject) => subject.department))).filter(Boolean)] as Department[];
  const filteredSubjects = subjects.filter(s => selectedDepartment === 'All' || s.department === selectedDepartment);

  const features = [
    { id: 'mock-exam' as ScreenId, title: 'Mock papers', text: 'Build a complete exam sheet', icon: FileSpreadsheet, tone: 'bg-[#F5F3F0] text-[#B8860B]' },
    { id: 'flashcards' as ScreenId, title: 'Flashcards', text: 'Fast 2-mark recall', icon: Layers, tone: 'bg-[#F5F3F0] text-[#B8860B]' },
    { id: 'pdf-analyzer' as ScreenId, title: 'Past papers', text: 'Extract exam patterns', icon: FileSearch, tone: 'bg-[#F5F3F0] text-[#B8860B]' },
    { id: 'planner' as ScreenId, title: 'Study planner', text: 'Organize your units', icon: Calendar, tone: 'bg-[#F5F3F0] text-[#B8860B]' },
    { id: 'quiz' as ScreenId, title: 'Quiz & model test', text: 'Timed exam practice', icon: FileSpreadsheet, tone: 'bg-[#F5F3F0] text-[#B8860B]' },
    { id: 'studio' as ScreenId, title: 'Study studio', text: 'Audio, voice & maps', icon: Bot, tone: 'bg-[#F5F3F0] text-[#B8860B]' }
  ];

  return (
    <div className="space-y-6 pb-28">
      <section className="relative overflow-hidden rounded-lg border border-[#E8E4DF] bg-white p-6 text-[#1A1A1A] shadow-[0_4px_12px_rgba(26,26,26,0.06)] sm:p-8">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#B8860B]/5 blur-2xl" />
        <div className="absolute -bottom-20 left-1/2 h-40 w-40 rounded-full bg-[#B8860B]/5 blur-2xl" />
        <div className="relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E8E4DF] bg-[#F5F3F0] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#B8860B]">
            <Sparkles size={13} /> KL exam workspace
          </div>
          <h1 className="max-w-2xl font-serif text-3xl font-normal tracking-tight sm:text-5xl">Study smarter. Write with structure.</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#6B6B6B] sm:text-base">Generate exam-ready notes, practice papers, flashcards and revision material from one account-based workspace.</p>

          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            <button onClick={() => onNavigate('select-subject')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#B8860B] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
              Pick subject & generate <ArrowRight size={17} />
            </button>
            <button onClick={() => onNavigate('mock-exam')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border border-[#1A1A1A] bg-white px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
              <FileSpreadsheet size={17} /> Full mock paper
            </button>
            <button onClick={() => onNavigate('chatbot')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border border-[#E8E4DF] bg-[#F5F3F0] px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-white/15">
              <Bot size={17} /> Ask AI tutor
            </button>
            <button onClick={() => onNavigate('lms-sync')} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border border-[#E8E4DF] bg-[#F5F3F0] px-5 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#604737]">
              <RefreshCw size={17} /> KL LMS
            </button>
          </div>
        </div>
      </section>

      <button onClick={() => onNavigate('lms-sync')} className="group flex w-full items-center justify-between gap-4 rounded-lg border border-[#E8E4DF] bg-white p-4 text-left shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F5F3F0] text-[#B8860B]"><GraduationCap size={21} /></span>
          <span>
            <span className="flex items-center gap-2 font-serif text-base font-semibold text-[#1A1A1A]">LMS connection <span className="h-2 w-2 rounded-full bg-[#83a66f]" /></span>
            <span className="mt-1 block text-[11px] leading-5 text-[#6B6B6B]">Connect your account to access the official LMS separately. StudyMate does not invent LMS records.</span>
          </span>
        </div>
        <ChevronRight size={18} className="shrink-0 text-[#B8860B] transition-transform group-hover:translate-x-1" />
      </button>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#B8860B]">Workspace</p>
            <h2 className="mt-1 font-serif text-xl font-normal tracking-tight text-[#1A1A1A]">Everything for exam week</h2>
          </div>
          <span className="text-[10px] font-medium text-[#6B6B6B]">4 tools</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map(({id,title,text,icon:Icon,tone}) => (
            <button key={id} onClick={() => onNavigate(id)} className="group rounded-[22px] border border-[#E8E4DF] bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#cfb49b] hover:shadow-md">
              <span className={`mb-5 flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}><Icon size={18} /></span>
              <span className="block text-xs font-extrabold text-[#1A1A1A]">{title}</span>
              <span className="mt-1 block text-[10px] leading-4 text-[#6B6B6B]">{text}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#2563eb]">Catalog</p><h2 className="mt-1 text-xl font-black tracking-tight text-[#1A1A1A]">Choose your department</h2></div>
          <span className="text-[10px] font-bold text-[#8b796b]">{filteredSubjects.length} subjects</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {departments.map(dept => {
            const active = selectedDepartment === dept;
            return <button key={dept} onClick={() => onSelectDepartment(dept)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-extrabold transition-all ${active ? 'border-[#2563eb] bg-[#2563eb] text-white shadow-sm' : 'border-[#e2d5ca] bg-[#ffffff] text-[#715f51] hover:bg-[#f5ebe2]'}`}>{dept === 'All' ? 'All departments' : dept}</button>;
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><BookOpen size={17} className="text-[#B8860B]" /><h2 className="text-lg font-black tracking-tight text-[#172554]">Knowledge base</h2></div>
          <button onClick={() => onNavigate('select-subject')} className="inline-flex items-center gap-1 text-xs font-extrabold text-[#B8860B]">View all <ChevronRight size={14} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredSubjects.slice(0, 6).map(subject => (
            <button key={subject.id} onClick={() => onSelectSubject(subject)} className="group rounded-[22px] border border-[#e3d6cb] bg-[#ffffff] p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c9aa8d] hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-lg bg-[#eff6ff] px-2 py-1 font-mono text-[9px] font-bold text-[#8a6b55]">{subject.code}</span>
                <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[9px] font-extrabold text-[#2563eb]">{subject.department}</span>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-[#334155] group-hover:text-[#2563eb]">{subject.name}</h3>
              <p className="mt-1 text-[10px] text-[#64748b]">{subject.units?.length || 5} units • {subject.questionCount || 0} indexed questions</p>
              <span className="mt-4 flex items-center justify-between border-t border-[#eee2d8] pt-3 text-[10px] font-extrabold text-[#2563eb]">Generate notes <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
            </button>
          ))}
        </div>
      </section>

      {recentNotes.length > 0 && (
        <section className="rounded-[24px] border border-[#e2d4c7] bg-[#F5F3F0] p-4">
          <div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><Clock3 size={16} className="text-[#9a633e]" /><h2 className="text-sm font-black text-[#334155]">Your recent revision</h2></div><button onClick={() => onNavigate('save')} className="text-[10px] font-extrabold text-[#2563eb]">See all</button></div>
          <div className="space-y-2">
            {recentNotes.slice(0,3).map((note,index) => (
              <button key={index} onClick={() => onOpenNote(note)} className="flex w-full items-center justify-between rounded-2xl border border-[#e7d9cd] bg-[#ffffff] p-3 text-left hover:border-[#cdb29a]">
                <span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F5F3F0] text-[#B8860B]"><FileText size={15} /></span><span className="min-w-0"><span className="block truncate text-xs font-extrabold text-[#334155]">{note.topic}</span><span className="mt-0.5 block truncate text-[10px] text-[#64748b]">{note.subject} • {note.department}</span></span></span>
                <ChevronRight size={16} className="shrink-0 text-[#a68c79]" />
              </button>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[24px] border border-[#E8E4DF] bg-[#F5F3F0] p-5">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#2563eb] text-[#bfdbfe]"><Award size={18} /></span><div><h3 className="text-sm font-black text-[#334155]">Structured exam answers</h3><p className="mt-1 text-[11px] leading-5 text-[#6B6B6B]">StudyMate formats generated material around definitions, key points, equations, diagrams and revision cues so your preparation stays organized.</p></div></div>
      </section>
    </div>
  );
};

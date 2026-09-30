import React, { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, RotateCcw, Trophy, Timer, ChevronRight, BookOpen } from 'lucide-react';
import { Department, ScreenId, Subject } from '../types';

type Q = { id:string; question:string; options:string[]; answer:number; explanation:string; };

interface Props {
  onNavigate:(screen:ScreenId)=>void;
  subjects:Subject[];
  selectedDepartment:Department;
}

export const QuizScreen:React.FC<Props> = ({onNavigate,subjects,selectedDepartment}) => {
  const [subjectId,setSubjectId]=useState(subjects[0]?.id||'');
  const [mode,setMode]=useState<'quiz'|'model'>('quiz');
  const [started,setStarted]=useState(false);
  const [index,setIndex]=useState(0);
  const [selected,setSelected]=useState<number|null>(null);
  const [score,setScore]=useState(0);
  const [finished,setFinished]=useState(false);
  const [seconds,setSeconds]=useState(600);

  const filtered=subjects.filter(s=>selectedDepartment==='All'||s.department===selectedDepartment);
  const subject=subjects.find(s=>s.id===subjectId)||filtered[0]||subjects[0];

  const questions=useMemo<Q[]>(()=> {
    if(!subject) return [];
    const topics=(subject.topics||[subject.name]).filter(Boolean);
    const bank=subject.questionBank||[];
    const out:Q[]=[];
    for(let i=0;i<Math.min(10,Math.max(5,topics.length));i++){
      const topic=topics[i%topics.length];
      const bankQ=bank[i%Math.max(1,bank.length)];
      const correct=bankQ?.question||`The most direct study focus for ${topic} is:`;
      const opts=[
        correct,
        `A secondary application of ${topic}`,
        `An unrelated historical detail`,
        `A formatting rule with no technical relevance`
      ];
      out.push({id:`q-${i}`,question:bankQ?.question||`Which topic should be reviewed most directly for ${subject.name}: ${topic}?`,options:opts,answer:0,explanation:`Review the course topic “${topic}” and the indexed question bank for the exact syllabus context.`});
    }
    return out;
  },[subject?.id]);

  React.useEffect(()=>{ if(!started||finished||seconds<=0) return; const t=setInterval(()=>setSeconds(s=>s-1),1000); return()=>clearInterval(t); },[started,finished,seconds]);
  React.useEffect(()=>{ if(started&&seconds===0) setFinished(true); },[seconds,started]);

  const start=()=>{setStarted(true);setFinished(false);setIndex(0);setSelected(null);setScore(0);setSeconds(mode==='model'?1800:600);};
  const answer=(n:number)=>{ if(selected!==null)return; setSelected(n); if(n===questions[index]?.answer)setScore(s=>s+1); };
  const next=()=>{ if(index+1>=questions.length)setFinished(true); else {setIndex(i=>i+1);setSelected(null);} };
  const reset=()=>{setStarted(false);setFinished(false);setIndex(0);setSelected(null);setScore(0);};

  return <div className="space-y-5 pb-28">
    <div className="flex items-center justify-between">
      <button onClick={()=>onNavigate('home')} className="rounded-xl border border-[#e2d4c8] bg-[#fffaf4] p-2 text-[#6f594a]"><ArrowLeft size={17}/></button>
      <div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Assessment Lab</p><h1 className="text-xl font-black text-[#3b2b23]">Quiz & Model Test</h1></div>
      <div className="w-9"/>
    </div>

    {!started && <div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-bold text-[#4b392e]">Course<select value={subject?.id||''} onChange={e=>setSubjectId(e.target.value)} className="auth-input mt-1.5">{filtered.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
        <label className="text-xs font-bold text-[#4b392e]">Mode<select value={mode} onChange={e=>setMode(e.target.value as 'quiz'|'model')} className="auth-input mt-1.5"><option value="quiz">Quick Quiz · 10 min</option><option value="model">Model Test · 30 min</option></select></label>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">{[['10','Questions'],[mode==='model'?'30':'10','Minutes'],['2M','Recall']].map(([a,b])=><div key={b} className="rounded-2xl bg-[#f7eee6] p-3 text-center"><b className="block text-lg text-[#7c4f2c]">{a}</b><span className="text-[9px] font-bold text-[#8d7868]">{b}</span></div>)}</div>
      <button onClick={start} disabled={!subject} className="mt-5 w-full rounded-2xl bg-[#7c4f2c] py-3.5 text-xs font-black text-white hover:bg-[#643c20] disabled:opacity-50">Start {mode==='model'?'Model Test':'Quiz'} <ChevronRight className="ml-1 inline" size={16}/></button>
    </div>}

    {started&&!finished&&questions[index]&&<div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between"><span className="text-[10px] font-black uppercase text-[#a0704b]">Question {index+1}/{questions.length}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#f3e4d5] px-3 py-1 text-[10px] font-black text-[#76513a]"><Timer size={12}/>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</span></div>
      <h2 className="text-base font-extrabold leading-7 text-[#3b2b23]">{questions[index].question}</h2>
      <div className="mt-5 space-y-2">{questions[index].options.map((o,i)=>{const good=i===questions[index].answer; const chosen=selected===i; return <button key={i} disabled={selected!==null} onClick={()=>answer(i)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left text-xs font-semibold ${chosen?(good?'border-[#86a276] bg-[#eaf3e5]':'border-[#c98b7b] bg-[#fff0ec]'):'border-[#e4d7cc] bg-white hover:bg-[#f8f0e8]'}`}><span>{chosen&&good?<CheckCircle2 size={18} className="text-[#55734a]"/>:chosen?<Circle size={18} className="text-[#a04434]"/>:<Circle size={18} className="text-[#b7a396]"/>}</span>{o}</button>})}</div>
      {selected!==null&&<div className="mt-4 rounded-2xl bg-[#f7eee6] p-3 text-[11px] leading-5 text-[#705b4c]"><b>Explanation:</b> {questions[index].explanation}</div>}
      <button disabled={selected===null} onClick={next} className="mt-5 w-full rounded-2xl bg-[#3b2b23] py-3 text-xs font-black text-white disabled:opacity-40">{index+1===questions.length?'Finish test':'Next question'} <ChevronRight className="ml-1 inline" size={15}/></button>
    </div>}

    {finished&&<div className="rounded-[28px] border border-[#dfc8b1] bg-[#fffaf4] p-7 text-center shadow-sm">
      <Trophy className="mx-auto text-[#b77943]" size={42}/><p className="mt-3 text-[10px] font-black uppercase tracking-[.2em] text-[#a0704b]">Test complete</p><h2 className="mt-1 text-3xl font-black text-[#3b2b23]">{score}/{questions.length}</h2><p className="mt-2 text-xs text-[#806f61]">{Math.round(score/questions.length*100)}% • {mode==='model'?'Model Test':'Quick Quiz'} • {subject?.name}</p>
      <div className="mt-5 flex gap-2"><button onClick={reset} className="flex-1 rounded-2xl border border-[#ddcdbd] bg-white py-3 text-xs font-black text-[#5e4a3d]"><RotateCcw className="mr-1 inline" size={14}/>Retake</button><button onClick={()=>onNavigate('flashcards')} className="flex-1 rounded-2xl bg-[#7c4f2c] py-3 text-xs font-black text-white"><BookOpen className="mr-1 inline" size={14}/>Revise</button></div>
    </div>}
  </div>;
};

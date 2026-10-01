import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Headphones, Mic, MicOff, Network, Play, Pause, Square, Workflow, Copy, Check, Upload, Trash2, MessageCircle } from 'lucide-react';
import { ExamNote, ScreenId } from '../types';
import { MermaidViewer } from '../components/MermaidViewer';

interface Props { note: ExamNote|null; onNavigate:(screen:ScreenId)=>void; }

export const StudyStudioScreen:React.FC<Props>=({note,onNavigate})=>{
  const [playing,setPlaying]=useState(false);
  const [listening,setListening]=useState(false);
  const [voiceText,setVoiceText]=useState('');
  const [copied,setCopied]=useState(false);
  const [sources,setSources]=useState<Array<{id:string;name:string;mimeType:string;characters:number}>>([]);
  const [selectedSource,setSelectedSource]=useState('');
  const [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState('');
  const [sourceBusy,setSourceBusy]=useState(false);
  const [sourceError,setSourceError]=useState('');
  const recognitionRef=useRef<any>(null);

  const script=useMemo(()=>note
    ? 'Study overview for '+note.topic+'. '+note.twoMarks.answer+' '+note.fiveMarks.answer.replace(/[#*_]/g,' ')+' '+note.tenMarks.answer.replace(/[#*_]/g,' ')
    : 'Generate or open a note first.',[note]);

  const flow=useMemo(()=>'flowchart LR\n    A["'+(note?.topic||'Topic')+'"] --> B["Core concept"]\n    B --> C["Key principle"]\n    C --> D["Working / derivation"]\n    D --> E["Applications"]\n    E --> F["Exam conclusion"]',[note]);

  const mind=useMemo(()=>'mindmap\n  root(('+ (note?.topic||'Study Topic') +'))\n    Concept\n      Definition\n      Principle\n    Exam\n      2 Marks\n      5 Marks\n      10 Marks\n    Revision\n      Keywords\n      Formula\n      Diagram\n    Application\n      Examples\n      Limitations',[note]);

  useEffect(()=>()=>{window.speechSynthesis.cancel(); if(recognitionRef.current) recognitionRef.current.stop();},[]);
  const loadSources=async()=>{
    const token=localStorage.getItem('studymate_token'); if(!token)return;
    try{const r=await fetch('/api/studio/sources',{headers:{Authorization:`Bearer ${token}`}});if(r.ok){const d=await r.json();setSources(Array.isArray(d)?d:[]);}}catch{}
  };
  useEffect(()=>{void loadSources();},[]);
  const uploadSource=async(file:File)=>{
    setSourceBusy(true);setSourceError('');
    try{
      const text=await file.text();
      const token=localStorage.getItem('studymate_token');
      const r=await fetch('/api/studio/sources',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token||''}`},body:JSON.stringify({name:file.name,mimeType:file.type||'text/plain',content:text})});
      const d=await r.json().catch(()=>({})); if(!r.ok)throw new Error(d.error||'Upload failed');
      await loadSources();setSelectedSource(d.id);
    }catch(e){setSourceError(e instanceof Error?e.message:'Upload failed');}finally{setSourceBusy(false);}
  };
  const askSource=async()=>{
    if(!selectedSource||!question.trim())return;
    setSourceBusy(true);setSourceError('');setAnswer('');
    try{
      const token=localStorage.getItem('studymate_token');
      const r=await fetch('/api/studio/ask',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token||''}`},body:JSON.stringify({sourceId:selectedSource,question:question.trim()})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Question failed');setAnswer(d.answer||'No answer returned.');
    }catch(e){setSourceError(e instanceof Error?e.message:'Question failed');}finally{setSourceBusy(false);}
  };
  const removeSource=async(id:string)=>{
    const token=localStorage.getItem('studymate_token');
    try{await fetch('/api/studio/sources/'+encodeURIComponent(id),{method:'DELETE',headers:{Authorization:`Bearer ${token||''}`}});await loadSources();if(selectedSource===id)setSelectedSource('');}catch{}
  };

  const speak=()=>{if(!note)return; window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(script); u.rate=.92; u.pitch=1; u.onend=()=>setPlaying(false); setPlaying(true); window.speechSynthesis.speak(u);};
  const stop=()=>{window.speechSynthesis.cancel();setPlaying(false);};

  const toggleVoice=()=>{
    const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
    if(!SR){setVoiceText('Voice input is not supported in this browser.');return;}
    if(listening){recognitionRef.current?.stop();setListening(false);return;}
    const r=new SR(); r.lang='en-IN'; r.interimResults=true; r.continuous=true;
    r.onresult=(e:any)=>{let t='';for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setVoiceText(t)};
    r.onend=()=>setListening(false); r.onerror=()=>setListening(false); recognitionRef.current=r;r.start();setListening(true);
  };

  const copyScript=async()=>{await navigator.clipboard?.writeText(script);setCopied(true);setTimeout(()=>setCopied(false),1200);};

  return <div className="space-y-5 pb-28">
    <div className="flex items-center justify-between">
      <button onClick={()=>onNavigate('home')} className="rounded-xl border border-[#e2d4c8] bg-[#fffaf4] p-2"><ArrowLeft size={17}/></button>
      <div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Notebook Studio</p><h1 className="text-xl font-black text-[#3b2b23]">Study, listen & visualize</h1></div>
      <div className="w-9"/>
    </div>
    {!note
      ? <div className="rounded-[28px] bg-[#fffaf4] p-7 text-center"><Headphones className="mx-auto text-[#9b633c]" size={38}/><h2 className="mt-3 font-black">Open a generated note first</h2><button onClick={()=>onNavigate('enter-topic')} className="mt-4 rounded-2xl bg-[#7c4f2c] px-5 py-3 text-xs font-black text-white">Generate notes</button></div>
      : <>
        <div className="rounded-[28px] border border-[#dfc8b1] bg-[#7c4f2c] p-6 text-white shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#f2d4b4]">{note.subject}</p><h2 className="mt-2 text-2xl font-black">{note.topic}</h2><p className="mt-2 text-xs leading-5 text-[#f0ddc9]">A single study workspace for audio overview, voice capture, flowchart and mind map.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={playing?stop:speak} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-[#6f4528]">{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':'Listen'}</button>
            <button onClick={stop} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black"><Square size={14}/>Stop</button>
            <button onClick={copyScript} className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black">{copied?<Check size={14}/>:<Copy size={14}/>} {copied?'Copied':'Copy audio script'}</button>
          </div>
        </div>
        <section className="rounded-[24px] border border-[#e2d5ca] bg-[#fffaf4] p-5">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Private sources</p><h3 className="text-lg font-black">Ask your own material</h3></div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#7c4f2c] px-4 py-2.5 text-xs font-black text-white">
              <Upload size={14}/> {sourceBusy?'Working…':'Upload .txt / .md'}
              <input type="file" accept=".txt,.md,text/plain,text/markdown" className="hidden" disabled={sourceBusy} onChange={e=>{const f=e.target.files?.[0];if(f)void uploadSource(f);e.currentTarget.value='';}}/>
            </label>
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#806f61]">Sources are private to your account. Answers are grounded only in the selected source and will say when the source lacks the answer.</p>
          {sourceError&&<div className="mt-3 rounded-xl border border-[#efc4b8] bg-[#fff0ec] p-3 text-[11px] font-semibold text-[#8f3328]">{sourceError}</div>}
          {sources.length>0&&<div className="mt-3 space-y-2">{sources.map(s=><div key={s.id} className={`flex items-center gap-2 rounded-xl border p-2.5 ${selectedSource===s.id?'border-[#cba27d] bg-[#f5e6d7]':'border-[#eadfd4] bg-white'}`}><button onClick={()=>setSelectedSource(s.id)} className="min-w-0 flex-1 text-left"><span className="block truncate text-xs font-bold text-[#4b392e]">{s.name}</span><span className="text-[10px] text-[#907d6d]">{s.characters.toLocaleString()} characters</span></button><button onClick={()=>void removeSource(s.id)} aria-label={`Delete ${s.name}`} className="rounded-lg p-2 text-[#8f6f5a] hover:bg-[#f1e1d5]"><Trash2 size={14}/></button></div>)}</div>}
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]"><input value={question} onChange={e=>setQuestion(e.target.value)} disabled={!selectedSource||sourceBusy} placeholder={selectedSource?'Ask a question about this source…':'Select a source first'} className="auth-input"/><button onClick={()=>void askSource()} disabled={!selectedSource||!question.trim()||sourceBusy} className="rounded-2xl bg-[#3b2b23] px-4 py-3 text-xs font-black text-white disabled:opacity-40"><MessageCircle size={14} className="mr-1 inline"/>Ask</button></div>
          {answer&&<div className="mt-3 rounded-2xl bg-[#f8f0e8] p-4 text-xs leading-6 text-[#5f4a3d]"><b>Source-grounded answer</b><div className="mt-1 whitespace-pre-wrap">{answer}</div></div>}
        </section>
        <section className="rounded-[24px] border border-[#e2d5ca] bg-[#fffaf4] p-5">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Voice notes</p><h3 className="text-lg font-black text-[#3b2b23]">Talk through your revision</h3></div>
            <button onClick={toggleVoice} className={listening?'rounded-2xl bg-[#a04434] px-4 py-2.5 text-xs font-black text-white':'rounded-2xl bg-[#f0e0cf] px-4 py-2.5 text-xs font-black text-[#6f4528]'}>{listening?<><MicOff size={14} className="mr-1 inline"/>Stop</>:<><Mic size={14} className="mr-1 inline"/>Record</>}</button>
          </div>
          <div className="mt-3 min-h-24 rounded-2xl bg-[#f8f0e8] p-4 text-xs leading-6 text-[#6b5748]">{voiceText||'Your spoken revision transcript will appear here. This uses the browser voice engine; no audio is uploaded by StudyMate.'}</div>
        </section>
        <section className="rounded-[24px] border border-[#e2d5ca] bg-[#fffaf4] p-5"><div className="mb-3 flex items-center gap-2"><Workflow size={17} className="text-[#8d5a37]"/><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Flowchart</p><h3 className="text-lg font-black">Process at a glance</h3></div></div><MermaidViewer code={flow}/></section>
        <section className="rounded-[24px] border border-[#e2d5ca] bg-[#fffaf4] p-5"><div className="mb-3 flex items-center gap-2"><Network size={17} className="text-[#8d5a37]"/><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#a0704b]">Mind map</p><h3 className="text-lg font-black">Connect the concepts</h3></div></div><MermaidViewer code={mind}/></section>
      </>}
  </div>;
};

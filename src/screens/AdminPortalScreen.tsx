import React, { useState, useEffect } from 'react';
import { Department, ScreenId, Subject } from '../types';
import {
  ShieldCheck,
  PlusCircle,
  FileText,
  Upload,
  BookOpen,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Layers,
  Database,
  Edit3,
  Save,
  FolderPlus
} from 'lucide-react';

interface AdminPortalScreenProps {
  onNavigate: (screen: ScreenId) => void;
  subjects: Subject[];
  onRefreshSubjects: () => Promise<void>;
}

export const AdminPortalScreen: React.FC<AdminPortalScreenProps> = ({
  onNavigate,
  subjects,
  onRefreshSubjects
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'add-subject' | 'add-resource' | 'ai-config'>('manage');
  const [aiProvider, setAiProvider] = useState<'offline' | 'groq' | 'gemini'>('offline');
  const [aiModel, setAiModel] = useState('');
  const [aiKey, setAiKey] = useState('');
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiSecretReady, setAiSecretReady] = useState(false);
  const [aiConfigMessage, setAiConfigMessage] = useState('');
  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalSubjects: subjects.length,
    totalFiles: subjects.length * 6,
    totalQuestions: subjects.reduce((acc, s) => acc + (s.questionBank?.length || 0), 0)
  });

  // New Subject Form State
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjCode, setNewSubjCode] = useState('');
  const [newSubjDescription, setNewSubjDescription] = useState('');
  const [newSubjUnits, setNewSubjUnits] = useState([
    'Unit I: Fundamental Principles & Nomenclature',
    'Unit II: Governing Mechanisms & Unit Operations',
    'Unit III: Kinetics, Formulations & Process Design',
    'Unit IV: Quality Parameters & Thermal Operations',
    'Unit V: Industrial Applications & Standards'
  ]);
  const [newSubjTopics, setNewSubjTopics] = useState('');
  const [isSubmittingSubj, setIsSubmittingSubj] = useState(false);
  const [subjectSuccessMsg, setSubjectSuccessMsg] = useState('');

  // Add Resource Form State
  const [selectedSubjName, setSelectedSubjName] = useState(subjects[0]?.name || 'Food Microbiology');
  const [resourceType, setResourceType] = useState<'course-materials' | 'previous-papers' | 'question-bank' | 'marks-pattern' | 'answer-style' | 'syllabus'>('course-materials');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [resourceUnit, setResourceUnit] = useState('All Units');
  const [resourceAuthor, setResourceAuthor] = useState('KL Department Faculty');
  const [resourceContent, setResourceContent] = useState('');
  const [isSavingResource, setIsSavingResource] = useState(false);
  const [resourceSuccessMsg, setResourceSuccessMsg] = useState('');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);

  // Fetch admin stats on mount
  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '') } })
      .then((res) => res.json())
      .then((data) => {
        if (data.totalSubjects) {
          setStats({
            totalSubjects: data.totalSubjects,
            totalFiles: data.totalFiles,
            totalQuestions: data.totalQuestions
          });
        }
      })
      .catch(() => {});
  }, [subjects]);

  useEffect(() => {
    if (activeTab !== 'ai-config') return;
    fetch('/api/admin/ai-config', { headers: { Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '') } })
      .then(res => res.json())
      .then(data => {
        setAiProvider(data.provider || 'offline');
        setAiModel(data.model || '');
        setAiConfigured(Boolean(data.configured));
        setAiSecretReady(Boolean(data.secretConfigured));
      })
      .catch(() => setAiConfigMessage('Could not load AI configuration.'));
  }, [activeTab]);

  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAiConfig(true);
    setAiConfigMessage('');
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '')
        },
        body: JSON.stringify({ provider: aiProvider, model: aiModel, apiKey: aiKey })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save AI configuration.');
      setAiConfigured(Boolean(data.configured));
      setAiKey('');
      setAiConfigMessage('Central AI configuration saved. Students will use this provider automatically.');
    } catch (err: any) {
      setAiConfigMessage(err.message || 'Could not save AI configuration.');
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  // Load existing resource content and metadata when subject or resource type changes
  useEffect(() => {
    const targetSubj = subjects.find((s) => s.name === selectedSubjName);
    if (!targetSubj) return;

    // Check if matching resource exists in pre-loaded subject.resources
    const existingRes = targetSubj.resources?.find((r) => r.resourceType === resourceType);
    if (existingRes) {
      setResourceTitle(existingRes.title || '');
      setResourceDescription(existingRes.description || '');
      setResourceUnit(existingRes.unit || 'All Units');
      setResourceAuthor(existingRes.author || 'KL Department Faculty');
    } else {
      const typeLabelMap: Record<string, string> = {
        'course-materials': 'Official Lecture Handouts & Course Material',
        'previous-papers': 'Previous Semester Examination Papers',
        'question-bank': 'Graded Question Bank (2M, 5M, 10M)',
        'marks-pattern': 'Marks Pattern & Evaluation Scheme',
        'answer-style': 'Examiner Answer Presentation Guide',
        'syllabus': 'Official Syllabus & Unit Learning Outcomes'
      };
      setResourceTitle(`${selectedSubjName} ${typeLabelMap[resourceType] || 'Resource Material'}`);
      setResourceDescription(`Reference material and lecture handouts for ${selectedSubjName} under KL curriculum.`);
      setResourceUnit('All Units');
      setResourceAuthor('KL Department Faculty');
    }

    fetch(`/api/subjects/${targetSubj.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (resourceType === 'course-materials') setResourceContent(data.courseMaterials || '');
        else if (resourceType === 'previous-papers') setResourceContent(data.previousPapers || '');
        else if (resourceType === 'marks-pattern') setResourceContent(data.marksPattern || '');
        else if (resourceType === 'answer-style') setResourceContent(data.answerStyle || '');
        else if (resourceType === 'question-bank') setResourceContent(JSON.stringify(data.questionBank || [], null, 2));
        else if (resourceType === 'syllabus') {
          const { id, name, code, description, department, units, topics } = data;
          setResourceContent(JSON.stringify({ id, name, code, description, department, units, topics }, null, 2));
        }

        if (data.resources && Array.isArray(data.resources)) {
          const r = data.resources.find((item: any) => item.resourceType === resourceType);
          if (r) {
            setResourceTitle(r.title || '');
            setResourceDescription(r.description || '');
            setResourceUnit(r.unit || 'All Units');
            setResourceAuthor(r.author || 'KL Department Faculty');
          }
        }
      })
      .catch(() => {});
  }, [selectedSubjName, resourceType, subjects]);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim() || !newSubjCode.trim()) return;

    setIsSubmittingSubj(true);
    setSubjectSuccessMsg('');

    try {
      const res = await fetch('/api/admin/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '') },
        body: JSON.stringify({
          name: newSubjName.trim(),
          code: newSubjCode.trim(),
          description: newSubjDescription.trim(),
          department: 'Food Technology',
          units: newSubjUnits.filter((u) => u.trim().length > 0),
          topics: newSubjTopics.split(',').map((t) => t.trim()).filter((t) => t.length > 0)
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create subject');

      setSubjectSuccessMsg(`Subject "${newSubjName}" successfully created with description and 6 initialized resource files!`);
      setNewSubjName('');
      setNewSubjCode('');
      setNewSubjDescription('');
      setNewSubjTopics('');
      await onRefreshSubjects();
      setTimeout(() => setSubjectSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingSubj(false);
    }
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjName || !resourceContent.trim()) return;

    setIsSavingResource(true);
    setResourceSuccessMsg('');

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '') },
        body: JSON.stringify({
          subjectName: selectedSubjName,
          department: 'Food Technology',
          resourceType,
          title: resourceTitle.trim(),
          description: resourceDescription.trim(),
          unit: resourceUnit.trim(),
          author: resourceAuthor.trim(),
          content: resourceContent
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save resource');

      setResourceSuccessMsg(`Resource "${resourceTitle || json.file}" successfully saved with description to Knowledge Base!`);
      await onRefreshSubjects();
      setTimeout(() => setResourceSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingResource(false);
    }
  };

  const handleDeleteSubject = async (subjName: string) => {
    if (!confirm(`Are you sure you want to delete "${subjName}" and all its knowledge base files?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/subjects/${encodeURIComponent(subjName)}?department=Food+Technology`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('studymate_token') || '') }
      });
      if (!res.ok) throw new Error('Failed to delete subject');
      await onRefreshSubjects();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const insertQuestionTemplate = () => {
    const sample = `[
  {
    "id": "q-sample-1",
    "topic": "Thermal Death Kinetics (D, z, F Values)",
    "marks": 10,
    "unit": 4,
    "paperYear": "KL End Sem May 2024",
    "question": "Mathematically derive D-value, z-value, and F-value in thermal bacteriology and explain 12D concept in commercial canning."
  },
  {
    "id": "q-sample-2",
    "topic": "Alkaline Phosphatase Indicator Test",
    "marks": 2,
    "unit": 3,
    "paperYear": "KL In-Sem 2 2024",
    "question": "Why is Alkaline Phosphatase used as indicator enzyme to verify milk pasteurization?"
  }
]`;
    setResourceContent(sample);
  };

  const insertRubricTemplate = () => {
    const sample = `# KL University Marks Pattern & Grading Rubric
Subject: ${selectedSubjName} | Department: Food Technology

## 2 Marks Questions (20-40 words)
- Direct scientific definition, units, zero fluff.

## 5 Marks Questions (120-180 words)
- 4-5 bulleted points, subheadings, mini-flowchart.

## 10 Marks Questions (350-500 words)
- Comprehensive essay: Intro, Scientific Principle, Step-by-step Mechanism, Labeled Flowchart, Industrial Applications, Conclusion.`;
    setResourceContent(sample);
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl mx-auto">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg border border-[#e3d6cb] bg-[#ffffff] text-[#64748b] hover:text-[#172554] transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-sans font-bold tracking-wider uppercase text-[#2563eb]">
                Knowledge Base Management
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Admin Mode
              </span>
            </div>
            <h1 className="text-xl font-serif font-bold text-[#172554] leading-tight">
              Food Technology Admin Portal
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('knowledge-base')}
          className="text-xs font-semibold text-[#2563eb] hover:underline flex items-center space-x-1"
        >
          <BookOpen size={14} />
          <span>View Drive Library</span>
        </button>
      </div>

      <p className="text-xs text-[#64748b]">
        Manage subjects and add resource files (materials, past papers, question banks, rubrics) directly to the KL Knowledge Base library.
      </p>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#64748b] block font-sans uppercase tracking-wider">
            Total Subjects
          </span>
          <span className="text-xl font-mono font-bold text-[#2563eb]">
            {stats.totalSubjects}
          </span>
          <span className="text-[10px] text-emerald-700 block">Food Technology</span>
        </div>

        <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#64748b] block font-sans uppercase tracking-wider">
            Active Files
          </span>
          <span className="text-xl font-mono font-bold text-[#2563eb]">
            {stats.totalFiles}
          </span>
          <span className="text-[10px] text-[#64748b] block">6 items/subject</span>
        </div>

        <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-3 shadow-sm text-center space-y-0.5">
          <span className="text-[10px] text-[#64748b] block font-sans uppercase tracking-wider">
            Question Bank
          </span>
          <span className="text-xl font-mono font-bold text-emerald-700">
            {stats.totalQuestions}
          </span>
          <span className="text-[10px] text-[#64748b] block">KL Past Questions</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-[#e3d6cb] pb-1">
                  <button
            type="button"
            onClick={() => setActiveTab('ai-config')}
            className={`px-3 py-2 rounded-xl text-xs font-bold ${activeTab === 'ai-config' ? 'bg-[#172554] text-white' : 'bg-[#f1f5f9] text-[#5f4939] hover:bg-[#dbeafe]'}`}
          >
            AI Control
          </button>
<button
          onClick={() => setActiveTab('manage')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'manage'
              ? 'border-brand-800 text-[#2563eb]'
              : 'border-transparent text-[#64748b] hover:text-[#172554]'
          }`}
        >
          Subject Catalog ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('add-subject')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
            activeTab === 'add-subject'
              ? 'border-brand-800 text-[#2563eb]'
              : 'border-transparent text-[#64748b] hover:text-[#172554]'
          }`}
        >
          <FolderPlus size={14} />
          <span>Add New Subject</span>
        </button>
        <button
          onClick={() => setActiveTab('add-resource')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
            activeTab === 'add-resource'
              ? 'border-brand-800 text-[#2563eb]'
              : 'border-transparent text-[#64748b] hover:text-[#172554]'
          }`}
        >
          <Upload size={14} />
          <span>Add / Edit Materials</span>
        </button>
      </div>

      {activeTab === 'ai-config' && (
        <div className="rounded-[24px] border border-[#dbe3ee] bg-[#ffffff] p-5 shadow-sm">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ead4bd] text-[#714628]"><ShieldCheck size={20} /></div>
            <div>
              <h3 className="text-base font-black text-[#172554]">Central AI control</h3>
              <p className="mt-1 text-xs leading-5 text-[#64748b]">This is the only place where an application-wide Groq or Gemini API key can be configured. The key is encrypted server-side and is never sent back to students.</p>
            </div>
          </div>
          <form onSubmit={handleSaveAiConfig} className="space-y-4">
            {!aiSecretReady && <div className="rounded-2xl border border-[#efc9b9] bg-[#fff0ec] p-3 text-xs font-semibold text-[#9c4637]">Server protection is not initialized yet. Set <code>STUDYMATE_CONFIG_SECRET</code> on Render before saving a key.</div>}
            {aiConfigMessage && <div className="rounded-2xl border border-[#d9c8b8] bg-[#f8fafc] p-3 text-xs font-semibold text-[#5d4738]">{aiConfigMessage}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#334155]">Provider</span>
                <select value={aiProvider} onChange={e => setAiProvider(e.target.value as any)} className="auth-input">
                  <option value="offline">Offline knowledge engine</option>
                  <option value="groq">Groq</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#334155]">Model</span>
                <input value={aiModel} onChange={e => setAiModel(e.target.value)} placeholder={aiProvider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-1.5-flash'} className="auth-input" />
              </label>
            </div>
            {aiProvider !== 'offline' && (
              <label className="block"><span className="mb-1.5 block text-xs font-bold text-[#334155]">New API key</span>
                <input value={aiKey} onChange={e => setAiKey(e.target.value)} type="password" placeholder="Paste a new key; it will not be displayed again" className="auth-input font-mono" required />
              </label>
            )}
            <div className="flex items-center justify-between rounded-2xl border border-[#e4d5c6] bg-[#f8fafc] p-4">
              <div><p className="text-xs font-extrabold text-[#334155]">Current status</p><p className="mt-1 text-[11px] text-[#64748b]">{aiConfigured ? 'A central provider is configured.' : 'No cloud provider is configured; offline mode is available.'}</p></div>
              <span className={`rounded-full px-3 py-1 text-[10px] font-black ${aiConfigured ? 'bg-[#dcebd5] text-[#4f6d45]' : 'bg-[#eee2d8] text-[#64748b]'}`}>{aiConfigured ? 'CONFIGURED' : 'OFFLINE'}</span>
            </div>
            <button disabled={isSavingAiConfig || !aiSecretReady} className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#643c20] disabled:opacity-50">{isSavingAiConfig ? 'Saving securely…' : 'Save central AI configuration'}</button>
          </form>
        </div>
      )}

      {/* TAB 1: SUBJECT CATALOG & MANAGE */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans uppercase tracking-wider font-bold text-[#64748b]">
              Active Food Technology Subjects
            </span>
            <span className="text-[10px] text-[#64748b]">
              Live in `knowledge-base/Food Technology/`
            </span>
          </div>

          <div className="space-y-2.5">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-4 shadow-sm space-y-3 hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle border border-[#e3d6cb] text-[#172554]">
                        {subj.code}
                      </span>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-[#2563eb]">
                        Food Technology
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#172554] font-serif">
                      {subj.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedSubjName(subj.name);
                        setActiveTab('add-resource');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-[#2563eb] text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Edit3 size={13} className="text-[#2563eb]" />
                      <span>Manage Resources</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subj.name)}
                      className="p-1.5 rounded-lg text-[#64748b] hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subject Description */}
                <div className="bg-surface-subtle border border-[#e3d6cb]/70 rounded-lg p-2.5 text-xs text-stone-700 leading-relaxed">
                  <span className="font-semibold text-[#172554] block text-[10px] mb-0.5 uppercase tracking-wider font-sans">
                    Subject Description & Academic Scope:
                  </span>
                  <p>{subj.description || 'Core engineering subject under Department of Food Technology, KL University.'}</p>
                </div>

                {/* Expandable Resources Inventory */}
                <div className="border-t border-[#e3d6cb]/60 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-sans uppercase tracking-wider font-bold text-[#172554] flex items-center space-x-1">
                      <Layers size={13} className="text-[#2563eb]" />
                      <span>Subject Resources ({subj.resources?.length || 6} files)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSubjectId(expandedSubjectId === subj.id ? null : subj.id)}
                      className="text-[11px] font-semibold text-[#2563eb] hover:underline flex items-center space-x-1"
                    >
                      <span>{expandedSubjectId === subj.id ? 'Hide Resource Details' : 'View Resource Details'}</span>
                    </button>
                  </div>

                  {expandedSubjectId === subj.id && (
                    <div className="space-y-2 pt-1 animate-fade-in">
                      {subj.resources && subj.resources.length > 0 ? (
                        subj.resources.map((res) => (
                          <div
                            key={res.id}
                            className="p-2.5 rounded-lg border border-[#e3d6cb] bg-[#ffffff] space-y-1 hover:border-brand-200 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-[#172554]">
                                    {res.title}
                                  </span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-[#64748b] border border-[#e3d6cb]">
                                    {res.fileName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-[#2563eb] font-semibold block">
                                  Scope: {res.unit || 'All Units'} • Author: {res.author || 'KL Department Faculty'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubjName(subj.name);
                                  setResourceType(res.resourceType as any);
                                  setActiveTab('add-resource');
                                }}
                                className="text-[11px] text-[#2563eb] font-semibold hover:underline shrink-0 ml-2"
                              >
                                Edit &rarr;
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-relaxed">
                              {res.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-[#64748b]">
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>course-materials.md</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>previous-papers.md</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>question-bank.json</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>marks-pattern.md</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>answer-style.md</span>
                          </div>
                          <div className="flex items-center space-x-1 text-emerald-800 font-medium">
                            <CheckCircle2 size={13} />
                            <span>syllabus.json</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW SUBJECT */}
      {activeTab === 'add-subject' && (
        <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#172554] font-serif">
              Add New Food Technology Subject
            </h3>
            <p className="text-xs text-[#64748b]">
              Creates a dedicated subject folder with all 6 standard files pre-initialized.
            </p>
          </div>

          {subjectSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{subjectSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubject} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. Beverage Technology"
                  className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  KL Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="e.g. 21BT3230"
                  className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] font-mono focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>
            </div>

            {/* Subject Description */}
            <div>
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Subject Description & Academic Scope *
              </label>
              <textarea
                rows={3}
                required
                value={newSubjDescription}
                onChange={(e) => setNewSubjDescription(e.target.value)}
                placeholder="e.g. Comprehensive curriculum on beverage chemistry, carbonation kinetics, brewing technology, fruit juice processing, packaging integrity, and quality control under KL University..."
                className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Sample Examination Topics (Comma separated)
              </label>
              <input
                type="text"
                value={newSubjTopics}
                onChange={(e) => setNewSubjTopics(e.target.value)}
                placeholder="e.g. Carbonation Dynamics, Beer Brewing Kinetics, Fruit Juice Clarification"
                className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
              />
            </div>

            {/* Units list */}
            <div>
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Course Units (Unit I to V)
              </label>
              <div className="space-y-1.5">
                {newSubjUnits.map((u, i) => (
                  <input
                    key={i}
                    type="text"
                    value={u}
                    onChange={(e) => {
                      const updated = [...newSubjUnits];
                      updated[i] = e.target.value;
                      setNewSubjUnits(updated);
                    }}
                    className="w-full bg-surface border border-[#e3d6cb] rounded-lg p-2 text-xs text-[#172554] focus:outline-none focus:ring-1 focus:ring-brand-800"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingSubj}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-brand-800 text-white hover:bg-brand-900 transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {isSubmittingSubj ? (
                <span>Initializing Subject Files in Knowledge Base...</span>
              ) : (
                <>
                  <PlusCircle size={15} />
                  <span>Create Subject in KL Knowledge Base</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: ADD / EDIT RESOURCES */}
      {activeTab === 'add-resource' && (
        <div className="bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-[#172554] font-serif">
              Add / Update Subject Resources & Materials
            </h3>
            <p className="text-xs text-[#64748b]">
              Configure resource details, descriptions, unit alignment, and file content saved directly to the Knowledge Base.
            </p>
          </div>

          {resourceSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              <span>{resourceSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveResource} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Target Subject:
                </label>
                <select
                  value={selectedSubjName}
                  onChange={(e) => setSelectedSubjName(e.target.value)}
                  className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Select Resource Category:
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                  className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-2.5 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                >
                  <option value="course-materials">📘 Course Materials (course-materials.md)</option>
                  <option value="previous-papers">📜 Previous Exam Papers (previous-papers.md)</option>
                  <option value="question-bank">❓ Question Bank (question-bank.json)</option>
                  <option value="marks-pattern">🎯 Marks Pattern & Rubric (marks-pattern.md)</option>
                  <option value="answer-style">✍️ Answer Style Guide (answer-style.md)</option>
                  <option value="syllabus">🗺️ Syllabus & Units (syllabus.json)</option>
                </select>
              </div>
            </div>

            {/* Resource Details: Title, Description, Unit, Author */}
            <div className="space-y-3 bg-surface-subtle/80 border border-[#e3d6cb] rounded-xl p-3.5">
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#2563eb] flex items-center space-x-1.5">
                <FileText size={13} className="text-[#2563eb]" />
                <span>Resource Details & Grounding Metadata</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#172554] mb-1">
                    Resource Title / Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Unit IV Thermal Death Kinetics Master Lecture Handout"
                    className="w-full bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-2 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#172554] mb-1">
                    Target Unit / Coverage Scope
                  </label>
                  <input
                    type="text"
                    value={resourceUnit}
                    onChange={(e) => setResourceUnit(e.target.value)}
                    placeholder="e.g. Unit IV: Thermal Death Kinetics or Units I - V"
                    className="w-full bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-2 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Resource Description & Coverage Details *
                </label>
                <textarea
                  rows={2}
                  required
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  placeholder="Explain what concepts, equations, previous questions, or rubrics this resource provides..."
                  className="w-full bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-2 text-xs text-[#172554] placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172554] mb-1">
                  Author / Faculty Contributor
                </label>
                <input
                  type="text"
                  value={resourceAuthor}
                  onChange={(e) => setResourceAuthor(e.target.value)}
                  placeholder="e.g. KL Department Faculty / Course Coordinator"
                  className="w-full bg-[#ffffff] border border-[#e3d6cb] rounded-xl p-2 text-xs text-[#172554] focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>
            </div>

            {/* Quick Templates Buttons */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-[#64748b]">Templates:</span>
              <button
                type="button"
                onClick={insertQuestionTemplate}
                className="px-2.5 py-1 rounded-lg border border-[#e3d6cb] bg-surface-subtle hover:bg-surface-border text-[11px] font-medium"
              >
                + Insert Question Bank Template
              </button>
              <button
                type="button"
                onClick={insertRubricTemplate}
                className="px-2.5 py-1 rounded-lg border border-[#e3d6cb] bg-surface-subtle hover:bg-surface-border text-[11px] font-medium"
              >
                + Insert Rubric Template
              </button>
            </div>

            {/* Resource Content Editor */}
            <div>
              <label className="block text-xs font-semibold text-[#172554] mb-1">
                Resource Document Content ({resourceType.endsWith('json') ? 'JSON' : 'Markdown'})
              </label>
              <textarea
                rows={12}
                value={resourceContent}
                onChange={(e) => setResourceContent(e.target.value)}
                placeholder="Enter markdown or JSON content..."
                className="w-full bg-surface border border-[#e3d6cb] rounded-xl p-3 text-xs text-[#172554] font-mono placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingResource}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-brand-800 text-white hover:bg-brand-900 transition-all flex items-center justify-center space-x-1.5 shadow-sm disabled:opacity-50"
            >
              {isSavingResource ? (
                <span>Writing to Knowledge Base Storage...</span>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Resource with Details to Knowledge Base</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

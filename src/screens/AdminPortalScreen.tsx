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
  const [activeTab, setActiveTab] = useState<'manage' | 'add-subject' | 'add-resource'>('manage');

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
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}` })
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}` },
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}` },
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
        headers: { Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}` }
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
    <div className="space-y-4 pb-24 animate-fade-in max-w-4xl mx-auto">
      {/* Screen Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('home')}
            className="p-1.5 rounded-lg border border-surface-border bg-white text-surface-muted hover:text-surface-dark transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-condensed font-bold tracking-wider uppercase text-brand-800">
                Knowledge Base Management
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Admin Mode
              </span>
            </div>
            <h1 className="text-xl font-serif font-bold text-surface-dark leading-tight">
              Food Technology Admin Portal
            </h1>
          </div>
        </div>

        <button
          onClick={() => onNavigate('knowledge-base')}
          className="text-xs font-semibold text-brand-800 hover:underline flex items-center space-x-1"
        >
          <BookOpen size={14} />
          <span>View Drive Library</span>
        </button>
      </div>

      <p className="text-xs text-surface-muted">
        Manage subjects and add resource files (materials, past papers, question banks, rubrics) directly to the KL Knowledge Base library.
      </p>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
            Total Subjects
          </span>
          <span className="text-xl font-mono font-bold text-brand-900">
            {stats.totalSubjects}
          </span>
          <span className="text-[10px] text-emerald-700 block">Food Technology</span>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
            Active Files
          </span>
          <span className="text-xl font-mono font-bold text-brand-900">
            {stats.totalFiles}
          </span>
          <span className="text-[10px] text-surface-muted block">6 items/subject</span>
        </div>

        <div className="bg-white border border-surface-border rounded-xl p-3 shadow-mobile-card text-center space-y-0.5">
          <span className="text-[10px] text-surface-muted block font-condensed uppercase tracking-wider">
            Question Bank
          </span>
          <span className="text-xl font-mono font-bold text-emerald-700">
            {stats.totalQuestions}
          </span>
          <span className="text-[10px] text-surface-muted block">KL Past Questions</span>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 border-b border-surface-border pb-1">
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'manage'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-surface-muted hover:text-surface-dark'
          }`}
        >
          Subject Catalog ({subjects.length})
        </button>
        <button
          onClick={() => setActiveTab('add-subject')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
            activeTab === 'add-subject'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-surface-muted hover:text-surface-dark'
          }`}
        >
          <FolderPlus size={14} />
          <span>Add New Subject</span>
        </button>
        <button
          onClick={() => setActiveTab('add-resource')}
          className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1 ${
            activeTab === 'add-resource'
              ? 'border-brand-800 text-brand-800'
              : 'border-transparent text-surface-muted hover:text-surface-dark'
          }`}
        >
          <Upload size={14} />
          <span>Add / Edit Materials</span>
        </button>
      </div>

      {/* TAB 1: SUBJECT CATALOG & MANAGE */}
      {activeTab === 'manage' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-condensed uppercase tracking-wider font-bold text-surface-muted">
              Active Food Technology Subjects
            </span>
            <span className="text-[10px] text-surface-muted">
              Live in `knowledge-base/Food Technology/`
            </span>
          </div>

          <div className="space-y-2.5">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="bg-white border border-surface-border rounded-xl p-4 shadow-mobile-card space-y-3 hover:border-brand-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle border border-surface-border text-surface-dark">
                        {subj.code}
                      </span>
                      <span className="text-[10px] font-condensed font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-800">
                        Food Technology
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-surface-dark font-serif">
                      {subj.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setSelectedSubjName(subj.name);
                        setActiveTab('add-resource');
                      }}
                      className="px-2.5 py-1.5 rounded-lg border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-900 text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Edit3 size={13} className="text-brand-800" />
                      <span>Manage Resources</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(subj.name)}
                      className="p-1.5 rounded-lg text-surface-muted hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Subject Description */}
                <div className="bg-surface-subtle border border-surface-border/70 rounded-lg p-2.5 text-xs text-stone-700 leading-relaxed">
                  <span className="font-semibold text-surface-dark block text-[10px] mb-0.5 uppercase tracking-wider font-condensed">
                    Subject Description & Academic Scope:
                  </span>
                  <p>{subj.description || 'Core engineering subject under Department of Food Technology, KL University.'}</p>
                </div>

                {/* Expandable Resources Inventory */}
                <div className="border-t border-surface-border/60 pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-condensed uppercase tracking-wider font-bold text-surface-dark flex items-center space-x-1">
                      <Layers size={13} className="text-brand-800" />
                      <span>Subject Resources ({subj.resources?.length || 6} files)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedSubjectId(expandedSubjectId === subj.id ? null : subj.id)}
                      className="text-[11px] font-semibold text-brand-800 hover:underline flex items-center space-x-1"
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
                            className="p-2.5 rounded-lg border border-surface-border bg-white space-y-1 hover:border-brand-200 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-surface-dark">
                                    {res.title}
                                  </span>
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-surface-muted border border-surface-border">
                                    {res.fileName}
                                  </span>
                                </div>
                                <span className="text-[10px] text-brand-800 font-semibold block">
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
                                className="text-[11px] text-brand-800 font-semibold hover:underline shrink-0 ml-2"
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-surface-muted">
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
        <div className="bg-white border border-surface-border rounded-xl p-5 shadow-mobile-card space-y-4">
          <div>
            <h3 className="text-sm font-bold text-surface-dark font-serif">
              Add New Food Technology Subject
            </h3>
            <p className="text-xs text-surface-muted">
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
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  placeholder="e.g. Beverage Technology"
                  className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  KL Course Code *
                </label>
                <input
                  type="text"
                  required
                  value={newSubjCode}
                  onChange={(e) => setNewSubjCode(e.target.value)}
                  placeholder="e.g. 21BT3230"
                  className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark font-mono focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>
            </div>

            {/* Subject Description */}
            <div>
              <label className="block text-xs font-semibold text-surface-dark mb-1">
                Subject Description & Academic Scope *
              </label>
              <textarea
                rows={3}
                required
                value={newSubjDescription}
                onChange={(e) => setNewSubjDescription(e.target.value)}
                placeholder="e.g. Comprehensive curriculum on beverage chemistry, carbonation kinetics, brewing technology, fruit juice processing, packaging integrity, and quality control under KL University..."
                className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-surface-dark mb-1">
                Sample Examination Topics (Comma separated)
              </label>
              <input
                type="text"
                value={newSubjTopics}
                onChange={(e) => setNewSubjTopics(e.target.value)}
                placeholder="e.g. Carbonation Dynamics, Beer Brewing Kinetics, Fruit Juice Clarification"
                className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
              />
            </div>

            {/* Units list */}
            <div>
              <label className="block text-xs font-semibold text-surface-dark mb-1">
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
                    className="w-full bg-surface border border-surface-border rounded-lg p-2 text-xs text-surface-dark focus:outline-none focus:ring-1 focus:ring-brand-800"
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
        <div className="bg-white border border-surface-border rounded-xl p-5 shadow-mobile-card space-y-4">
          <div>
            <h3 className="text-sm font-bold text-surface-dark font-serif">
              Add / Update Subject Resources & Materials
            </h3>
            <p className="text-xs text-surface-muted">
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
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  Target Subject:
                </label>
                <select
                  value={selectedSubjName}
                  onChange={(e) => setSelectedSubjName(e.target.value)}
                  className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  Select Resource Category:
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value as any)}
                  className="w-full bg-surface border border-surface-border rounded-xl p-2.5 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
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
            <div className="space-y-3 bg-surface-subtle/80 border border-surface-border rounded-xl p-3.5">
              <div className="text-[11px] font-condensed font-bold uppercase tracking-wider text-brand-800 flex items-center space-x-1.5">
                <FileText size={13} className="text-brand-800" />
                <span>Resource Details & Grounding Metadata</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-dark mb-1">
                    Resource Title / Document Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceTitle}
                    onChange={(e) => setResourceTitle(e.target.value)}
                    placeholder="e.g. Unit IV Thermal Death Kinetics Master Lecture Handout"
                    className="w-full bg-white border border-surface-border rounded-xl p-2 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-dark mb-1">
                    Target Unit / Coverage Scope
                  </label>
                  <input
                    type="text"
                    value={resourceUnit}
                    onChange={(e) => setResourceUnit(e.target.value)}
                    placeholder="e.g. Unit IV: Thermal Death Kinetics or Units I - V"
                    className="w-full bg-white border border-surface-border rounded-xl p-2 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  Resource Description & Coverage Details *
                </label>
                <textarea
                  rows={2}
                  required
                  value={resourceDescription}
                  onChange={(e) => setResourceDescription(e.target.value)}
                  placeholder="Explain what concepts, equations, previous questions, or rubrics this resource provides..."
                  className="w-full bg-white border border-surface-border rounded-xl p-2 text-xs text-surface-dark placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-dark mb-1">
                  Author / Faculty Contributor
                </label>
                <input
                  type="text"
                  value={resourceAuthor}
                  onChange={(e) => setResourceAuthor(e.target.value)}
                  placeholder="e.g. KL Department Faculty / Course Coordinator"
                  className="w-full bg-white border border-surface-border rounded-xl p-2 text-xs text-surface-dark focus:outline-none focus:ring-2 focus:ring-brand-800/30"
                />
              </div>
            </div>

            {/* Quick Templates Buttons */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-surface-muted">Templates:</span>
              <button
                type="button"
                onClick={insertQuestionTemplate}
                className="px-2.5 py-1 rounded-lg border border-surface-border bg-surface-subtle hover:bg-surface-border text-[11px] font-medium"
              >
                + Insert Question Bank Template
              </button>
              <button
                type="button"
                onClick={insertRubricTemplate}
                className="px-2.5 py-1 rounded-lg border border-surface-border bg-surface-subtle hover:bg-surface-border text-[11px] font-medium"
              >
                + Insert Rubric Template
              </button>
            </div>

            {/* Resource Content Editor */}
            <div>
              <label className="block text-xs font-semibold text-surface-dark mb-1">
                Resource Document Content ({resourceType.endsWith('json') ? 'JSON' : 'Markdown'})
              </label>
              <textarea
                rows={12}
                value={resourceContent}
                onChange={(e) => setResourceContent(e.target.value)}
                placeholder="Enter markdown or JSON content..."
                className="w-full bg-surface border border-surface-border rounded-xl p-3 text-xs text-surface-dark font-mono placeholder-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-800/30 leading-relaxed"
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

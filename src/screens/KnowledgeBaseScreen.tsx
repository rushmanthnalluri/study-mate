import React, { useMemo, useState } from 'react';
import { Department, ScreenId, Subject } from '../types';
import { ArrowLeft, BookOpen, Copy, Download, Eye, FileText, X, Check, Database } from 'lucide-react';
import { EmptyState, EditorialCard, PageHeader, SectionLabel } from '../components/Editorial';

interface LibraryResource {
  id: string;
  title: string;
  resourceType: string;
  fileName: string;
  description: string;
  content: string;
}

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
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [activeFile, setActiveFile] = useState<LibraryResource | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredSubjects = useMemo(
    () => subjects.filter((subject) => deptFilter === 'All' || subject.department === deptFilter),
    [subjects, deptFilter]
  );

  const currentSubject =
    filteredSubjects.find((subject) => subject.id === selectedSubjectId) ||
    subjects.find((subject) => subject.id === selectedSubjectId) ||
    filteredSubjects[0] ||
    subjects[0];

  const resources = useMemo<LibraryResource[]>(() => {
    if (!currentSubject) return [];

    const published: LibraryResource[] = [];
    const addTextResource = (id: string, title: string, resourceType: string, fileName: string, value?: string) => {
      if (value?.trim()) published.push({
        id,
        title,
        resourceType,
        fileName,
        description: 'Administrator-published resource',
        content: value
      });
    };

    addTextResource('course-materials', 'Course materials', 'course-materials', 'course-materials.md', currentSubject.courseMaterials);
    addTextResource('previous-papers', 'Previous papers', 'previous-papers', 'previous-papers.md', currentSubject.previousPapers);
    addTextResource('marks-pattern', 'Marks pattern', 'marks-pattern', 'marks-pattern.md', currentSubject.marksPattern);
    addTextResource('answer-style', 'Answer style', 'answer-style', 'answer-style.md', currentSubject.answerStyle);

    if (currentSubject.questionBank?.length) {
      published.push({
        id: 'question-bank',
        title: 'Question bank',
        resourceType: 'question-bank',
        fileName: 'question-bank.json',
        description: currentSubject.questionCount + ' administrator-published questions',
        content: JSON.stringify(currentSubject.questionBank, null, 2)
      });
    }

    if (currentSubject.units.length || currentSubject.topics.length) {
      published.push({
        id: 'syllabus',
        title: 'Syllabus & metadata',
        resourceType: 'syllabus',
        fileName: 'syllabus.json',
        description: 'Published subject metadata',
        content: JSON.stringify({
          id: currentSubject.id,
          name: currentSubject.name,
          code: currentSubject.code,
          department: currentSubject.department,
          units: currentSubject.units,
          topics: currentSubject.topics
        }, null, 2)
      });
    }

    for (const resource of currentSubject.resources || []) {
      if (published.some((item) => item.id === resource.id)) continue;
      published.push({
        id: resource.id,
        title: resource.title,
        resourceType: resource.resourceType || 'resource',
        fileName: resource.fileName || 'managed-resource.txt',
        description: resource.description || 'Administrator-published resource',
        content: resource.description || ''
      });
    }

    return published;
  }, [currentSubject]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = (resource: SubjectResourceItem) => {
    if (!resource.content) return;
    const blob = new Blob([resource.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resource.fileName || resource.title.replace(/\s+/g, '-').toLowerCase() + '.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="editorial-page-wide space-y-10 animate-fade-in">
      <PageHeader
        eyebrow="Knowledge base"
        title="Published resources"
        description="This library displays only resources published by an administrator for your account. No synthetic folders, exam catalogs or fallback files are created in the student interface."
        actions={
          <button type="button" onClick={() => onNavigate('home')} className="editorial-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold">
            <ArrowLeft size={15} /> Home
          </button>
        }
      />

      {subjects.length === 0 ? (
        <EmptyState
          icon={<Database size={30} />}
          title="No subjects published"
          description="There are currently no administrator-published subjects available for your account."
        />
      ) : (
        <>
          <EditorialCard className="p-5 sm:p-6">
            <SectionLabel>Library filters</SectionLabel>
            <div className="grid gap-4 md:grid-cols-[auto_1fr]">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {['All', ...Array.from(new Set(subjects.map((subject) => subject.department).filter(Boolean)))].map((department) => (
                  <button
                    key={department}
                    type="button"
                    onClick={() => setDeptFilter(department as Department)}
                    className={deptFilter === department ? 'editorial-primary whitespace-nowrap px-4 py-2 text-xs' : 'editorial-secondary whitespace-nowrap px-4 py-2 text-xs'}
                  >
                    {department === 'All' ? 'All departments' : department}
                  </button>
                ))}
              </div>

              <label className="space-y-2">
                <span className="small-caps text-[var(--muted-foreground)]">Subject</span>
                <select
                  value={currentSubject?.id || ''}
                  onChange={(event) => setSelectedSubjectId(event.target.value)}
                  className="editorial-input w-full"
                >
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} · {subject.code}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </EditorialCard>

          {currentSubject ? (
            <section className="space-y-5">
              <div>
                <p className="small-caps text-[var(--accent)]">{currentSubject.code} · {currentSubject.department}</p>
                <h2 className="mt-1 font-serif text-3xl text-[var(--foreground)]">{currentSubject.name}</h2>
                {currentSubject.description && (
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">{currentSubject.description}</p>
                )}
              </div>

              {resources.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={30} />}
                  title="No resources published"
                  description="The subject exists, but an administrator has not published any resources for it yet."
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {resources.map((resource) => (
                    <EditorialCard key={resource.id} className="flex min-h-48 flex-col p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--accent)]">
                          <FileText size={17} />
                        </div>
                        <span className="small-caps text-[var(--muted-foreground)]">{resource.resourceType || 'Resource'}</span>
                      </div>
                      <h3 className="mt-5 font-serif text-xl leading-tight text-[var(--foreground)]">{resource.title}</h3>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted-foreground)]">{resource.description}</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                        <span className="truncate font-mono text-[10px] text-[var(--muted-foreground)]">{resource.fileName}</span>
                        <button
                          type="button"
                          onClick={() => setActiveFile(resource)}
                          className="editorial-ghost shrink-0 px-2 text-xs"
                          aria-label={'View ' + resource.title}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </EditorialCard>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <EmptyState title="Choose a subject" description="Select a published subject to inspect its administrator-managed resources." />
          )}
        </>
      )}

      {activeFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--foreground)]/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col space-y-4 overflow-hidden border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-lg)]">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
              <div className="min-w-0">
                <p className="small-caps text-[var(--accent)]">{activeFile.resourceType}</p>
                <h3 className="mt-1 font-serif text-2xl text-[var(--foreground)]">{activeFile.title}</h3>
                <p className="mt-1 truncate font-mono text-[10px] text-[var(--muted-foreground)]">{activeFile.fileName}</p>
              </div>
              <button type="button" onClick={() => setActiveFile(null)} aria-label="Close resource" className="editorial-ghost shrink-0 px-2">
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--surface)] p-4 text-sm leading-7 text-[var(--foreground)]">
              {activeFile.content || 'No content was supplied for this resource.'}
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border)] pt-4">
              <button type="button" onClick={() => handleCopy(activeFile.content || '')} className="editorial-secondary inline-flex items-center gap-2 px-4 py-2.5 text-xs">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button type="button" onClick={() => handleDownload(activeFile)} className="editorial-primary inline-flex items-center gap-2 px-4 py-2.5 text-xs">
                <Download size={14} /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight } from 'lucide-react';
import {
  Department,
  Subject,
  ExamNote,
  ScreenId,
  FeedbackItem,
  FeedbackSource,
  UserProfile
} from './types';
import { fallbackSubjects, fallbackGoldAnswers } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { SelectSubjectScreen } from './screens/SelectSubjectScreen';
import { EnterTopicScreen } from './screens/EnterTopicScreen';
import { GenerateNotesScreen } from './screens/GenerateNotesScreen';
import { SaveScreen } from './screens/SaveScreen';
import { FeedbackScreen } from './screens/FeedbackScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { PlannerScreen } from './screens/PlannerScreen';
import { FlashcardsScreen } from './screens/FlashcardsScreen';
import { PaperAnalyzerScreen } from './screens/PaperAnalyzerScreen';
import { GlossaryScreen } from './screens/GlossaryScreen';
import { KnowledgeBaseScreen } from './screens/KnowledgeBaseScreen';
import { MockExamScreen } from './screens/MockExamScreen';
import { QuizScreen } from './screens/QuizScreen';
import { StudyStudioScreen } from './screens/StudyStudioScreen';
import { AdminPortalScreen } from './screens/AdminPortalScreen';
import { LmsSyncScreen } from './screens/LmsSyncScreen';
import { AiChatbotScreen } from './screens/AiChatbotScreen';
import { AuthModal } from './components/AuthModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('Food Technology');
  const [subjects, setSubjects] = useState<Subject[]>(fallbackSubjects);
  
  // User Authentication & KL LMS State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('studymate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => !Boolean(localStorage.getItem('studymate_user')));
  const [isAuthValidated, setIsAuthValidated] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  
  const defaultFoodTechSubj = fallbackSubjects[0];
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(defaultFoodTechSubj);
  const [currentNote, setCurrentNote] = useState<ExamNote | null>(null);
  const [savedNotes, setSavedNotes] = useState<ExamNote[]>(() => {
    try {
      const stored = localStorage.getItem('studymate_saved_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    return localStorage.getItem('studymate_night_mode') === 'true';
  });

  const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem('studymate_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Validate the persisted session with the server before trusting localStorage.
  useEffect(() => {
    const token = localStorage.getItem('studymate_token');
    if (!token) {
      setCurrentUser(null);
      setIsAuthValidated(true);
      return;
    }

    fetch('/api/auth/me', { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        if (!data?.user) throw new Error('Invalid session response');
        setCurrentUser(data.user);
        localStorage.setItem('studymate_user', JSON.stringify(data.user));
      })
      .catch(() => {
        localStorage.removeItem('studymate_user');
        localStorage.removeItem('studymate_token');
        setCurrentUser(null);
        setIsAuthModalOpen(true);
      })
      .finally(() => setIsAuthValidated(true));
  }, []);

  const loadSavedNotes = async () => {
    if (!currentUser) {
      setSavedNotes([]);
      return;
    }
    try {
      const res = await fetch('/api/saved-notes', { headers: authHeaders() });
      if (!res.ok) throw new Error('Could not load saved notes');
      const data = await res.json();
      setSavedNotes(Array.isArray(data) ? data : []);
    } catch {
      setSavedNotes([]);
    }
  };

  const toggleNightMode = () => {
    const next = !isNightMode;
    setIsNightMode(next);
    localStorage.setItem('studymate_night_mode', String(next));
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isNightMode]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('API offline');
      const data: Subject[] = await res.json();
      if (data && data.length > 0) {
        setSubjects(data);
        const ftSubj = data.find((s) => s.department === 'Food Technology');
        if (ftSubj && (!currentSubject || currentSubject.department !== 'Food Technology')) {
          setCurrentSubject(ftSubj);
        }
      }
    } catch {
      setSubjects(fallbackSubjects);
    }
  };

  // Sync subjects with backend
  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    loadSavedNotes();
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentScreen === 'admin' && currentUser?.role !== 'admin') {
      setCurrentScreen('home');
    }
  }, [currentScreen, currentUser?.role]);

  // Fetch only real feedback for the authenticated account.
  useEffect(() => {
    if (!currentUser) {
      setFeedbacks([]);
      return;
    }

    fetch('/api/feedback/summary', { headers: authHeaders() })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setFeedbacks(Array.isArray(data?.recent) ? data.recent : []);
      })
      .catch(() => setFeedbacks([]));
  }, [currentUser?.id]);

  // Persist saved notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('studymate_saved_notes', JSON.stringify(savedNotes));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [savedNotes]);

  // Handlers
  const handleSelectSubject = (subj: Subject) => {
    setCurrentSubject(subj);
    if (selectedDepartment !== 'All' && subj.department !== selectedDepartment) {
      setSelectedDepartment(subj.department);
    }
    setCurrentScreen('enter-topic');
  };

  const handleGenerate = async (topic: string, forcedSubject?: string, forcedDept?: Department) => {
    setIsLoading(true);
    const dept = forcedDept || currentSubject?.department || selectedDepartment || 'General Engineering';
    const subjName = forcedSubject || currentSubject?.name || 'Core Curriculum';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          department: dept,
          subject: subjName,
          topic
        })
      });

      if (!res.ok) throw new Error('Generation failed');
      const data: ExamNote = await res.json();
      setCurrentNote(data);
      setCurrentScreen('generate-notes');
    } catch {
      // Offline fallback generation
      const matched = Object.entries(fallbackGoldAnswers).find(
        ([key]) =>
          key.toLowerCase().includes(topic.toLowerCase()) || topic.toLowerCase().includes(key.toLowerCase())
      );

      if (matched) {
        setCurrentNote(matched[1]);
      } else {
        const generated: ExamNote = {
          topic,
          subject: subjName,
          department: dept as Department,
          code: currentSubject?.code || '21KL3001',
          unit: 'Unit: Core Curriculum Principles',
          keywords: [topic, 'Fundamental Concept', 'Governing Equation', 'KL Marks Rubric', 'System Stability', 'Optimization'],
          twoMarks: {
            question: `Define ${topic} according to KL University curriculum.`,
            answer: `${topic} is a foundational concept defined under KL University curriculum as the systematic architecture and mechanism governing state transitions, ensuring deterministic performance and regulatory compliance.`
          },
          fiveMarks: {
            question: `Explain the working principle and structural components of ${topic}.`,
            answer: `### Working Principle
${topic} enforces stability and optimal parameter execution in ${subjName}.

### Key Architectural Tenets
1. **Mathematical Invariant:** Governed by closed-form relations to evaluate stability.
2. **Operational Phases:** Structured in sequential stages to reduce computational overhead.
3. **Boundary Verification:** Parameters checked against safety thresholds.
4. **Engineering Standards:** Complies with standard KL academic rubrics.`
          },
          tenMarks: {
            question: `Explain ${topic} in detail with governing equations, mechanism, diagram, and industrial applications.`,
            answer: `### 1. Introduction & Context in KL Exams
In university examinations for ${dept}, **${topic}** evaluates conceptual depth, mathematical rigor, and engineering applications.

### 2. Governing Laws & Principles
System performance is modeled using differential or state-space relations that bound operating parameters.

### 3. Step-by-Step Mechanism
- Phase 1 (Setup): Boundary parameters and initial conditions verified.
- Phase 2 (Core Computation): Iterative transformation of input vectors.
- Phase 3 (Verification): Consistency checks applied to prevent instability.
- Phase 4 (Output): Deterministic state produced for downstream systems.

### 4. Technical Trade-offs & Advantages
- High predictability and determinism.
- Requires bounded operational regimes to prevent degradation.

### 5. Practical Engineering Applications
Widely deployed in real-time embedded systems, software pipelines, and automated test benches.

### 6. KL Evaluator Key Conclusion
To score maximum marks, ensure keywords are emphasized and the process flowchart is clearly labeled.`
          },
          diagram: {
            type: 'mermaid',
            code: `flowchart TD
    In["Input Parameters: ${topic}"] --> Check{"Stability Validation"}
    Check -- Pass --> Exec["Core Execution Pipeline"]
    Exec --> Out["Deterministic Exam-Ready Output"]
    Check -- Fail --> Rec["Error Recovery Step"]`
          }
        };
        setCurrentNote(generated);
      }
      setCurrentScreen('generate-notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = (note: ExamNote) => {
    const exists = savedNotes.some(
      (n) => n.topic === note.topic && n.subject === note.subject
    );
    if (exists) {
      setSavedNotes(savedNotes.filter((n) => n.topic !== note.topic || n.subject !== note.subject));
    } else {
      const newNote = {
        ...note,
        id: `note-${Date.now()}`,
        savedAt: new Date().toISOString(),
        isReviewed: false
      };
      setSavedNotes([newNote, ...savedNotes]);

      fetch('/api/saved-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newNote)
      }).catch(() => {});
    }
  };

  const handleDeleteNote = (id: string) => {
    setSavedNotes(savedNotes.filter((n) => n.id !== id));
    fetch(`/api/saved-notes/${id}`, { method: 'DELETE', headers: authHeaders() }).catch(() => {});
  };

  const handleToggleReviewed = (id: string) => {
    setSavedNotes(
      savedNotes.map((n) => (n.id === id ? { ...n, isReviewed: !n.isReviewed } : n))
    );
  };

  const handleSubmitFeedback = async (data: {
    topic: string;
    department: string;
    subject: string;
    source: FeedbackSource;
    rating: 'useful' | 'not_useful';
    comment: string;
  }) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.feedback) {
        setFeedbacks([json.feedback, ...feedbacks]);
      }
    } catch {
      // Do not fabricate a successful feedback record when the server is unavailable.
    }
  };

  const isCurrentNoteSaved = Boolean(
    currentNote && savedNotes.some((n) => n.topic === currentNote.topic && n.subject === currentNote.subject)
  );

  const signOut = () => {
    localStorage.removeItem('studymate_user');
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_saved_notes');
    localStorage.removeItem(`studymate_chat_history_${currentUser?.id || ''}`);
    localStorage.removeItem('studymate_chat_history');
    setCurrentUser(null);
    setSavedNotes([]);
    setCurrentNote(null);
    setCurrentScreen('home');
    setIsAuthModalOpen(true);
  };

  if (!isAuthValidated) {
    return (
      <div className="min-h-screen bg-[#f4eadf] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-[#dfc8b1] bg-[#fffaf4] px-7 py-6 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dfc8b1] border-t-[#7c4f2c]" />
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#7c4f2c]">Securing your workspace</p>
          <p className="mt-1 text-[11px] text-[#806f61]">Validating your StudyMate session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4eadf] dark:bg-[#211a16] text-[#3b2b23] dark:text-[#fff8f1] flex flex-col transition-colors">
      {!currentUser && (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#fffaf4_0%,#f4eadf_55%,#ead8c7_100%)] px-5 py-10">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
            <div className="grid w-full overflow-hidden rounded-[36px] border border-[#dfc8b1] bg-[#fffaf4]/95 shadow-[0_30px_90px_rgba(75,55,42,0.16)] md:grid-cols-[1.05fr_.95fr]">
              <div className="hidden bg-[#3b2b23] p-10 text-white md:flex md:flex-col md:justify-between">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d7a86e] text-[#3b2b23]"><GraduationCap size={28}/></div>
                  <p className="mt-8 text-[11px] font-black uppercase tracking-[.22em] text-[#e8caa9]">StudyMate AI</p>
                  <h1 className="mt-3 text-4xl font-black leading-tight">Your private academic workspace.</h1>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#eadbc9]">Create an account to generate notes, take tests, build flashcards, use AI tutoring and keep your study history private to your account.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#eadbc9]"><span className="rounded-2xl bg-white/10 p-3">AI notes & tutor</span><span className="rounded-2xl bg-white/10 p-3">Quiz & model tests</span><span className="rounded-2xl bg-white/10 p-3">Flashcards & voice</span><span className="rounded-2xl bg-white/10 p-3">Flowcharts & mind maps</span></div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#a0704b]">Account required</p>
                <h2 className="mt-2 text-3xl font-black text-[#3b2b23]">Sign in to continue</h2>
                <p className="mt-3 text-sm leading-6 text-[#806f61]">There is no guest mode. Your saved work and AI conversations belong to your account.</p>
                <button onClick={()=>setIsAuthModalOpen(true)} className="auth-primary mt-7">Sign in or create account <ArrowRight size={16}/></button>
                <p className="mt-4 text-center text-[11px] text-[#907d6d]">App-wide AI provider keys are managed only by the administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {currentUser && <>
      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        onNavigate={setCurrentScreen}
        departments={['All', 'CSE', 'AIDS', 'ECE', 'EEE', 'Food Technology']}
        isNightMode={isNightMode}
        onToggleNightMode={toggleNightMode}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Screen Content Body */}
      <main
        className={`flex-1 mx-auto w-full px-4 pt-3 ${
          ['generate-notes', 'admin', 'mock-exam', 'quiz', 'studio', 'dashboard', 'lms-sync', 'chatbot'].includes(currentScreen)
            ? 'max-w-6xl'
            : 'max-w-xl'
        }`}
      >
        {currentScreen === 'home' && (
          <HomeScreen
            subjects={subjects}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            onSelectSubject={handleSelectSubject}
            onNavigate={setCurrentScreen}
            recentNotes={savedNotes}
            onOpenNote={(note) => {
              setCurrentNote(note);
              setCurrentScreen('generate-notes');
            }}
          />
        )}

        {currentScreen === 'quiz' && (
          <QuizScreen onNavigate={setCurrentScreen} subjects={subjects} selectedDepartment={selectedDepartment} />
        )}

        {currentScreen === 'studio' && (
          <StudyStudioScreen note={currentNote} onNavigate={setCurrentScreen} />
        )}

        {currentScreen === 'mock-exam' && (
          <MockExamScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            selectedDepartment={selectedDepartment}
            onOpenGeneratedNote={(topic, subj, dept) => handleGenerate(topic, subj, dept)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            savedNotes={savedNotes}
            selectedDepartment={selectedDepartment}
          />
        )}

        {currentScreen === 'flashcards' && (
          <FlashcardsScreen
            onNavigate={setCurrentScreen}
            onGenerateForTopic={(topic, subj, dept) => handleGenerate(topic, subj, dept)}
            selectedDepartment={selectedDepartment}
          />
        )}

        {currentScreen === 'pdf-analyzer' && (
          <PaperAnalyzerScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            onGenerateQuestion={(topic, subj, dept) => handleGenerate(topic, subj, dept)}
          />
        )}

        {currentScreen === 'planner' && (
          <PlannerScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            onSelectSubject={handleSelectSubject}
          />
        )}

        {currentScreen === 'knowledge-base' && (
          <KnowledgeBaseScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            selectedDepartment={selectedDepartment}
          />
        )}

        {currentScreen === 'glossary' && (
          <GlossaryScreen
            onNavigate={setCurrentScreen}
            onGenerateForTerm={(term, dept) => handleGenerate(term, undefined, dept)}
            selectedDepartment={selectedDepartment}
          />
        )}

        {currentScreen === 'select-subject' && (
          <SelectSubjectScreen
            subjects={subjects}
            selectedDepartment={selectedDepartment}
            onSelectDepartment={setSelectedDepartment}
            onSelectSubject={handleSelectSubject}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'enter-topic' && (
          <EnterTopicScreen
            subject={currentSubject}
            onNavigate={setCurrentScreen}
            onGenerate={(topic) => handleGenerate(topic)}
            isLoading={isLoading}
          />
        )}

        {currentScreen === 'generate-notes' && (
          <GenerateNotesScreen
            note={currentNote}
            onNavigate={setCurrentScreen}
            onSaveNote={handleSaveNote}
            isSaved={isCurrentNoteSaved}
            onOpenFeedback={() => setCurrentScreen('feedback')}
          />
        )}

        {currentScreen === 'save' && (
          <SaveScreen
            savedNotes={savedNotes}
            onOpenNote={(note) => {
              setCurrentNote(note);
              setCurrentScreen('generate-notes');
            }}
            onDeleteNote={handleDeleteNote}
            onToggleReviewed={handleToggleReviewed}
            onNavigate={setCurrentScreen}
          />
        )}

        {currentScreen === 'admin' && currentUser?.role === 'admin' && (
          <AdminPortalScreen
            onNavigate={setCurrentScreen}
            subjects={subjects}
            onRefreshSubjects={fetchSubjects}
          />
        )}

        {currentScreen === 'lms-sync' && (
          <LmsSyncScreen
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigate={setCurrentScreen}
            onSelectSubjectByName={(subjName) => {
              const found = subjects.find(
                (s) =>
                  s.name.toLowerCase().includes(subjName.toLowerCase()) ||
                  subjName.toLowerCase().includes(s.name.toLowerCase())
              );
              if (found) {
                handleSelectSubject(found);
              } else {
                setCurrentScreen('select-subject');
              }
            }}
            onUpdateUser={(updated) => {
              setCurrentUser(updated);
              try {
                localStorage.setItem('studymate_user', JSON.stringify(updated));
              } catch (e) {}
            }}
          />
        )}

        {currentScreen === 'chatbot' && (
          <AiChatbotScreen
            currentUser={currentUser}
            onNavigate={setCurrentScreen}
            selectedDepartment={selectedDepartment}
            onSelectSubjectAndTopic={(subjName, topic) => {
              const found = subjects.find(
                (s) =>
                  s.name.toLowerCase().includes(subjName.toLowerCase()) ||
                  subjName.toLowerCase().includes(s.name.toLowerCase())
              );
              if (found) {
                setCurrentSubject(found);
                if (topic) {
                  handleGenerate(topic, found.name, found.department);
                } else {
                  setCurrentScreen('enter-topic');
                }
              } else {
                setCurrentScreen('select-subject');
              }
            }}
          />
        )}

        {currentScreen === 'feedback' && (
          <FeedbackScreen
            currentTopic={currentNote?.topic || "KL Exam Evaluation"}
            currentDepartment={currentNote?.department || currentSubject?.department || "CSE"}
            currentSubject={currentNote?.subject || currentSubject?.name || "Operating Systems"}
            onNavigate={setCurrentScreen}
            onSubmitFeedback={handleSubmitFeedback}
            recentFeedbacks={feedbacks}
          />
        )}
      </main>

      {/* Floating 24/7 AI Chatbot Button */}
      <FloatingChatbot
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      {/* Bottom Navigation */}
      <BottomNav
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        savedCount={savedNotes.length}
      />

      <button
        type="button"
        onClick={signOut}
        className="fixed bottom-20 right-4 z-30 hidden rounded-xl border border-[#dfc8b1] bg-[#fffaf4] px-3 py-2 text-[10px] font-black text-[#6f4a31] shadow-md hover:bg-[#f4e8dc] sm:block print:hidden"
      >
        Sign out
      </button>

      </>}
      {/* KL University & LMS Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user, token) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('studymate_user', JSON.stringify(user));
            localStorage.setItem('studymate_token', token);
          } catch (e) {}
          if (user.department && user.department !== selectedDepartment && user.department !== 'All') {
            setSelectedDepartment(user.department);
          }
        }}
        onNavigateToLmsSync={() => {
          setIsAuthModalOpen(false);
          setCurrentScreen('lms-sync');
        }}
      />

      {/* Settings Modal (Groq / Gemini API Configuration & Profile) */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={async (updated) => {
          try {
            const res = await fetch('/api/auth/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', ...authHeaders() },
              body: JSON.stringify({ name: updated.name, klId: updated.klId, department: updated.department })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Profile update failed');
            setCurrentUser(data.user);
            localStorage.setItem('studymate_user', JSON.stringify(data.user));
          } catch (error) {
            console.error('Profile update failed:', error);
          }
        }}
        onResetData={() => {
          localStorage.removeItem('studymate_saved_notes');
          localStorage.removeItem('studymate_user');
          localStorage.removeItem('studymate_token');
          setCurrentUser(null);
          setSavedNotes([]);
          setCurrentScreen('home');
        }}
      />
    </div>
  );
};

export default App;

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
import { Header } from './components/Header';
import { AppErrorBoundary } from './components/AppErrorBoundary';
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
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('All');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
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
  
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [currentNote, setCurrentNote] = useState<ExamNote | null>(null);
  const [savedNotes, setSavedNotes] = useState<ExamNote[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appError, setAppError] = useState<string>('');

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

  // StudyMate uses the light editorial theme as the single production UI mode.
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('studymate_night_mode');
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('API offline');
      const data: Subject[] = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0 && !currentSubject) {
        setCurrentSubject(data[0]);
      } else if (!Array.isArray(data) || data.length === 0) {
        setCurrentSubject(null);
      }
    } catch {
      setSubjects([]);
      setCurrentSubject(null);
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

  // Saved notes are authoritative server data; do not cache them in a shared browser key.
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
    setAppError('');
    const dept = forcedDept || currentSubject?.department || selectedDepartment || 'General Engineering';
    const subjName = forcedSubject || currentSubject?.name || 'Core Curriculum';

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ department: dept, subject: subjName, topic })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        signOut();
        throw new Error('Your session expired. Please sign in again.');
      }
      if (!res.ok) throw new Error(data?.error || 'Note generation failed.');
      const note: ExamNote = data;
      setCurrentNote(note);
      setCurrentScreen('generate-notes');
    } catch (err) {
      setAppError(err instanceof Error ? err.message : 'Note generation failed. Please try again.');
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

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() });
    } catch {}
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
      <div className="min-h-screen bg-[#eff6ff] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-[#dbe3ee] bg-[#ffffff] px-7 py-6 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#dbe3ee] border-t-[#2563eb]" />
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#2563eb]">Securing your workspace</p>
          <p className="mt-1 text-[11px] text-[#64748b]">Validating your StudyMate session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eff6ff] dark:bg-[#211a16] text-[#172554] dark:text-[#fff8f1] flex flex-col transition-colors">
      {!currentUser && (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,#ffffff_0%,#eff6ff_55%,#dbeafe_100%)] px-5 py-10">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
            <div className="grid w-full overflow-hidden rounded-[36px] border border-[#dbe3ee] bg-[#ffffff]/95 shadow-[0_30px_90px_rgba(75,55,42,0.16)] md:grid-cols-[1.05fr_.95fr]">
              <div className="hidden bg-[#172554] p-10 text-white md:flex md:flex-col md:justify-between">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#93c5fd] text-[#172554]"><GraduationCap size={28}/></div>
                  <p className="mt-8 text-[11px] font-black uppercase tracking-[.22em] text-[#bfdbfe]">StudyMate AI</p>
                  <h1 className="mt-3 text-4xl font-black leading-tight">Your private academic workspace.</h1>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[#dbeafe]">Create an account to generate notes, take tests, build flashcards, use AI tutoring and keep your study history private to your account.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[#dbeafe]"><span className="rounded-2xl bg-white/10 p-3">AI notes & tutor</span><span className="rounded-2xl bg-white/10 p-3">Quiz & model tests</span><span className="rounded-2xl bg-white/10 p-3">Flashcards & voice</span><span className="rounded-2xl bg-white/10 p-3">Flowcharts & mind maps</span></div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#2563eb]">Account required</p>
                <h2 className="mt-2 text-3xl font-black text-[#172554]">Sign in to continue</h2>
                <p className="mt-3 text-sm leading-6 text-[#64748b]">There is no guest mode. Your saved work and AI conversations belong to your account.</p>
                <button onClick={()=>setIsAuthModalOpen(true)} className="auth-primary mt-7">Sign in or create account <ArrowRight size={16}/></button>
                <p className="mt-4 text-center text-[11px] text-[#64748b]">App-wide AI provider keys are managed only by the administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {appError && currentUser && (
        <div role="alert" className="mx-auto mt-3 flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[#efc4b8] bg-[#fff0ec] px-4 py-3 text-xs font-semibold text-[#8f3328]">
          <span>{appError}</span>
          <button onClick={() => setAppError('')} className="rounded-lg px-2 py-1 hover:bg-[#f8d9d1]" aria-label="Dismiss error">Dismiss</button>
        </div>
      )}
      {currentUser && <>
      <a href="#main-content" className="sr-only-focusable fixed left-3 top-3 z-[100] rounded-xl bg-[#172554] px-4 py-3 text-sm font-bold text-white shadow-lg">Skip to main content</a>

      {/* Top Header */}
      <Header
        currentScreen={currentScreen}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        onNavigate={setCurrentScreen}
        departments={['All', ...Array.from(new Set(subjects.map((subject) => subject.department))).filter(Boolean)] as Department[]}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Screen Content Body */}
      <main
        id="main-content"
        tabIndex={-1}
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
        className="fixed bottom-20 right-4 z-30 hidden rounded-xl border border-[#dbe3ee] bg-[#ffffff] px-3 py-2 text-[10px] font-black text-[#6f4a31] shadow-md hover:bg-[#f4e8dc] sm:block print:hidden"
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
        onChangePassword={async (currentPassword, newPassword) => {
          const res = await fetch('/api/auth/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ currentPassword, newPassword })
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Password change failed');
          localStorage.setItem('studymate_token', data.token);
          setCurrentUser(data.user);
          localStorage.setItem('studymate_user', JSON.stringify(data.user));
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

export default function AppWithErrorBoundary() {
  return <AppErrorBoundary><App /></AppErrorBoundary>;
}

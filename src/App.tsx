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
import { AiChatbotScreen } from './screens/AiChatbotScreen';
import { AuthModal } from './components/AuthModal';
import { FloatingChatbot } from './components/FloatingChatbot';
import { SettingsModal } from './components/SettingsModal';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('All');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  // User authentication state
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
    const token = localStorage.getItem('studymate_token');
    if (!token) {
      setSubjects([]);
      setCurrentSubject(null);
      return;
    }

    try {
      const res = await fetch('/api/subjects', { headers: authHeaders() });
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

  // Academic catalog is private account-scoped content.
  useEffect(() => {
    fetchSubjects();
  }, [currentUser?.id]);

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
    const dept = forcedDept || currentSubject?.department || (selectedDepartment !== 'All' ? selectedDepartment : '');
    const subjName = forcedSubject || currentSubject?.name || '';
    if (!dept || !subjName) {
      setAppError('Select an administrator-published subject before generating notes.');
      setIsLoading(false);
      return;
    }

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

  const handleSaveNote = async (note: ExamNote) => {
    const existing = savedNotes.find(
      (n) => n.topic === note.topic && n.subject === note.subject
    );

    if (existing?.id) {
      try {
        const res = await fetch(`/api/saved-notes/${encodeURIComponent(existing.id)}`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        if (!res.ok) throw new Error('Could not remove saved note.');
        setSavedNotes((current) => current.filter((n) => n.id !== existing.id));
      } catch {
        setAppError('Could not update saved notes. Please try again.');
      }
      return;
    }

    const newNote = {
      ...note,
      id: `note-${Date.now()}`,
      savedAt: new Date().toISOString(),
      isReviewed: false
    };

    try {
      const res = await fetch('/api/saved-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(newNote)
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error('Could not save note.');
      setSavedNotes((current) => [data, ...current.filter(
        (n) => !(n.topic === data.topic && n.subject === data.subject)
      )]);
    } catch {
      setAppError('Could not save this note. Please try again.');
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-notes/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (!res.ok) throw new Error('Could not delete note.');
      setSavedNotes((current) => current.filter((n) => n.id !== id));
    } catch {
      setAppError('Could not delete this note. Please try again.');
    }
  };

  const handleToggleReviewed = async (id: string) => {
    const note = savedNotes.find((n) => n.id === id);
    if (!note) return;
    const nextValue = !note.isReviewed;
    try {
      const res = await fetch(`/api/saved-notes/${encodeURIComponent(id)}/reviewed`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ isReviewed: nextValue })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error('Could not update review state.');
      setSavedNotes((current) => current.map((n) => n.id === id ? data : n));
    } catch {
      setAppError('Could not update the review state. Please try again.');
    }
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-white px-7 py-6 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--accent)]">Securing your workspace</p>
          <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">Validating your StudyMate session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-app min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col transition-colors">
      {!currentUser && (
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top,var(--accent-foreground)_0%,#FAFAF8_58%,#F5F3F0_100%)] px-5 py-10">
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
            <div className="grid w-full overflow-hidden rounded-lg border border-[var(--border)] bg-white/95 shadow-[0_30px_90px_rgba(75,55,42,0.16)] md:grid-cols-[1.05fr_.95fr]">
              <div className="hidden bg-[var(--foreground)] p-10 text-white md:flex md:flex-col md:justify-between">
                <div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--foreground)]"><GraduationCap size={28}/></div>
                  <p className="mt-8 text-[11px] font-black uppercase tracking-[.22em] text-[var(--accent)]">StudyMate AI</p>
                  <h1 className="mt-3 text-4xl font-black leading-tight">Your private academic workspace.</h1>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--accent-50)]">Create an account to generate notes, take tests, build flashcards, use AI tutoring and keep your study history private to your account.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-[var(--accent-50)]"><span className="rounded-2xl bg-white/10 p-3">AI notes & tutor</span><span className="rounded-2xl bg-white/10 p-3">Quiz & model tests</span><span className="rounded-2xl bg-white/10 p-3">Flashcards & voice</span><span className="rounded-2xl bg-white/10 p-3">Flowcharts & mind maps</span></div>
              </div>
              <div className="flex flex-col justify-center p-7 sm:p-10">
                <p className="text-[10px] font-black uppercase tracking-[.2em] text-[var(--accent)]">Account required</p>
                <h2 className="mt-2 text-3xl font-black text-[var(--foreground)]">Sign in to continue</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">There is no guest mode. Your saved work and AI conversations belong to your account.</p>
                <button onClick={()=>setIsAuthModalOpen(true)} className="auth-primary mt-7">Sign in or create account <ArrowRight size={16}/></button>
                <p className="mt-4 text-center text-[11px] text-[var(--muted-foreground)]">App-wide AI provider keys are managed only by the administrator.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {appError && currentUser && (
        <div role="alert" className="mx-auto mt-3 flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--danger-soft)] px-4 py-3 text-xs font-semibold text-[var(--danger)]">
          <span>{appError}</span>
          <button onClick={() => setAppError('')} className="rounded-lg px-2 py-1 hover:bg-[var(--danger-border)]" aria-label="Dismiss error">Dismiss</button>
        </div>
      )}
      {currentUser && <>
      <a href="#main-content" className="sr-only-focusable fixed left-3 top-3 z-[100] rounded-xl bg-[var(--foreground)] px-4 py-3 text-sm font-bold text-white shadow-lg">Skip to main content</a>

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
          ['generate-notes', 'admin', 'mock-exam', 'quiz', 'studio', 'dashboard', 'chatbot'].includes(currentScreen)
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
            currentTopic={currentNote?.topic || "Study feedback"}
            currentDepartment={currentNote?.department || currentSubject?.department || ""}
            currentSubject={currentNote?.subject || currentSubject?.name || ""}
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
        className="fixed bottom-20 right-4 z-30 hidden rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-[10px] font-black text-[var(--foreground)] shadow-md hover:bg-[var(--accent-50)] sm:block print:hidden"
      >
        Sign out
      </button>

      </>}
      {/* Account authentication */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        canDismiss={Boolean(currentUser)}
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
              body: JSON.stringify({ name: updated.name, klId: updated.klId })
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

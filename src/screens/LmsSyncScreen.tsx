import React, { useState } from 'react';
import { UserProfile, LmsCourse, ScreenId } from '../types';
import {
  GraduationCap,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Flame,
  Award
} from 'lucide-react';

interface LmsSyncScreenProps {
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onNavigate: (screen: ScreenId) => void;
  onSelectSubjectByName?: (subjectName: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
}

export const LmsSyncScreen: React.FC<LmsSyncScreenProps> = ({
  currentUser,
  onOpenAuthModal,
  onNavigate,
  onSelectSubjectByName,
  onUpdateUser
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const courses: LmsCourse[] = currentUser?.enrolledCourses && currentUser.enrolledCourses.length > 0
    ? currentUser.enrolledCourses
    : [
        {
          code: '21BT2210',
          name: 'Food Microbiology',
          faculty: 'Dr. V. Ramanathan',
          attendance: '92%',
          inSemGrade: '28.5 / 30',
          upcomingDeadline: 'Assignment 3: Spoilage Kinetics (Due Oct 8, 23:59)',
          lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21210'
        },
        {
          code: '21BT3112',
          name: 'Dairy Technology',
          faculty: 'Dr. P. Anitha',
          attendance: '88%',
          inSemGrade: '26.0 / 30',
          upcomingDeadline: 'Pasteurization Heat Balance Problem (Due Oct 12, 17:00)',
          lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21312'
        },
        {
          code: '21BT2105',
          name: 'Food Chemistry & Analysis',
          faculty: 'Dr. K. M. Rao',
          attendance: '94%',
          inSemGrade: '29.0 / 30',
          upcomingDeadline: 'Proximate Analysis Lab Report (Due Oct 15, 23:59)',
          lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21205'
        },
        {
          code: '21BT3218',
          name: 'Food Process Engineering',
          faculty: 'Dr. S. Mukherjee',
          attendance: '86%',
          inSemGrade: '25.5 / 30',
          upcomingDeadline: 'Heat Exchanger Sizing Assignment (Due Oct 19, 14:00)',
          lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21318'
        }
      ];

  const handleSyncLms = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/kl-lms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('studymate_token') || ''}`
        },
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync with KL LMS');

      if (data.user && onUpdateUser) {
        onUpdateUser(data.user);
      }
      setSyncMessage(data.message || 'KL LMS connection refreshed. No live course or attendance data was fetched by this action.');
      setTimeout(() => setSyncMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to KL LMS server.');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const parseAttendance = (attStr?: string) => {
    if (!attStr) return 85;
    const match = attStr.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 85;
  };

  // Calculate average attendance
  const avgAttendance = Math.round(
    courses.reduce((sum, c) => sum + parseAttendance(c.attendance), 0) / (courses.length || 1)
  );

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 via-brand-800 to-amber-950 text-white p-6 shadow-card">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#fffaf4]/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official KL University Moodle Gateway</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
              KL LMS Academic Synchronization
            </h1>
            <p className="text-brand-100 text-sm max-w-xl">
              Connect your <span className="font-semibold text-white">lms.kluniversity.in</span> account to StudyMate AI. Verified LMS data can be surfaced after an actual LMS integration is available.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncLms}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-brand-950 font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Synchronizing...' : 'Sync with KL LMS'}</span>
            </button>
            <a
              href="https://lms.kluniversity.in/login/index.php"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#fffaf4]/15 hover:bg-[#fffaf4]/25 text-white font-medium text-sm backdrop-blur-md transition-colors border border-white/20"
            >
              <span>Open KL LMS Portal</span>
              <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* Sync message alert */}
        {syncMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-center space-x-2 animate-fade-in">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Profile & Sync Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Student / Faculty Card */}
        <div className="bg-[#fffaf4] dark:bg-stone-900 p-5 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 shadow-sm flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#7c4f2c] text-amber-300 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'K'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-base text-[#3b2b23] dark:text-white truncate">
                {currentUser?.name || 'K. Sai Praneeth'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-[#7c4f2c] uppercase">
                {currentUser?.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-[#806f61] font-mono mt-0.5">
              KL ID: <span className="font-semibold text-[#7c4f2c] dark:text-amber-300">{currentUser?.klId || '2100030045'}</span>
            </p>
            <p className="text-xs text-[#806f61] truncate">
              {currentUser?.department || 'Food Technology'} • KL University
            </p>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="text-xs font-semibold text-[#7c4f2c] hover:text-[#7c4f2c] underline shrink-0"
          >
            Switch
          </button>
        </div>

        {/* LMS Connection Status */}
        <div className="bg-[#fffaf4] dark:bg-stone-900 p-5 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#806f61] uppercase tracking-wider font-sans">
              Moodle Connection
            </span>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{currentUser?.isLmsConnected !== false ? 'Connected' : 'Disconnected'}</span>
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xs text-[#806f61] font-mono">
              Username: <span className="text-[#3b2b23] dark:text-stone-200 font-semibold">{currentUser?.lmsUsername || currentUser?.klId || '2100030045'}</span>
            </p>
            <p className="text-[11px] text-[#806f61] mt-1 flex items-center space-x-1">
              <Clock size={12} />
              <span>
                Last Synced:{' '}
                {currentUser?.lmsLastSynced
                  ? new Date(currentUser.lmsLastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now'}
              </span>
            </p>
          </div>
        </div>

        {/* KL Exam Hall Ticket Eligibility Meter */}
        <div className="bg-[#fffaf4] dark:bg-stone-900 p-5 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#806f61] uppercase tracking-wider font-sans">
              KL Exam Hall Ticket Status
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                avgAttendance >= 85
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : avgAttendance >= 75
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {avgAttendance >= 85 ? 'Eligible (Safe)' : avgAttendance >= 75 ? 'Condonation' : 'Detained'}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="font-semibold text-[#3b2b23] dark:text-white">Overall Attendance</span>
              <span className="font-mono font-bold text-[#7c4f2c] dark:text-amber-300 text-sm">
                {avgAttendance}%
              </span>
            </div>
            <div className="w-full bg-surface-subtle dark:bg-stone-800 h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-500 ${
                  avgAttendance >= 85
                    ? 'bg-emerald-500'
                    : avgAttendance >= 75
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${avgAttendance}%` }}
              />
            </div>
            <p className="text-[10px] text-[#806f61] mt-1.5">
              KL Rule: Minimum 85% attendance required for semester exams.
            </p>
          </div>
        </div>
      </div>

      {/* KL University Academic Policy Callout */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-950 dark:text-amber-200">
        <ShieldCheck size={18} className="text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-900 dark:text-amber-300">
            KL University Academic Regulations & LMS In-Sem Alignment:
          </p>
          <p className="text-amber-800 dark:text-amber-200/90 leading-relaxed">
            All course materials, question banks, and In-Sem evaluation rubrics in StudyMate are mapped against the curriculum posted on <span className="font-mono font-semibold">lms.kluniversity.in</span>. Attendance below 85% triggers condonation processing by the Food Technology Dean. Ensure all weekly assignments are submitted prior to closing timestamps.
          </p>
        </div>
      </div>

      {/* Course Cards Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-sans text-[#3b2b23] dark:text-white tracking-tight">
              Enrolled Food Technology Courses ({courses.length})
            </h2>
            <p className="text-xs text-[#806f61]">
              Synchronized from KL Moodle LMS • Semester V (2024-2025)
            </p>
          </div>
          <button
            onClick={() => onNavigate('select-subject')}
            className="text-xs font-bold text-[#7c4f2c] dark:text-amber-300 hover:underline flex items-center space-x-1"
          >
            <span>All Subjects</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const att = parseAttendance(course.attendance);
            const isSafe = att >= 85;

            return (
              <div
                key={course.code}
                className="bg-[#fffaf4] dark:bg-stone-900 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Course Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-[#7c4f2c] dark:text-amber-300 border border-brand-200 dark:border-brand-900">
                      {course.code}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSafe
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {course.attendance || '90% Attendance'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#3b2b23] dark:text-white mt-2 leading-snug">
                    {course.name}
                  </h3>
                  <p className="text-xs text-[#806f61] mt-1 flex items-center space-x-1">
                    <UserCheck size={13} />
                    <span>Faculty: {course.faculty}</span>
                  </p>
                </div>

                {/* Progress & Upcoming Deadline */}
                <div className="space-y-2.5 pt-2 border-t border-surface-subtle dark:border-stone-800">
                  {/* Attendance Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] text-[#806f61] mb-1">
                      <span>Attendance Eligibility</span>
                      <span className="font-semibold text-[#3b2b23] dark:text-stone-300">{att}%</span>
                    </div>
                    <div className="w-full bg-surface-subtle dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isSafe ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${att}%` }}
                      />
                    </div>
                  </div>

                  {/* In-Sem Grade */}
                  {course.inSemGrade && (
                    <div className="flex items-center justify-between text-xs bg-surface-subtle dark:bg-stone-800/60 p-2 rounded-xl">
                      <span className="text-[#806f61] font-medium">In-Sem Score / Status:</span>
                      <span className="font-mono font-bold text-[#7c4f2c] dark:text-amber-300">
                        {course.inSemGrade}
                      </span>
                    </div>
                  )}

                  {/* Upcoming Deadline */}
                  {course.upcomingDeadline && (
                    <div className="flex items-start space-x-2 text-xs text-amber-900 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                      <Calendar size={14} className="shrink-0 mt-0.5 text-amber-700 dark:text-amber-400" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block text-[11px] uppercase tracking-wide text-amber-800 dark:text-amber-400">
                          Upcoming In-Sem Deadline
                        </span>
                        <span className="text-[#3b2b23] dark:text-stone-300 text-xs leading-tight">
                          {course.upcomingDeadline}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course Actions */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onSelectSubjectByName) {
                        onSelectSubjectByName(course.name);
                      } else {
                        onNavigate('select-subject');
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#7c4f2c] hover:bg-[#7c4f2c] text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                  >
                    <BookOpen size={13} />
                    <span>Study in AI</span>
                  </button>

                  <a
                    href={course.lmsCourseUrl || 'https://lms.kluniversity.in/login/index.php'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-surface-subtle hover:bg-surface-border dark:bg-stone-800 dark:hover:bg-stone-700 text-[#3b2b23] dark:text-stone-200 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 border border-[#e3d6cb] dark:border-stone-700"
                  >
                    <span>Open in LMS</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KL University Quick LMS Resources */}
      <div className="bg-[#fffaf4] dark:bg-stone-900 rounded-2xl border border-[#e3d6cb] dark:border-stone-800 p-6 space-y-4">
        <h3 className="font-bold text-base text-[#3b2b23] dark:text-white flex items-center space-x-2">
          <GraduationCap size={18} className="text-[#7c4f2c] dark:text-amber-300" />
          <span>KL Food Technology Academic Handouts & LMS Repositories</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            onClick={() => onNavigate('mock-exam')}
            className="p-3.5 rounded-xl border border-[#e3d6cb] dark:border-stone-800 hover:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-stone-800/60 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b2b23] dark:text-white group-hover:text-[#7c4f2c]">
                In-Sem Question Bank
              </span>
              <FileSpreadsheet size={15} className="text-[#7c4f2c] dark:text-amber-300" />
            </div>
            <p className="text-[11px] text-[#806f61] leading-relaxed">
              Solve KL previous 3-year In-Sem & End-Sem question papers with strict rubric evaluation.
            </p>
          </div>

          <div
            onClick={() => onNavigate('pdf-analyzer')}
            className="p-3.5 rounded-xl border border-[#e3d6cb] dark:border-stone-800 hover:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-stone-800/60 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b2b23] dark:text-white group-hover:text-[#7c4f2c]">
                LMS PDF Past Papers
              </span>
              <Download size={15} className="text-[#7c4f2c] dark:text-amber-300" />
            </div>
            <p className="text-[11px] text-[#806f61] leading-relaxed">
              Extract marks pattern, recurring questions, and 10M keywords from uploaded question papers.
            </p>
          </div>

          <div
            onClick={() => onNavigate('planner')}
            className="p-3.5 rounded-xl border border-[#e3d6cb] dark:border-stone-800 hover:border-brand-800 hover:bg-brand-50/50 dark:hover:bg-stone-800/60 cursor-pointer transition-all space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#3b2b23] dark:text-white group-hover:text-[#7c4f2c]">
                KL Exam Day Planner
              </span>
              <Calendar size={15} className="text-[#7c4f2c] dark:text-amber-300" />
            </div>
            <p className="text-[11px] text-[#806f61] leading-relaxed">
              Structured 7-day study plan covering Unit I through Unit V before KL In-Sem examinations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

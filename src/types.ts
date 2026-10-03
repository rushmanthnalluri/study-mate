export type Department = 'All' | 'CSE' | 'AIDS' | 'ECE' | 'EEE' | 'Food Technology';

export interface ExamQuestion {
  id: string;
  topic: string;
  marks: 2 | 5 | 10;
  unit: number;
  paperYear: string;
  question: string;
}

export interface SubjectResourceItem {
  id: string;
  title: string;
  description: string;
  resourceType: string;
  fileName: string;
  unit?: string;
  author?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  department: Department;
  units: string[];
  topics: string[];
  questionCount: number;
  questionBank?: ExamQuestion[];
  previousPapers?: string;
  marksPattern?: string;
  answerStyle?: string;
  resourcesAvailable?: Record<string, boolean>;
  resources?: SubjectResourceItem[];
}

export interface DiagramData {
  type: 'mermaid' | 'svg';
  code: string;
}

export interface GroundedResource {
  type: string;
  title: string;
  file: string;
  excerpt: string;
}

export interface ExamNote {
  id?: string;
  topic: string;
  subject: string;
  department: Department;
  code: string;
  unit: string;
  keywords: string[];
  twoMarks: {
    question: string;
    answer: string;
  };
  fiveMarks: {
    question: string;
    answer: string;
  };
  tenMarks: {
    question: string;
    answer: string;
  };
  diagram?: DiagramData;
  resourcesUsed?: GroundedResource[];
  savedAt?: string;
  isReviewed?: boolean;
}

export type FeedbackSource = 'Student' | 'Top student' | 'Professor';

export interface FeedbackItem {
  id: string;
  topic: string;
  department: string;
  subject: string;
  source: FeedbackSource;
  rating: 'useful' | 'not_useful';
  comment: string;
  createdAt: string;
}

export interface FeedbackSummary {
  total: number;
  usefulRate: number;
  sources: {
    Student: number;
    'Top student': number;
    Professor: number;
  };
  recent: FeedbackItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topic?: string;
  subject?: string;
  department?: Department;
  suggestedActions?: {
    label: string;
    actionType: 'notes' | 'mock-exam' | 'flashcards' | 'topic';
    payload?: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  subject: string;
  department: Department;
  topic: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: '2 Marks' | '5 Marks';
}

export interface UserProfile {
  id: string;
  name: string;
  klId: string;
  email: string;
  department: Department;
  role: 'student' | 'faculty' | 'admin';
}

export type ScreenId =
  | 'home'
  | 'select-subject'
  | 'enter-topic'
  | 'generate-notes'
  | 'save'
  | 'feedback'
  | 'dashboard'
  | 'planner'
  | 'flashcards'
  | 'pdf-analyzer'
  | 'glossary'
  | 'knowledge-base'
  | 'mock-exam'
  | 'quiz'
  | 'studio'
  | 'admin'
  | 'chatbot';


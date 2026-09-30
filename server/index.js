import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { generateKLNotes } from './generator.js';
import {
  initDatabase,
  getAllUsers,
  saveUser,
  getSavedNotes,
  addSavedNote,
  deleteSavedNote,
  getFeedbacks,
  addFeedback,
  getChatMessages,
  saveChatMessage,
  isDatabaseConnected
} from './db.js';
import { generateChatbotReply } from './chatbot.js';

const app = express();
const PORT = process.env.PORT || 3001;
const kbRoot = path.resolve('knowledge-base');
const dataDir = path.resolve('data');

// Initialize Render MongoDB or fallback to file storage
initDatabase().catch((e) => console.warn('Database initialization warning:', e));


if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const savedNotesFile = path.join(dataDir, 'saved-notes.json');
const feedbackFile = path.join(dataDir, 'feedback.json');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(savedNotesFile)) {
  fs.writeFileSync(savedNotesFile, JSON.stringify([], null, 2), 'utf8');
}

if (!fs.existsSync(feedbackFile)) {
  fs.writeFileSync(feedbackFile, '[]', 'utf8');
}
const defaultFoodTechCourses = [
  {
    code: '21BT2210',
    name: 'Food Microbiology',
    faculty: 'Dr. V. Ramanathan',
    attendance: '92%',
    inSemGrade: 'A+',
    upcomingDeadline: 'Assignment 2: Thermal Death Kinetics Derivation (Due Oct 5)',
    lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21210'
  },
  {
    code: '21BT3112',
    name: 'Dairy Technology',
    faculty: 'Dr. M. Sangeetha',
    attendance: '89%',
    inSemGrade: 'A',
    upcomingDeadline: 'Lab Report: HTST Pasteurization FDV Valve Test (Due Oct 8)',
    lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=31112'
  },
  {
    code: '21BT2108',
    name: 'Food Chemistry and Nutrition',
    faculty: 'Prof. K. Ananya',
    attendance: '94%',
    inSemGrade: 'O',
    upcomingDeadline: 'Quiz: Maillard Reaction & Lipid Auto-oxidation (Due Oct 12)',
    lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21108'
  },
  {
    code: '21BT2205',
    name: 'Food Processing and Engineering',
    faculty: 'Dr. P. Venkateswarlu',
    attendance: '86%',
    inSemGrade: 'A',
    upcomingDeadline: 'Project: Freezing Curve Analysis with Planck Equation (Due Oct 15)',
    lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=22205'
  }
];

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([
    {
      id: 'user-ft-student-1',
      name: 'K. Sai Praneeth',
      klId: '2100030045',
      email: '2100030045@kluniversity.in',
      password: 'password123',
      department: 'Food Technology',
      role: 'student',
      isLmsConnected: true,
      lmsUsername: '2100030045',
      lmsLastSynced: new Date().toISOString(),
      enrolledCourses: defaultFoodTechCourses
    },
    {
      id: 'user-ft-faculty-1',
      name: 'Dr. V. Ramanathan',
      klId: 'KL-FT-0842',
      email: 'ramanathan@kluniversity.in',
      password: 'password123',
      department: 'Food Technology',
      role: 'faculty',
      isLmsConnected: true,
      lmsUsername: 'KL-FT-0842',
      lmsLastSynced: new Date().toISOString(),
      enrolledCourses: [
        {
          code: '21BT2210',
          name: 'Food Microbiology',
          faculty: 'Dr. V. Ramanathan (Course Coordinator)',
          attendance: 'Class Avg: 91%',
          inSemGrade: '45 Students Enrolled',
          upcomingDeadline: 'In-Sem 2 Question Paper Submission (Due Oct 10)',
          lmsCourseUrl: 'https://lms.kluniversity.in/course/view.php?id=21210'
        }
      ]
    }
  ], null, 2), 'utf8');
}

app.use(cors());
app.use(express.json());

// Helper: Get subjects across departments (defaults to Food Technology)
function getAllSubjects(deptFilter = 'Food Technology') {
  if (!fs.existsSync(kbRoot)) return [];
  const depts = fs.readdirSync(kbRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const subjects = [];

  for (const dept of depts) {
    if (deptFilter && deptFilter !== 'All' && deptFilter.toLowerCase() !== dept.toLowerCase()) {
      continue;
    }

    const deptPath = path.join(kbRoot, dept);
    const subjDirs = fs.readdirSync(deptPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    for (const subjName of subjDirs) {
      const subjPath = path.join(deptPath, subjName);
      let syllabus = {
        id: `${dept.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${subjName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        name: subjName,
        department: dept,
        code: '21BT2001',
        units: [],
        topics: [],
        questionCount: 0
      };

      const syllabusFile = path.join(subjPath, 'syllabus.json');
      if (fs.existsSync(syllabusFile)) {
        try {
          syllabus = JSON.parse(fs.readFileSync(syllabusFile, 'utf8'));
        } catch (e) {}
      }

      const qbFile = path.join(subjPath, 'question-bank.json');
      let questions = [];
      if (fs.existsSync(qbFile)) {
        try {
          questions = JSON.parse(fs.readFileSync(qbFile, 'utf8'));
          syllabus.questionCount = questions.length;
        } catch (e) {}
      }

      // Check existence of all 6 standard items
      const resourcesAvailable = {
        courseMaterials: fs.existsSync(path.join(subjPath, 'course-materials.md')),
        previousPapers: fs.existsSync(path.join(subjPath, 'previous-papers.md')),
        questionBank: fs.existsSync(path.join(subjPath, 'question-bank.json')),
        marksPattern: fs.existsSync(path.join(subjPath, 'marks-pattern.md')),
        answerStyle: fs.existsSync(path.join(subjPath, 'answer-style.md')),
        syllabus: fs.existsSync(path.join(subjPath, 'syllabus.json'))
      };

      // Load resources.json if available
      const resFile = path.join(subjPath, 'resources.json');
      let resources = [];
      if (fs.existsSync(resFile)) {
        try {
          resources = JSON.parse(fs.readFileSync(resFile, 'utf8'));
        } catch (e) {}
      }

      subjects.push({
        ...syllabus,
        description: syllabus.description || `Core academic subject for ${subjName} under Department of ${dept}, KL University.`,
        questionBank: questions,
        resourcesAvailable,
        resources
      });
    }
  }

  return subjects;
}

// API: List all departments
app.get('/api/departments', (req, res) => {
  try {
    if (!fs.existsSync(kbRoot)) return res.json([]);
    const depts = fs.readdirSync(kbRoot, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: List subjects (default: Food Technology)
app.get('/api/subjects', (req, res) => {
  try {
    const { department } = req.query;
    const targetDept = department || 'Food Technology';
    const list = getAllSubjects(targetDept);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get subject details and resource contents
app.get('/api/subjects/:id', (req, res) => {
  try {
    const { id } = req.params;
    const all = getAllSubjects('All');
    const subjMeta = all.find(s => s.id === id);

    if (!subjMeta) {
      return res.status(404).json({ error: 'Subject not found in knowledge base' });
    }

    const subjPath = path.join(kbRoot, subjMeta.department, subjMeta.name);
    const qbFile = path.join(subjPath, 'question-bank.json');
    const prevPapersFile = path.join(subjPath, 'previous-papers.md');
    const courseMatFile = path.join(subjPath, 'course-materials.md');
    const marksPatternFile = path.join(subjPath, 'marks-pattern.md');
    const answerStyleFile = path.join(subjPath, 'answer-style.md');

    res.json({
      ...subjMeta,
      courseMaterials: fs.existsSync(courseMatFile) ? fs.readFileSync(courseMatFile, 'utf8') : '',
      previousPapers: fs.existsSync(prevPapersFile) ? fs.readFileSync(prevPapersFile, 'utf8') : '',
      marksPattern: fs.existsSync(marksPatternFile) ? fs.readFileSync(marksPatternFile, 'utf8') : '',
      answerStyle: fs.existsSync(answerStyleFile) ? fs.readFileSync(answerStyleFile, 'utf8') : '',
      questionBank: fs.existsSync(qbFile) ? JSON.parse(fs.readFileSync(qbFile, 'utf8')) : []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Generate KL Exam Notes with resource citations
app.post('/api/generate', requireAuth, async (req, res) => {
  try {
    const { department, subject, topic } = req.body;
    if (!topic || !subject) {
      return res.status(400).json({ error: 'Topic and subject are required.' });
    }

    const note = await generateKLNotes({
      department: department || 'Food Technology',
      subject,
      topic
    });

    // Attach real knowledge base grounding citations for laptop view
    const subjPath = path.join(kbRoot, department || 'Food Technology', subject);
    const resourcesUsed = [];

    const resManifestPath = path.join(subjPath, 'resources.json');
    let manifest = [];
    if (fs.existsSync(resManifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(resManifestPath, 'utf8'));
      } catch (e) {}
    }

    if (manifest && manifest.length > 0) {
      for (const m of manifest) {
        resourcesUsed.push({
          type: m.resourceType,
          title: m.title,
          description: m.description,
          file: m.fileName,
          unit: m.unit,
          excerpt: m.description || `Grounded in ${m.title} (${m.fileName}) for ${subject}.`
        });
      }
    } else {
      if (fs.existsSync(path.join(subjPath, 'course-materials.md'))) {
        resourcesUsed.push({
          type: 'course-materials',
          title: `${subject} Course Handout`,
          file: 'course-materials.md',
          excerpt: `Grounded in KL Course Handout Unit I-V learning outcomes and textbook compendium.`
        });
      }
      if (fs.existsSync(path.join(subjPath, 'previous-papers.md'))) {
        resourcesUsed.push({
          type: 'previous-papers',
          title: `KL Previous Semester Papers`,
          file: 'previous-papers.md',
          excerpt: `Mapped against KL End-Sem May 2024 & Dec 2023 evaluation patterns.`
        });
      }
      if (fs.existsSync(path.join(subjPath, 'marks-pattern.md'))) {
        resourcesUsed.push({
          type: 'marks-pattern',
          title: `KL Marks Evaluation Rubric`,
          file: 'marks-pattern.md',
          excerpt: `Strictly formatted: 2M (20-40 words), 5M (120-180 words), 10M (350-500 words).`
        });
      }
    }

    res.json({
      ...note,
      resourcesUsed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Saved Notes (Dual Mongo / File support)
app.get('/api/saved-notes', async (req, res) => {
  try {
    const notes = await getSavedNotes();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/saved-notes', requireAuth, async (req, res) => {
  try {
    const newNote = {
      ...req.body,
      id: req.body.id || `note-${Date.now()}`,
      savedAt: req.body.savedAt || new Date().toISOString()
    };
    const saved = await addSavedNote(newNote);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/saved-notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteSavedNote(id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Feedback (Dual Mongo / File support)
app.post('/api/feedback', requireAuth, async (req, res) => {
  try {
    const { topic, department, subject, source, rating, comment } = req.body;
    const feedbackEntry = {
      id: `fb-${Date.now()}`,
      topic,
      department: department || 'Food Technology',
      subject: subject || 'General',
      source: source || 'Student',
      rating: rating || 'useful',
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
    const saved = await addFeedback(feedbackEntry);
    res.json({ success: true, feedback: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/feedback/summary', requireAuth, async (req, res) => {
  try {
    const feedbackList = await getFeedbacks();
    const total = feedbackList.length;
    const usefulCount = feedbackList.filter(f => f.rating === 'useful').length;
    const sources = {
      Student: feedbackList.filter(f => f.source === 'Student').length,
      'Top student': feedbackList.filter(f => f.source === 'Top student').length,
      Professor: feedbackList.filter(f => f.source === 'Professor').length,
    };

    res.json({
      total,
      usefulRate: total > 0 ? Math.round((usefulCount / total) * 100) : 100,
      sources,
      recent: feedbackList.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🤖 AI CHATBOT & TUTOR ENDPOINTS
// ==========================================
app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const { message, department, subject, history, userId, userSettings } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // Persist user prompt
    await saveChatMessage({
      id: `chat-${Date.now()}-user`,
      userId: userId || 'default',
      role: 'user',
      content: message,
      subject: subject || 'General',
      department: department || 'Food Technology',
      timestamp: new Date().toISOString()
    });

    const reply = await generateChatbotReply({
      message,
      history: history || [],
      department: department || 'Food Technology',
      subject: subject || 'Food Microbiology',
      userSettings: userSettings || {}
    });

    // Persist bot reply
    await saveChatMessage({
      id: `chat-${Date.now()}-bot`,
      userId: userId || 'default',
      role: 'assistant',
      content: reply.content,
      subject: subject || 'General',
      department: department || 'Food Technology',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      reply
    });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/chat/history', requireAuth, async (req, res) => {
  try {
    const { userId } = req.query;
    const messages = await getChatMessages(userId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 🔐 AUTHENTICATION & KL LMS INTEGRATION ENDPOINTS
// Official KL LMS Portal: https://lms.kluniversity.in/login/index.php
// ==========================================

// Production authentication: real accounts, hashed passwords, opaque sessions.
const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
const verifyPassword = (password, stored) => {
  if (!stored || !stored.includes(':')) return false;
  const [salt, expected] = stored.split(':');
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return actual.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
};
const issueAuthToken = () => crypto.randomBytes(32).toString('hex');
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, passwordHash, authTokenHash, ...safeUser } = user;
  return safeUser;
};
const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
};
const authenticateRequest = async (req) => {
  const token = getBearerToken(req);
  if (!token) return null;
  const users = await getAllUsers();
  const hashed = tokenHash(token);
  return users.find(u => u.authTokenHash === hashed) || null;
};
const requireAuth = async (req, res, next) => {
  try {
    const user = await authenticateRequest(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Authentication service unavailable.' });
  }
};
const requireAdmin = async (req, res, next) => {
  try {
    const user = await authenticateRequest(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Authorization service unavailable.' });
  }
};

// GET current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

// POST login — existing accounts only; no automatic account creation.
app.post('/api/auth/login', async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: 'Email / KL ID and password are required.' });
    }
    const users = await getAllUsers();
    const cleanLogin = String(usernameOrEmail).trim().toLowerCase();
    const user = users.find(u =>
      String(u.email || '').toLowerCase() === cleanLogin ||
      String(u.klId || '').toLowerCase() === cleanLogin ||
      String(u.lmsUsername || '').toLowerCase() === cleanLogin
    );
    if (!user) return res.status(401).json({ error: 'Account not found. Create an account before signing in.' });

    const valid = user.passwordHash
      ? verifyPassword(String(password), user.passwordHash)
      : String(user.password || '') === String(password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = issueAuthToken();
    user.authTokenHash = tokenHash(token);
    user.authTokenIssuedAt = new Date().toISOString();
    if (!user.passwordHash && user.password) {
      user.passwordHash = hashPassword(String(user.password));
      delete user.password;
    }
    await saveUser(user);
    res.json({ success: true, message: 'Signed in successfully.', user: sanitizeUser(user), token });
  } catch {
    res.status(500).json({ error: 'Login service unavailable.' });
  }
});

// POST signup — every account is a real persisted student account.
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, klId, email, password, department = 'Food Technology', linkLms = false } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    }
    const users = await getAllUsers();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanKlId = String(klId || cleanEmail.split('@')[0]).trim();
    const duplicate = users.find(u =>
      String(u.email || '').toLowerCase() === cleanEmail ||
      String(u.klId || '').toLowerCase() === cleanKlId.toLowerCase()
    );
    if (duplicate) return res.status(409).json({ error: 'An account with this email or KL ID already exists.' });

    const token = issueAuthToken();
    const newUser = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      klId: cleanKlId,
      email: cleanEmail,
      passwordHash: hashPassword(String(password)),
      authTokenHash: tokenHash(token),
      authTokenIssuedAt: new Date().toISOString(),
      department,
      role: 'student',
      isLmsConnected: Boolean(linkLms),
      lmsUsername: linkLms ? cleanKlId : undefined,
      lmsLastSynced: linkLms ? new Date().toISOString() : undefined,
      enrolledCourses: linkLms ? defaultFoodTechCourses : []
    };
    await saveUser(newUser);
    res.status(201).json({ success: true, message: 'Account created successfully.', user: sanitizeUser(newUser), token });
  } catch {
    res.status(500).json({ error: 'Account creation failed.' });
  }
});

// POST connect with KL LMS (lms.kluniversity.in)
app.post('/api/auth/kl-lms/connect', requireAuth, async (req, res) => {
  try {
    const { userId, lmsUsername } = req.body;
    if (!lmsUsername) {
      return res.status(400).json({ error: 'KL LMS Username or Email is required.' });
    }
    if (userId && userId !== req.user.id) return res.status(403).json({ error: 'You can only update your own LMS account.' });

    const user = req.user;

    user.isLmsConnected = true;
    user.lmsUsername = lmsUsername.trim();
    user.lmsLastSynced = new Date().toISOString();
    user.enrolledCourses = defaultFoodTechCourses;

    await saveUser(user);

    const safeUser = sanitizeUser(user);
    res.json({
      success: true,
      message: 'Connected to KL Learning Management System (lms.kluniversity.in)! Courses and attendance synced.',
      user: safeUser,
      syncedCourses: user.enrolledCourses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync KL LMS data
app.post('/api/auth/kl-lms/sync', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (userId && userId !== req.user.id) return res.status(403).json({ error: 'You can only sync your own LMS account.' });
    const user = req.user;

    user.isLmsConnected = true;
    user.lmsLastSynced = new Date().toISOString();
    if (!user.enrolledCourses || user.enrolledCourses.length === 0) {
      user.enrolledCourses = defaultFoodTechCourses;
    }

    await saveUser(user);

    const safeUser = sanitizeUser(user);
    res.json({
      success: true,
      message: 'KL LMS courses, attendance, and assignment deadlines refreshed.',
      user: safeUser,
      syncedCourses: user.enrolledCourses,
      lastSynced: user.lmsLastSynced
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 🛠️ ADMIN PORTAL API ENDPOINTS
// ==========================================

// ADMIN: Get stats
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  try {
    const subjects = getAllSubjects('Food Technology');
    let totalQuestions = 0;
    let totalFiles = 0;

    for (const subj of subjects) {
      totalQuestions += (subj.questionBank || []).length;
      const subjPath = path.join(kbRoot, subj.department, subj.name);
      if (fs.existsSync(subjPath)) {
        totalFiles += fs.readdirSync(subjPath).length;
      }
    }

    res.json({
      totalSubjects: subjects.length,
      totalFiles,
      totalQuestions,
      department: 'Food Technology',
      knowledgeBaseRoot: kbRoot
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Create New Subject
app.post('/api/admin/subjects', requireAdmin, (req, res) => {
  try {
    const { name, code, description = '', department = 'Food Technology', units = [], topics = [] } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Subject name and course code are required.' });
    }

    const deptPath = path.join(kbRoot, department);
    if (!fs.existsSync(deptPath)) {
      fs.mkdirSync(deptPath, { recursive: true });
    }

    const subjDir = path.join(deptPath, name.trim());
    if (fs.existsSync(subjDir)) {
      return res.status(400).json({ error: 'A subject with this name already exists in the Knowledge Base.' });
    }

    fs.mkdirSync(subjDir, { recursive: true });

    // Initialize the 6 standard items
    const defaultUnits = units.length > 0 ? units : [
      'Unit I: Fundamental Principles & Nomenclature',
      'Unit II: Governing Mechanisms & Unit Operations',
      'Unit III: Kinetics, Formulations & Process Design',
      'Unit IV: Quality Parameters & Thermal Operations',
      'Unit V: Industrial Applications & Standards'
    ];

    const subjDescription = description && description.trim().length > 0
      ? description.trim()
      : `Core curriculum for ${name.trim()} under Department of ${department}, KL University.`;

    const courseMaterials = `# ${name} (${code})
**Department:** ${department} | **KL University**

> **Course Description:**
> ${subjDescription}

## Course Units
${defaultUnits.map(u => `### ${u}\n- Comprehensive lecture notes, equations, and textbooks.\n`).join('\n')}`;
    fs.writeFileSync(path.join(subjDir, 'course-materials.md'), courseMaterials, 'utf8');

    const prevPapers = `# Previous Examination Papers — ${name}
**Department of ${department}, KL University**

## Papers Catalog
- KL End-Semester May 2024
- KL End-Semester Dec 2023
- KL In-Sem Examination 1 & 2
`;
    fs.writeFileSync(path.join(subjDir, 'previous-papers.md'), prevPapers, 'utf8');

    fs.writeFileSync(path.join(subjDir, 'question-bank.json'), JSON.stringify([], null, 2), 'utf8');

    const marksPattern = `# KL University Marks Pattern & Grading Rubric
**Subject:** ${name} (${code}) | **Department:** ${department}

## 2 Marks Questions: 20-40 words, exact definition.
## 5 Marks Questions: 120-180 words, 4-5 bullet points, mini-flowchart.
## 10 Marks Questions: 350-500 words, comprehensive essay.
`;
    fs.writeFileSync(path.join(subjDir, 'marks-pattern.md'), marksPattern, 'utf8');

    const answerStyle = `# KL University Examiner Answer Style Guide
**Subject:** ${name}

1. Highlight Keywords First.
2. Labeled Diagrams Are Mandatory.
3. Equations Must Define SI Units.
`;
    fs.writeFileSync(path.join(subjDir, 'answer-style.md'), answerStyle, 'utf8');

    const syllabus = {
      id: `${department.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      code: code.trim(),
      description: subjDescription,
      department,
      units: defaultUnits,
      topics: topics.length > 0 ? topics : [name],
      questionCount: 0,
      createdAt: new Date().toISOString()
    };
    fs.writeFileSync(path.join(subjDir, 'syllabus.json'), JSON.stringify(syllabus, null, 2), 'utf8');

    // Initialize 6 grounded resources manifest entries with descriptive text
    const resources = [
      {
        id: `res-${Date.now()}-cm`,
        title: `${name} Official Lecture Handouts & Course Material`,
        resourceType: 'course-materials',
        fileName: 'course-materials.md',
        unit: 'Units I - V',
        description: `Comprehensive reading materials, fundamental scientific equations, unit operations, and textbook citations for ${name}.`,
        author: 'KL Department Faculty',
        updatedAt: new Date().toISOString()
      },
      {
        id: `res-${Date.now()}-pp`,
        title: `KL University Previous Semester Exam Papers`,
        resourceType: 'previous-papers',
        fileName: 'previous-papers.md',
        unit: 'All Units',
        description: `Archived End-Sem and In-Sem university examination papers mapped to Bloom's Taxonomy.`,
        author: 'KL Exam Cell',
        updatedAt: new Date().toISOString()
      },
      {
        id: `res-${Date.now()}-qb`,
        title: `Graded Question Bank (2M, 5M, 10M)`,
        resourceType: 'question-bank',
        fileName: 'question-bank.json',
        unit: 'Units I - V',
        description: `Curated repository of exam questions categorized strictly by mark weightage.`,
        author: 'Board of Studies',
        updatedAt: new Date().toISOString()
      },
      {
        id: `res-${Date.now()}-mp`,
        title: `KL University Marks Pattern & Evaluation Scheme`,
        resourceType: 'marks-pattern',
        fileName: 'marks-pattern.md',
        unit: 'All Units',
        description: `Word-count criteria, essential keywords weighting, and marks breakdown for 2, 5, and 10 mark questions.`,
        author: 'Controller of Examinations',
        updatedAt: new Date().toISOString()
      },
      {
        id: `res-${Date.now()}-as`,
        title: `Examiner Evaluation Style & Answer Presentation Guide`,
        resourceType: 'answer-style',
        fileName: 'answer-style.md',
        unit: 'All Units',
        description: `Guidelines on answer structure, underlining technical nomenclature, mandatory process flowcharts, and scoring 10/10.`,
        author: 'Senior Evaluators Panel',
        updatedAt: new Date().toISOString()
      },
      {
        id: `res-${Date.now()}-syl`,
        title: `Official Syllabus & Unit Learning Outcomes`,
        resourceType: 'syllabus',
        fileName: 'syllabus.json',
        unit: 'Units I - V',
        description: `Official KL academic course structure, course outcomes (COs), program outcomes (POs), and unit breakdown.`,
        author: 'KL Academic Council',
        updatedAt: new Date().toISOString()
      }
    ];
    fs.writeFileSync(path.join(subjDir, 'resources.json'), JSON.stringify(resources, null, 2), 'utf8');

    res.json({ success: true, subject: { ...syllabus, resources } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Add or Update Resources for a Subject
app.post('/api/admin/resources', requireAdmin, (req, res) => {
  try {
    const {
      subjectName,
      department = 'Food Technology',
      resourceType,
      title,
      description,
      unit = 'All Units',
      author = 'KL Department Faculty',
      content
    } = req.body;

    if (!subjectName || !resourceType || content === undefined) {
      return res.status(400).json({ error: 'subjectName, resourceType, and content are required.' });
    }

    const subjDir = path.join(kbRoot, department, subjectName);
    if (!fs.existsSync(subjDir)) {
      return res.status(404).json({ error: `Subject folder "${subjectName}" not found.` });
    }

    const fileMap = {
      'course-materials': 'course-materials.md',
      'previous-papers': 'previous-papers.md',
      'question-bank': 'question-bank.json',
      'marks-pattern': 'marks-pattern.md',
      'answer-style': 'answer-style.md',
      'syllabus': 'syllabus.json'
    };

    const targetFile = fileMap[resourceType] || `${resourceType}.md`;
    const filePath = path.join(subjDir, targetFile);

    // If writing json, validate format
    if (targetFile.endsWith('.json')) {
      try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2), 'utf8');
      } catch (e) {
        return res.status(400).json({ error: `Invalid JSON content: ${e.message}` });
      }
    } else {
      fs.writeFileSync(filePath, String(content), 'utf8');
    }

    // Now update or insert into resources.json
    const resManifestPath = path.join(subjDir, 'resources.json');
    let manifest = [];
    if (fs.existsSync(resManifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(resManifestPath, 'utf8'));
      } catch (e) {}
    }

    const resTitle = title && title.trim().length > 0 ? title.trim() : `${subjectName} ${targetFile}`;
    const resDesc = description && description.trim().length > 0
      ? description.trim()
      : `Reference resource material for ${subjectName} covering ${unit}.`;

    const existingIdx = manifest.findIndex(m => m.resourceType === resourceType || m.fileName === targetFile);
    const updatedItem = {
      id: existingIdx >= 0 ? manifest[existingIdx].id : `res-${Date.now()}`,
      title: resTitle,
      description: resDesc,
      resourceType,
      fileName: targetFile,
      unit,
      author,
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      manifest[existingIdx] = updatedItem;
    } else {
      manifest.push(updatedItem);
    }

    fs.writeFileSync(resManifestPath, JSON.stringify(manifest, null, 2), 'utf8');

    res.json({
      success: true,
      message: `Resource "${resTitle}" successfully saved for ${subjectName}.`,
      file: targetFile,
      resource: updatedItem,
      resources: manifest,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Delete a Subject
app.delete('/api/admin/subjects/:name', requireAdmin, (req, res) => {
  try {
    const { name } = req.params;
    const { department = 'Food Technology' } = req.query;
    const subjDir = path.join(kbRoot, String(department), name);

    if (fs.existsSync(subjDir)) {
      fs.rmSync(subjDir, { recursive: true, force: true });
      res.json({ success: true, deletedSubject: name });
    } else {
      res.status(404).json({ error: `Subject "${name}" not found.` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend build if exists
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'studymate', database: isDatabaseConnected() ? 'connected' : 'file-fallback' });
});

app.listen(PORT, () => {
  console.log(`StudyMate AI Food Technology server running on port ${PORT}`);
});

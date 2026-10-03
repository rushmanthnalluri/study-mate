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
  isDatabaseConnected,
  getAiConfig,
  saveAiConfig,
  closeDatabase,
  addQuizAttempt,
  getQuizAttempts,
  addStudySource,
  getStudySources,
  deleteStudySource,
  getFlashcardProgress,
  saveFlashcardProgress,
  getKnowledgeBaseOverrides,
  saveKnowledgeBaseOverride
} from './db.js';
import { generateChatbotReply } from './chatbot.js';
import { extractPdfText } from './pdf-extractor.js';

const app = express();
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;
const kbRoot = path.resolve('knowledge-base');
const dataDir = path.resolve('data');

const resolveKnowledgeBasePath = (...segments) => {
  const candidate = path.resolve(kbRoot, ...segments.map(value => String(value)));
  const relative = path.relative(kbRoot, candidate);
  if (relative.startsWith('..' + path.sep) || relative === '..' || path.isAbsolute(relative)) {
    return null;
  }
  return candidate;
};

// Initialize Render MongoDB or fallback to file storage
initDatabase().then(() => ensureBootstrapAdmin()).catch((e) => console.warn('Database initialization warning:', e));


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
const defaultFoodTechCourses = [];

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, '[]', 'utf8');
}
const configuredClientOrigin = (process.env.CLIENT_ORIGIN || '').trim();
app.use(cors({
  origin(origin, callback) {
    // Same-origin requests have no Origin header and should always work.
    if (!origin) return callback(null, true);
    if (configuredClientOrigin && origin === configuredClientOrigin) return callback(null, true);
    // Permit local development only; production must set CLIENT_ORIGIN explicitly.
    try {
      const parsed = new URL(origin);
      const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
      if (process.env.NODE_ENV !== 'production' && isLocalhost && (parsed.protocol === 'http:' || parsed.protocol === 'https:')) {
        return callback(null, true);
      }
    } catch {
      // Fall through to the rejection below.
    }
    return callback(new Error('CORS origin not allowed.'));
  }
}));
app.use(express.json({ limit: '2mb' }));

// Production security middleware.
app.disable('x-powered-by');
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
    );
  }
  next();
});
app.use((req, res, next) => {
  const supplied = typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'].trim() : '';
  const requestId = /^[A-Za-z0-9._:-]{8,100}$/.test(supplied) ? supplied : crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://api.groq.com https://generativelanguage.googleapis.com");
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

const rateBuckets = new Map();
const RATE_BUCKET_MAX = 5000;
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000;
  for (const [key, bucket] of rateBuckets) {
    if (bucket.start < cutoff) rateBuckets.delete(key);
  }
}, 10 * 60 * 1000).unref();
const rateLimit = (windowMs, max) => (req, res, next) => {
  const key = (req.ip || 'unknown') + ':' + req.path;
  const now = Date.now();
  const current = rateBuckets.get(key);
  if (!current || now - current.start > windowMs) {
    if (!current && rateBuckets.size >= RATE_BUCKET_MAX) {
      const oldestKey = rateBuckets.keys().next().value;
      if (oldestKey) rateBuckets.delete(oldestKey);
    }
    rateBuckets.set(key, { start: now, count: 1 });
    return next();
  }
  current.count += 1;
  if (current.count > max) return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  next();
};



// Helper: Get subjects across departments (defaults to Food Technology)
async function getAllSubjects(deptFilter = 'Food Technology') {
  if (!fs.existsSync(kbRoot)) return [];
  const depts = fs.readdirSync(kbRoot, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const subjects = [];

  for (const dept of depts) {
    if (deptFilter && deptFilter !== 'All' && deptFilter.toLowerCase() !== dept.toLowerCase()) continue;

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
        try { syllabus = JSON.parse(fs.readFileSync(syllabusFile, 'utf8')); } catch {}
      }

      const qbFile = path.join(subjPath, 'question-bank.json');
      let questions = [];
      if (fs.existsSync(qbFile)) {
        try {
          questions = JSON.parse(fs.readFileSync(qbFile, 'utf8'));
          syllabus.questionCount = questions.length;
        } catch {}
      }

      const resourcesAvailable = {
        courseMaterials: fs.existsSync(path.join(subjPath, 'course-materials.md')),
        previousPapers: fs.existsSync(path.join(subjPath, 'previous-papers.md')),
        questionBank: fs.existsSync(path.join(subjPath, 'question-bank.json')),
        marksPattern: fs.existsSync(path.join(subjPath, 'marks-pattern.md')),
        answerStyle: fs.existsSync(path.join(subjPath, 'answer-style.md')),
        syllabus: fs.existsSync(path.join(subjPath, 'syllabus.json'))
      };

      const resFile = path.join(subjPath, 'resources.json');
      let resources = [];
      if (fs.existsSync(resFile)) {
        try { resources = JSON.parse(fs.readFileSync(resFile, 'utf8')); } catch {}
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

  const overrides = await getKnowledgeBaseOverrides();
  const byId = new Map(overrides.map(item => [item.subjectId, item]));
  const filtered = subjects.filter(subject => !byId.get(subject.id)?.deleted);
  for (const override of overrides) {
    if (override.deleted || !override.payload?.id) continue;
    const existing = filtered.findIndex(subject => subject.id === override.subjectId);
    if (existing >= 0) filtered[existing] = { ...filtered[existing], ...override.payload };
    else filtered.push(override.payload);
  }

  return filtered.filter(subject =>
    !deptFilter || deptFilter === 'All' || String(subject.department || '').toLowerCase() === String(deptFilter).toLowerCase()
  );
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
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: List subjects (default: Food Technology)
app.get('/api/subjects', async (req, res) => {
  try {
    const { department } = req.query;
    const targetDept = department || 'Food Technology';
    const list = await getAllSubjects(targetDept);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Get subject details and resource contents
app.get('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const all = await getAllSubjects('All');
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
      courseMaterials: subjMeta.courseMaterials || (fs.existsSync(courseMatFile) ? fs.readFileSync(courseMatFile, 'utf8') : ''),
      previousPapers: subjMeta.previousPapers || (fs.existsSync(prevPapersFile) ? fs.readFileSync(prevPapersFile, 'utf8') : ''),
      marksPattern: subjMeta.marksPattern || (fs.existsSync(marksPatternFile) ? fs.readFileSync(marksPatternFile, 'utf8') : ''),
      answerStyle: subjMeta.answerStyle || (fs.existsSync(answerStyleFile) ? fs.readFileSync(answerStyleFile, 'utf8') : ''),
      questionBank: subjMeta.questionBank || (fs.existsSync(qbFile) ? JSON.parse(fs.readFileSync(qbFile, 'utf8')) : [])
    });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Generate KL Exam Notes with resource citations
app.post('/api/generate', requireAuth, rateLimit(60 * 1000, 10), async (req, res) => {
  try {
    const { department, subject, topic } = req.body || {};
    if (!topic || !subject) {
      return res.status(400).json({ error: 'Topic and subject are required.' });
    }
    const cleanDepartment = String(department || 'Food Technology').trim();
    const cleanSubject = String(subject).trim();
    const cleanTopic = String(topic).trim();
    if (cleanTopic.length < 2 || cleanTopic.length > 500) {
      return res.status(400).json({ error: 'Topic must be between 2 and 500 characters.' });
    }

    // Resolve the subject from the knowledge base instead of trusting a client-supplied path.
    const subjectMeta = (await getAllSubjects('All')).find(
      (item) =>
        item.department.toLowerCase() === cleanDepartment.toLowerCase() &&
        item.name.toLowerCase() === cleanSubject.toLowerCase()
    );
    if (!subjectMeta) return res.status(404).json({ error: 'Subject not found in the knowledge base.' });

    const note = await generateKLNotes({
      department: subjectMeta.department,
      subject: subjectMeta.name,
      topic: cleanTopic
    });

    // Attach real knowledge base grounding citations for laptop view
    const subjPath = path.join(kbRoot, subjectMeta.department, subjectMeta.name);
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
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Saved Notes (Dual Mongo / File support)
app.get('/api/saved-notes', requireAuth, async (req, res) => {
  try {
    const notes = await getSavedNotes(req.user.id, Math.min(200, Math.max(1, Number(req.query.limit) || 100)));
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

app.post('/api/saved-notes', requireAuth, rateLimit(60 * 1000, 30), async (req, res) => {
  try {
    const newNote = {
      ...req.body,
      userId: req.user.id,
      id: req.body.id || `note-${Date.now()}`,
      savedAt: req.body.savedAt || new Date().toISOString()
    };
    const saved = await addSavedNote(newNote);
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

app.delete('/api/saved-notes/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const notes = await getSavedNotes(req.user.id);
    if (!notes.some(n => n.id === id)) return res.status(404).json({ error: 'Saved note not found.' });
    await deleteSavedNote(id, req.user.id);
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Feedback (Dual Mongo / File support)
app.post('/api/feedback', requireAuth, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const { topic, department, subject, source, rating, comment } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length > 300) {
      return res.status(400).json({ error: 'A valid topic is required.' });
    }

    const feedbackEntry = {
      id: `fb-${crypto.randomUUID()}`,
      userId: req.user.id,
      topic: topic.trim(),
      department: department || 'Food Technology',
      subject: subject || 'General',
      source: source || 'Student',
      rating: rating || 'useful',
      comment: typeof comment === 'string' ? comment.trim().slice(0, 2000) : '',
      createdAt: new Date().toISOString()
    };
    const saved = await addFeedback(feedbackEntry);
    res.json({ success: true, feedback: saved });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

app.get('/api/feedback/summary', requireAuth, async (req, res) => {
  try {
    const feedbackList = (await getFeedbacks()).filter(f => f.userId === req.user.id);
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
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ==========================================
// 🤖 AI CHATBOT & TUTOR ENDPOINTS
// ==========================================
app.post('/api/chat', requireAuth, rateLimit(60 * 1000, 20), async (req, res) => {
  try {
    const { message, department, subject, history } = req.body;
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    if (!cleanMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }
    if (cleanMessage.length > 6000) {
      return res.status(400).json({ error: 'Message must be 6000 characters or fewer.' });
    }
    const cleanHistory = Array.isArray(history) ? history.slice(-30) : [];

    // Persist user prompt
    await saveChatMessage({
      id: `chat-${Date.now()}-user`,
      userId: req.user.id,
      role: 'user',
      content: cleanMessage,
      subject: subject || 'General',
      department: department || 'Food Technology',
      timestamp: new Date().toISOString()
    });

    const reply = await generateChatbotReply({
      message: cleanMessage,
      history: cleanHistory,
      department: department || 'Food Technology',
      subject: subject || 'Food Microbiology',
      
    });

    // Persist bot reply
    await saveChatMessage({
      id: `chat-${Date.now()}-bot`,
      userId: req.user.id,
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
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

app.get('/api/chat/history', requireAuth, async (req, res) => {
  try {
    const messages = await getChatMessages(req.user.id, Math.min(200, Math.max(1, Number(req.query.limit) || 100)));
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
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
  const user = users.find(u => u.authTokenHash === hashed) || null;
  if (!user) return null;
  const issued = Date.parse(user.authTokenIssuedAt || '');
  if (!Number.isFinite(issued) || Date.now() - issued > 30 * 24 * 60 * 60 * 1000) return null;
  return user;
};
async function requireAuth(req, res, next) {
  try {
    const user = await authenticateRequest(req);
    if (!user) return res.status(401).json({ error: 'Authentication required.' });
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: 'Authentication service unavailable.' });
  }
}
async function requireAdmin(req, res, next) {
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
}

const ensureBootstrapAdmin = async () => {
  const email = (process.env.STUDYMATE_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.STUDYMATE_ADMIN_PASSWORD || '';
  if (!email || !password) return;
  const users = await getAllUsers();
  const existing = users.find(u => String(u.email || '').toLowerCase() === email);
  const token = issueAuthToken();
  if (existing) {
    existing.name = existing.name || 'StudyMate Administrator';
    existing.klId = existing.klId || 'ADMIN';
    existing.passwordHash = hashPassword(password);
    delete existing.password;
    existing.role = 'admin';
    existing.department = 'All';
    existing.authTokenHash = tokenHash(token);
    existing.authTokenIssuedAt = new Date().toISOString();
    await saveUser(existing);
    console.log('StudyMate configured administrator credentials refreshed.');
    return;
  }
  const admin = {
    id: crypto.randomUUID(),
    name: 'StudyMate Administrator',
    klId: 'ADMIN',
    email,
    passwordHash: hashPassword(password),
    authTokenHash: tokenHash(token),
    authTokenIssuedAt: new Date().toISOString(),
    department: 'All',
    role: 'admin',
    isLmsConnected: false,
    enrolledCourses: []
  };
  await saveUser(admin);
  console.log('StudyMate bootstrap administrator created.');
};

// GET current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});


// Revoke the current bearer session server-side.
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    req.user.authTokenHash = '';
    req.user.authTokenIssuedAt = '';
    await saveUser(req.user);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Logout service unavailable.' });
  }
});

// POST login — existing accounts only; no automatic account creation.
app.post('/api/auth/login', rateLimit(15 * 60 * 1000, 20), async (req, res) => {
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
    if (!user) return res.status(401).json({ error: 'Invalid email/KL ID or password.' });

    const valid = user.passwordHash
      ? verifyPassword(String(password), user.passwordHash)
      : String(user.password || '') === String(password);
    if (!valid) return res.status(401).json({ error: 'Invalid email/KL ID or password.' });

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
app.post('/api/auth/signup', rateLimit(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const { name, klId, email, password, department = 'Food Technology', linkLms = false } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (cleanName.length < 2 || cleanName.length > 100 || !emailPattern.test(cleanEmail)) {
      return res.status(400).json({ error: 'Enter a valid name and email address.' });
    }
    if (String(password).length < 8 || String(password).length > 128) {
      return res.status(400).json({ error: 'Password must contain at least 8 characters.' });
    }
    const users = await getAllUsers();
    const cleanKlId = String(klId || cleanEmail.split('@')[0]).trim();
    const duplicate = users.find(u =>
      String(u.email || '').toLowerCase() === cleanEmail ||
      String(u.klId || '').toLowerCase() === cleanKlId.toLowerCase()
    );
    if (duplicate) return res.status(409).json({ error: 'An account with this email or KL ID already exists.' });

    const token = issueAuthToken();
    const newUser = {
      id: crypto.randomUUID(),
      name: cleanName,
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
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'An account with this email or KL ID already exists.' });
    }
    res.status(500).json({ error: 'Account creation failed.' });
  }
});

// Change password and rotate the bearer session.
app.post('/api/auth/password', requireAuth, rateLimit(15 * 60 * 1000, 5), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword || String(newPassword).length < 8 || String(newPassword).length > 128) {
      return res.status(400).json({ error: 'Current password and a new password of 8-128 characters are required.' });
    }
    if (!req.user.passwordHash || !verifyPassword(String(currentPassword), req.user.passwordHash)) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const token = issueAuthToken();
    req.user.passwordHash = hashPassword(String(newPassword));
    req.user.authTokenHash = tokenHash(token);
    req.user.authTokenIssuedAt = new Date().toISOString();
    delete req.user.password;
    await saveUser(req.user);
    res.json({ success: true, token, user: sanitizeUser(req.user) });
  } catch {
    res.status(500).json({ error: 'Password could not be changed.' });
  }
});

// Update the authenticated user's profile. Role and AI settings are immutable here.
app.put('/api/auth/profile', requireAuth, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const { name, klId, department } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanKlId = String(klId || '').trim();
    const cleanDepartment = String(department || '').trim();
    if (!cleanName || !cleanKlId || !cleanDepartment) {
      return res.status(400).json({ error: 'Name, KL ID and department are required.' });
    }
    if (cleanName.length < 2 || cleanName.length > 100 || cleanKlId.length < 2 || cleanKlId.length > 100 || cleanDepartment.length < 2 || cleanDepartment.length > 100) {
      return res.status(400).json({ error: 'Profile fields must be between 2 and 100 characters.' });
    }
    const users = await getAllUsers();
    const duplicate = users.find(u =>
      u.id !== req.user.id &&
      (String(u.email || '').toLowerCase() === String(req.user.email || '').toLowerCase() ||
       String(u.klId || '').toLowerCase() === cleanKlId.toLowerCase())
    );
    if (duplicate) return res.status(409).json({ error: 'An account with this KL ID already exists.' });
    req.user.name = cleanName;
    req.user.klId = cleanKlId;
    req.user.department = cleanDepartment;
    await saveUser(req.user);
    res.json({ success: true, user: sanitizeUser(req.user) });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'An account with this KL ID already exists.' });
    res.status(500).json({ error: 'Profile could not be updated.' });
  }
});

// POST connect with KL LMS (lms.kluniversity.in)
app.post('/api/auth/kl-lms/connect', requireAuth, rateLimit(60 * 60 * 1000, 10), async (req, res) => {
  try {
    const { lmsUsername } = req.body || {};
    if (typeof lmsUsername !== 'string' || !lmsUsername.trim()) {
      return res.status(400).json({ error: 'KL LMS Username or Email is required.' });
    }

    const user = req.user;

    user.isLmsConnected = true;
    user.lmsUsername = lmsUsername.trim();
    user.lmsLastSynced = new Date().toISOString();
    user.enrolledCourses = user.enrolledCourses || [];

    await saveUser(user);

    const safeUser = sanitizeUser(user);
    res.json({
      success: true,
      message: 'KL LMS account connection recorded. Verified course and attendance data will appear after a successful LMS sync.',
      user: safeUser,
      syncedCourses: user.enrolledCourses
    });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// POST sync KL LMS data
app.post('/api/auth/kl-lms/sync', requireAuth, rateLimit(60 * 60 * 1000, 10), async (req, res) => {
  try {
    const user = req.user;

    user.isLmsConnected = true;
    user.lmsLastSynced = new Date().toISOString();
    if (!user.enrolledCourses) user.enrolledCourses = [];

    await saveUser(user);

    const safeUser = sanitizeUser(user);
    res.json({
      success: true,
      message: 'KL LMS sync connection refreshed. No course or attendance data is fabricated; verified LMS data will appear when available.',
      user: safeUser,
      syncedCourses: user.enrolledCourses,
      lastSynced: user.lmsLastSynced
    });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ==========================================
// CENTRAL AI CONFIGURATION — ADMIN ONLY
// API keys are encrypted before persistence and never returned to the browser.
const getConfigSecret = () => process.env.STUDYMATE_CONFIG_SECRET || '';
const hasStrongConfigSecret = () => getConfigSecret().length >= 32;
const encryptionKey = () => crypto.createHash('sha256').update(getConfigSecret()).digest();

const encryptApiKey = (plain) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv.toString('hex'), cipher.getAuthTag().toString('hex'), encrypted.toString('hex')].join(':');
};

const decryptApiKey = (payload) => {
  if (!payload || !getConfigSecret()) return '';
  try {
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
  } catch {
    return '';
  }
};

const loadCentralAiConfig = async () => {
  const stored = await getAiConfig();
  if (stored?.provider && stored.provider !== 'offline' && stored.encryptedApiKey) {
    const key = decryptApiKey(stored.encryptedApiKey);
    if (key) return { provider: stored.provider, model: stored.model || '', apiKey: key };
  }
  if (process.env.GEMINI_API_KEY) return { provider: 'gemini', model: process.env.GEMINI_MODEL || 'gemini-1.5-flash', apiKey: process.env.GEMINI_API_KEY };
  if (process.env.GROQ_API_KEY) return { provider: 'groq', model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', apiKey: process.env.GROQ_API_KEY };
  return { provider: 'offline', model: '', apiKey: '' };
};

app.get('/api/admin/ai-config', requireAdmin, async (req, res) => {
  const stored = await getAiConfig();
  const runtime = await loadCentralAiConfig();
  res.json({
    provider: runtime.provider,
    model: runtime.model,
    configured: Boolean(runtime.apiKey),
    updatedAt: stored?.updatedAt || null,
    secretConfigured: hasStrongConfigSecret()
  });
});

app.put('/api/admin/ai-config', requireAdmin, async (req, res) => {
  try {
    const { provider = 'offline', model = '', apiKey = '' } = req.body || {};
    if (!['offline', 'groq', 'gemini'].includes(provider)) {
      return res.status(400).json({ error: 'Unsupported AI provider.' });
    }
    if (provider !== 'offline' && !apiKey.trim()) {
      return res.status(400).json({ error: 'An API key is required for the selected provider.' });
    }
    if (!hasStrongConfigSecret()) {
      return res.status(503).json({ error: 'STUDYMATE_CONFIG_SECRET must be configured with at least 32 characters.' });
    }
    await saveAiConfig({
      provider,
      model: model.trim() || (provider === 'groq' ? 'llama-3.3-70b-versatile' : provider === 'gemini' ? 'gemini-1.5-flash' : ''),
      encryptedApiKey: provider === 'offline' ? '' : encryptApiKey(apiKey.trim())
    });
    res.json({ success: true, provider, model: model.trim(), configured: provider === 'offline' || Boolean(apiKey.trim()) });
  } catch {
    res.status(500).json({ error: 'AI configuration could not be saved.' });
  }
});

// ==========================================
// QUIZ / MODEL TEST ENGINE
// Uses the same centrally managed AI configuration as the tutor.
// Every generated assessment is authenticated and scoped to the requested subject.
// ==========================================

const parseJsonPayload = (text) => {
  const cleaned = String(text || '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('AI returned invalid quiz JSON.');
  }
};

const validateQuizQuestions = (value, count) => {
  if (!Array.isArray(value)) return [];
  return value.slice(0, count).filter((q) =>
    q &&
    typeof q.question === 'string' &&
    q.question.trim() &&
    Array.isArray(q.options) &&
    q.options.length === 4 &&
    q.options.every(o => typeof o === 'string' && o.trim()) &&
    Number.isInteger(q.answer) &&
    q.answer >= 0 &&
    q.answer < 4 &&
    typeof q.explanation === 'string'
  ).map((q, index) => ({
    id: `quiz-${Date.now()}-${index}`,
    question: q.question.trim(),
    options: q.options.map(o => o.trim()),
    answer: q.answer,
    explanation: q.explanation.trim(),
    topic: typeof q.topic === 'string' ? q.topic.trim() : ''
  }));
};

const buildOfflineQuiz = (subjectMeta, count) => {
  const bank = Array.isArray(subjectMeta.questionBank)
    ? subjectMeta.questionBank.filter((q) =>
        q?.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((option) => typeof option === 'string' && option.trim()) &&
        Number.isInteger(q.answer) &&
        q.answer >= 0 &&
        q.answer < 4
      )
    : [];

  if (!bank.length) return [];

  const pool = [...bank].sort(() => Math.random() - 0.5);
  return pool.slice(0, Math.min(count, pool.length)).map((item, index) => ({
    id: String(item.id || `quiz-bank-${Date.now()}-${index}`),
    question: String(item.question).trim(),
    options: item.options.map((option) => String(option).trim()),
    answer: item.answer,
    explanation: String(item.explanation || 'Answer supplied by the administrator-managed question bank.').trim(),
    topic: String(item.topic || '').trim()
  }));
};

app.post('/api/quiz/generate', requireAuth, rateLimit(60 * 1000, 8), async (req, res) => {
  try {
    const { subjectId, mode = 'quiz' } = req.body || {};
    const requestedCount = mode === 'model' ? 20 : 10;
    const all = await getAllSubjects('All');
    const subjectMeta = all.find(s => s.id === subjectId);
    if (!subjectMeta) return res.status(404).json({ error: 'Subject not found.' });

    const config = await loadCentralAiConfig();
    let questions = [];

    if (config.provider === 'groq' && config.apiKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            model: config.model || 'llama-3.3-70b-versatile',
            temperature: 0.2,
            messages: [
              {
                role: 'system',
                content: 'You are an academic assessment generator. Return ONLY valid JSON: an array of objects with question, options (exactly 4 strings), answer (0-3), explanation, and topic. Do not use markdown fences. Questions must be objectively answerable and grounded in the supplied question bank. Avoid duplicate questions.'
              },
              {
                role: 'user',
                content: JSON.stringify({
                  subject: subjectMeta.name,
                  department: subjectMeta.department,
                  mode,
                  count: requestedCount,
                  questionBank: subjectMeta.questionBank
                })
              }
            ]
          })
        });
        if (response.ok) {
          const data = await response.json();
          questions = validateQuizQuestions(data?.choices?.[0]?.message?.content, requestedCount);
        }
      } catch (err) {
        console.warn('Groq quiz generation failed; using structured question-bank fallback:', err.message);
      }
    }

    if (!questions.length && config.provider === 'gemini' && config.apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-1.5-flash'}:generateContent?key=${config.apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: 'You are an academic assessment generator. Return ONLY valid JSON: an array of objects with question, options (exactly 4 strings), answer (0-3), explanation, and topic. No markdown fences. Questions must be objectively answerable and grounded in the supplied question bank.' }]
            },
            contents: [{
              role: 'user',
              parts: [{ text: JSON.stringify({ subject: subjectMeta.name, department: subjectMeta.department, mode, count: requestedCount, questionBank: subjectMeta.questionBank }) }]
            }],
            generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
          })
        });
        if (response.ok) {
          const data = await response.json();
          questions = validateQuizQuestions(data?.candidates?.[0]?.content?.parts?.[0]?.text, requestedCount);
        }
      } catch (err) {
        console.warn('Gemini quiz generation failed; using structured question-bank fallback:', err.message);
      }
    }

    if (!questions.length) {
      questions = buildOfflineQuiz(subjectMeta, requestedCount);
    }

    if (!questions.length) {
      return res.status(422).json({ error: 'No usable questions are available for this subject yet.' });
    }

    res.json({
      success: true,
      provider: config.provider,
      mode,
      subject: subjectMeta.name,
      questions
    });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: 'Quiz generation failed.' });
  }
});

// ==========================================
// Private PDF -> private Notebook source ingestion.
// The PDF is parsed server-side and only extracted text is persisted.
app.post('/api/studio/sources/pdf', requireAuth, rateLimit(60 * 60 * 1000, 20), express.raw({ type: ['application/pdf', 'application/octet-stream'], limit: '12mb' }), async (req, res) => {
  try {
    const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (!buffer.length) return res.status(400).json({ error: 'PDF file is required.' });
    if (buffer.length > 10 * 1024 * 1024) return res.status(413).json({ error: 'PDF is too large. Maximum size is 10 MB.' });

    let content;
    try {
      content = extractPdfText(buffer);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'PDF could not be extracted.';
      return res.status(422).json({ error: message });
    }

    const requestedName = String(req.headers['x-filename'] || 'Uploaded PDF')
      .replace(/[\\r\\n]/g, ' ')
      .trim()
      .slice(0, 200);
    const name = requestedName.toLowerCase().endsWith('.pdf') ? requestedName : requestedName + '.pdf';

    const source = await addStudySource({
      id: crypto.randomUUID(),
      userId: req.user.id,
      name,
      mimeType: 'application/pdf',
      content,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      id: source.id,
      name: source.name,
      mimeType: source.mimeType,
      createdAt: source.createdAt,
      characters: content.length
    });
  } catch {
    res.status(500).json({ error: 'PDF source could not be saved.' });
  }
});

// Private Notebook-style source workspace.
app.post('/api/studio/sources', requireAuth, rateLimit(60 * 60 * 1000, 30), async (req, res) => {
  try {
    const { name, mimeType = 'text/plain', content } = req.body || {};
    const cleanName = String(name || 'Untitled source').trim().slice(0, 200);
    const cleanContent = String(content || '').trim();
    if (!cleanContent) return res.status(400).json({ error: 'Source content is required.' });
    if (cleanContent.length > 100000) return res.status(413).json({ error: 'Source is too large. Maximum size is 100,000 characters.' });
    const source = await addStudySource({
      id: crypto.randomUUID(),
      userId: req.user.id,
      name: cleanName || 'Untitled source',
      mimeType: String(mimeType).slice(0, 100),
      content: cleanContent,
      createdAt: new Date().toISOString()
    });
    res.status(201).json({ id: source.id, name: source.name, mimeType: source.mimeType, createdAt: source.createdAt });
  } catch {
    res.status(500).json({ error: 'Source could not be saved.' });
  }
});

app.get('/api/studio/sources', requireAuth, async (req, res) => {
  try {
    const sources = await getStudySources(req.user.id, Math.min(50, Math.max(1, Number(req.query.limit) || 20)));
    res.json(sources.map(({ content, ...meta }) => ({ ...meta, characters: content.length })));
  } catch {
    res.status(500).json({ error: 'Sources could not be loaded.' });
  }
});

app.delete('/api/studio/sources/:id', requireAuth, async (req, res) => {
  try {
    await deleteStudySource(String(req.params.id), req.user.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Source could not be deleted.' });
  }
});

app.post('/api/studio/ask', requireAuth, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const sourceId = String(req.body?.sourceId || '');
    const question = String(req.body?.question || '').trim();
    if (!sourceId || !question || question.length > 1000) return res.status(400).json({ error: 'A source and question are required.' });
    const sources = await getStudySources(req.user.id, 50);
    const source = sources.find(s => s.id === sourceId);
    if (!source) return res.status(404).json({ error: 'Source not found.' });
    const groundedPrompt = [
      'Answer only from the supplied study source.',
      'If the source does not contain enough information, say so explicitly.',
      'Do not invent facts or citations.',
      '',
      'SOURCE:',
      source.content.slice(0, 80000),
      '',
      'QUESTION:',
      question
    ].join('\n');
    const reply = await generateChatbotReply({
      message: groundedPrompt,
      history: [],
      department: req.user.department || 'General',
      subject: source.name
    });
    res.json({ answer: reply.content, source: { id: source.id, name: source.name }, provider: reply.provider });
  } catch {
    res.status(500).json({ error: 'Source-grounded answer could not be generated.' });
  }
});

// Persist assessment results for the authenticated account.
app.post('/api/quiz/attempts', requireAuth, rateLimit(60 * 60 * 1000, 30), async (req, res) => {
  try {
    const { subject, mode, score, total } = req.body || {};
    const cleanSubject = String(subject || '').trim();
    const cleanMode = mode === 'model' ? 'model' : mode === 'quiz' ? 'quiz' : '';
    const numericScore = Number(score);
    const numericTotal = Number(total);
    if (!cleanSubject || !cleanMode || !Number.isInteger(numericScore) || !Number.isInteger(numericTotal) ||
        numericTotal < 1 || numericTotal > 100 || numericScore < 0 || numericScore > numericTotal) {
      return res.status(400).json({ error: 'Invalid assessment result.' });
    }
    const attempt = {
      id: crypto.randomUUID(),
      userId: req.user.id,
      subject: cleanSubject.slice(0, 200),
      mode: cleanMode,
      score: numericScore,
      total: numericTotal,
      percentage: Math.round((numericScore / numericTotal) * 100),
      completedAt: new Date().toISOString()
    };
    const saved = await addQuizAttempt(attempt);
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ error: 'Assessment result could not be saved.' });
  }
});

app.get('/api/quiz/attempts', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    res.json(await getQuizAttempts(req.user.id, limit));
  } catch {
    res.status(500).json({ error: 'Assessment history could not be loaded.' });
  }
});

// Persist authenticated flashcard mastery/review state.
app.get('/api/flashcards/progress', requireAuth, async (req, res) => {
  try {
    res.json(await getFlashcardProgress(req.user.id));
  } catch {
    res.status(500).json({ error: 'Flashcard progress could not be loaded.' });
  }
});

app.put('/api/flashcards/progress/:flashcardId', requireAuth, rateLimit(60 * 60 * 1000, 120), async (req, res) => {
  try {
    const flashcardId = String(req.params.flashcardId || '').trim();
    if (!/^[A-Za-z0-9._:-]{1,120}$/.test(flashcardId)) return res.status(400).json({ error: 'Invalid flashcard ID.' });
    const mastered = req.body?.mastered === true;
    let nextReviewAt;
    if (req.body?.nextReviewAt !== undefined && req.body?.nextReviewAt !== null && req.body?.nextReviewAt !== '') {
      const parsed = new Date(req.body.nextReviewAt);
      if (Number.isNaN(parsed.getTime())) return res.status(400).json({ error: 'Invalid review date.' });
      const maxReviewDate = Date.now() + 366 * 24 * 60 * 60 * 1000;
      if (parsed.getTime() > maxReviewDate) return res.status(400).json({ error: 'Review date is too far in the future.' });
      nextReviewAt = parsed.toISOString();
    }
    const saved = await saveFlashcardProgress({ userId: req.user.id, flashcardId, mastered, nextReviewAt });
    res.json(saved);
  } catch {
    res.status(500).json({ error: 'Flashcard progress could not be saved.' });
  }
});

// 🛠️ ADMIN PORTAL API ENDPOINTS
// ==========================================

// ADMIN: Get stats
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const subjects = await getAllSubjects('Food Technology');
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
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ADMIN: Create New Subject
app.post('/api/admin/subjects', requireAdmin, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const { name, code, description = '', department = 'Food Technology', units = [], topics = [] } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Subject name and course code are required.' });
    }

    const cleanDepartment = String(department).trim();
    const cleanName = String(name).trim();
    const cleanCode = String(code).trim();
    const deptPath = resolveKnowledgeBasePath(cleanDepartment);
    const subjDir = resolveKnowledgeBasePath(cleanDepartment, cleanName);
    if (!deptPath || !subjDir || !cleanDepartment || !cleanName || !cleanCode) {
      return res.status(400).json({ error: 'Invalid department or subject path.' });
    }
    if (!fs.existsSync(deptPath)) {
      fs.mkdirSync(deptPath, { recursive: true });
    }

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

    const subjDescription = description && String(description).trim().length > 0
      ? String(description).trim().slice(0, 5000)
      : `Core curriculum for ${cleanName} under Department of ${cleanDepartment}, KL University.`;

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
      name: cleanName,
      code: cleanCode,
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

    const persistedSubject = {
      ...syllabus,
      department: cleanDepartment,
      name: cleanName,
      code: cleanCode,
      questionBank: [],
      resourcesAvailable: {
        courseMaterials: true,
        previousPapers: true,
        questionBank: true,
        marksPattern: true,
        answerStyle: true,
        syllabus: true
      },
      resources,
      courseMaterials,
      previousPapers: prevPapers,
      marksPattern,
      answerStyle
    };
    await saveKnowledgeBaseOverride({
      subjectId: syllabus.id,
      department: cleanDepartment,
      payload: persistedSubject
    });

    res.json({ success: true, subject: persistedSubject });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ADMIN: Add or Update Resources for a Subject
app.post('/api/admin/resources', requireAdmin, rateLimit(60 * 60 * 1000, 40), async (req, res) => {
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

    const cleanDepartment = String(department).trim();
    const cleanSubjectName = String(subjectName).trim();
    const subjDir = resolveKnowledgeBasePath(cleanDepartment, cleanSubjectName);
    if (!subjDir) return res.status(400).json({ error: 'Invalid department or subject path.' });
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

    const targetFile = fileMap[resourceType];
    if (!targetFile) return res.status(400).json({ error: 'Unsupported resource type.' });
    const filePath = resolveKnowledgeBasePath(cleanDepartment, cleanSubjectName, targetFile);
    if (!filePath || path.dirname(filePath) !== subjDir) return res.status(400).json({ error: 'Invalid resource path.' });

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

    const existingSubject = (await getAllSubjects('All')).find(s =>
      s.id === `${cleanDepartment.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cleanSubjectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    );
    const persistedPayload = {
      ...(existingSubject || {}),
      id: existingSubject?.id || `${cleanDepartment.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${cleanSubjectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: cleanSubjectName,
      department: cleanDepartment,
      resources: manifest,
      resourcesAvailable: {
        courseMaterials: true,
        previousPapers: true,
        questionBank: true,
        marksPattern: true,
        answerStyle: true,
        syllabus: true
      }
    };
    if (targetFile === 'course-materials.md') persistedPayload.courseMaterials = String(content);
    if (targetFile === 'previous-papers.md') persistedPayload.previousPapers = String(content);
    if (targetFile === 'marks-pattern.md') persistedPayload.marksPattern = String(content);
    if (targetFile === 'answer-style.md') persistedPayload.answerStyle = String(content);
    if (targetFile === 'question-bank.json') persistedPayload.questionBank = typeof content === 'string' ? JSON.parse(content) : content;
    if (targetFile === 'syllabus.json') Object.assign(persistedPayload, typeof content === 'string' ? JSON.parse(content) : content);
    await saveKnowledgeBaseOverride({
      subjectId: persistedPayload.id,
      department: cleanDepartment,
      payload: persistedPayload
    });

    res.json({
      success: true,
      message: `Resource "${resTitle}" successfully saved for ${subjectName}.`,
      file: targetFile,
      resource: updatedItem,
      resources: manifest,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ADMIN: Delete a Subject
app.delete('/api/admin/subjects/:name', requireAdmin, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const { name } = req.params;
    const { department = 'Food Technology' } = req.query;
    const subjDir = resolveKnowledgeBasePath(String(department).trim(), String(name).trim());
    if (!subjDir) return res.status(400).json({ error: 'Invalid subject path.' });

    if (fs.existsSync(subjDir)) {
      fs.rmSync(subjDir, { recursive: true, force: true });
      const subjectId = `${String(department).trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}-${String(name).trim().toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await saveKnowledgeBaseOverride({
        subjectId,
        department: String(department).trim(),
        deleted: true,
        payload: { id: subjectId, name: String(name).trim(), department: String(department).trim() }
      });
      res.json({ success: true, deletedSubject: name });
    } else {
      res.status(404).json({ error: `Subject "${name}" not found.` });
    }
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(isDatabaseConnected() ? 200 : 503).json({
    ok: isDatabaseConnected(),
    service: 'studymate',
    database: isDatabaseConnected() ? 'connected' : 'file-fallback',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if exists
const distPath = path.resolve('dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // JSON API 404s and final error boundary: never expose stack traces in production.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = Number.isInteger(err?.status) && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error('Unhandled request error:', err?.message || 'unknown error');
  res.status(status).json({ error: status === 500 ? 'Internal server error.' : (err?.message || 'Request failed.') });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`StudyMate AI server running on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`StudyMate shutdown requested: ${signal}`);
  server.close(async () => {
    try { await closeDatabase(); } catch (err) { console.error('Database shutdown error:', err?.message); }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

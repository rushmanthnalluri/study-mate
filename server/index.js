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

const rateLimitBuckets = new Map();
function rateLimit(windowMs, maxRequests) {
  return (req, res, next) => {
    const identity = String(req.user?.id || req.ip || 'anonymous');
    const key = `${identity}:${req.path}`;
    const now = Date.now();
    const current = rateLimitBuckets.get(key);
    if (!current || now - current.startedAt >= windowMs) {
      rateLimitBuckets.set(key, { startedAt: now, count: 1 });
      return next();
    }
    if (current.count >= maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((windowMs - (now - current.startedAt)) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    current.count += 1;
    return next();
  };
}

app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join('; '));
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
  }
  next();
});
// Helper: Get subjects from administrator-persisted MongoDB data only.
// The repository knowledge-base directory is intentionally NOT a student-facing source.
// This prevents packaged/demo/seeded subjects from appearing in production.
async function getAllSubjects(deptFilter = 'All') {
  const overrides = await getKnowledgeBaseOverrides();
  return overrides
    .filter(override => !override.deleted && override.payload?.id)
    .map(override => ({
      ...override.payload,
      contentSource: override.payload.contentSource || 'admin-managed',
      resources: Array.isArray(override.payload.resources) ? override.payload.resources : [],
      questionBank: Array.isArray(override.payload.questionBank) ? override.payload.questionBank : [],
      resourcesAvailable: override.payload.resourcesAvailable || {}
    }))
    .filter(subject =>
      !deptFilter || deptFilter === 'All' || String(subject.department || '').toLowerCase() === String(deptFilter).toLowerCase()
    );
}

// API: List all departments
app.get('/api/departments', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const subjects = await getAllSubjects('All');
    const departments = [...new Set(subjects.map(subject => String(subject.department || '').trim()).filter(Boolean))].sort();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: List subjects (default: all administrator-managed subjects)
app.get('/api/subjects', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const { department } = req.query;
    const targetDept = department || 'All';
    const list = await getAllSubjects(targetDept);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Get subject details and administrator-managed resources.
app.get('/api/subjects/:id', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    const id = String(req.params.id || '').trim();
    const all = await getAllSubjects('All');
    const subject = all.find(s => s.id === id);

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    // Student-facing resource content comes only from the administrator-persisted MongoDB payload.
    res.json({
      ...subject,
      courseMaterials: typeof subject.courseMaterials === 'string' ? subject.courseMaterials : '',
      previousPapers: typeof subject.previousPapers === 'string' ? subject.previousPapers : '',
      marksPattern: typeof subject.marksPattern === 'string' ? subject.marksPattern : '',
      answerStyle: typeof subject.answerStyle === 'string' ? subject.answerStyle : '',
      questionBank: Array.isArray(subject.questionBank) ? subject.questionBank : [],
      resources: Array.isArray(subject.resources) ? subject.resources : []
    });
  } catch {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// API: Generate KL Exam Notes with administrator-managed subject grounding.

app.post('/api/generate', requireAuth, rateLimit(60 * 1000, 10), async (req, res) => {
  try {
    const { department, subject, topic } = req.body || {};
    if (!topic || !subject || !department) {
      return res.status(400).json({ error: 'Topic and subject are required.' });
    }
    const cleanDepartment = String(department || '').trim();
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
      topic: cleanTopic,
      subjectMeta
    });

    // Ground generated notes only with resources stored in the administrator-managed subject payload.
    const resourcesUsed = (Array.isArray(subjectMeta.resources) ? subjectMeta.resources : []).map((resource) => ({
      type: resource.resourceType,
      title: resource.title,
      description: resource.description,
      file: resource.fileName,
      unit: resource.unit,
      excerpt: resource.description || `Administrator-managed resource: ${resource.title}.`
    }));

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
      department: department || '',
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
      department: department || '',
      timestamp: new Date().toISOString()
    });

    const reply = await generateChatbotReply({
      message: cleanMessage,
      history: cleanHistory,
      department: department || '',
      subject: subject || 'General',
      
    });

    // Persist bot reply
    await saveChatMessage({
      id: `chat-${Date.now()}-bot`,
      userId: req.user.id,
      role: 'assistant',
      content: reply.content,
      subject: subject || 'General',
      department: department || '',
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
// 🔐 AUTHENTICATION & ACCOUNT ENDPOINTS
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
      String(u.klId || '').toLowerCase() === cleanLogin
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
    const { name, klId, email, password, department = '' } = req.body || {};
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

// ADMIN: Get stats — MongoDB is the source of truth.
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const subjects = await getAllSubjects('All');
    const totalFiles = subjects.reduce((sum, subject) => sum + (Array.isArray(subject.resources) ? subject.resources.length : 0), 0);
    const totalQuestions = subjects.reduce((sum, subject) => sum + (Array.isArray(subject.questionBank) ? subject.questionBank.length : 0), 0);
    res.json({
      totalSubjects: subjects.length,
      totalFiles,
      totalQuestions,
      departments: [...new Set(subjects.map(s => s.department).filter(Boolean))].sort(),
      dataSource: 'administrator-managed-mongodb'
    });
  } catch {
    res.status(500).json({ error: 'Request could not be completed.' });
  }
});

// ADMIN: Create a subject directly in MongoDB.
// No repository files or generated placeholder resources are exposed to students.
app.post('/api/admin/subjects', requireAdmin, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const { name, code, description = '', department = '', units = [], topics = [] } = req.body || {};
    const cleanName = String(name || '').trim();
    const cleanCode = String(code || '').trim();
    const cleanDepartment = String(department || '').trim();
    if (!cleanName || !cleanCode || !cleanDepartment) {
      return res.status(400).json({ error: 'Subject name, course code, and department are required.' });
    }
    if (cleanName.length > 200 || cleanCode.length > 100 || cleanDepartment.length > 100) {
      return res.status(400).json({ error: 'Subject fields are too long.' });
    }

    const subjectId = `${cleanDepartment.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const existing = (await getAllSubjects('All')).find(subject => subject.id === subjectId);
    if (existing) return res.status(409).json({ error: 'A subject with this name already exists.' });

    const cleanUnits = Array.isArray(units)
      ? units.map(unit => String(unit).trim()).filter(Boolean).slice(0, 20)
      : [];
    const cleanTopics = Array.isArray(topics)
      ? topics.map(topic => String(topic).trim()).filter(Boolean).slice(0, 100)
      : [];

    const subject = {
      id: subjectId,
      name: cleanName,
      code: cleanCode,
      description: String(description || '').trim().slice(0, 5000),
      department: cleanDepartment,
      units: cleanUnits,
      topics: cleanTopics,
      questionCount: 0,
      questionBank: [],
      resources: [],
      resourcesAvailable: {},
      contentSource: 'administrator-created'
    };

    await saveKnowledgeBaseOverride({
      subjectId,
      department: cleanDepartment,
      payload: subject,
      deleted: false
    });

    res.status(201).json({ success: true, subject });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: 'A subject with this name already exists.' });
    res.status(500).json({ error: 'Subject could not be created.' });
  }
});

// ADMIN: Add or update a resource directly in the MongoDB subject payload.
app.post('/api/admin/resources', requireAdmin, rateLimit(60 * 60 * 1000, 40), async (req, res) => {
  try {
    const {
      subjectName,
      department = '',
      resourceType,
      title,
      description,
      unit = 'All Units',
      author = 'Administrator',
      content
    } = req.body || {};

    const cleanDepartment = String(department || '').trim();
    const cleanSubjectName = String(subjectName || '').trim();
    const cleanResourceType = String(resourceType || '').trim();
    if (!cleanSubjectName || !cleanResourceType || content === undefined) {
      return res.status(400).json({ error: 'subjectName, resourceType, and content are required.' });
    }

    const allowedTypes = {
      'course-materials': 'courseMaterials',
      'previous-papers': 'previousPapers',
      'question-bank': 'questionBank',
      'marks-pattern': 'marksPattern',
      'answer-style': 'answerStyle',
      'syllabus': 'syllabus'
    };
    const payloadField = allowedTypes[cleanResourceType];
    if (!payloadField) return res.status(400).json({ error: 'Unsupported resource type.' });

    const subjects = await getAllSubjects('All');
    const existingSubject = subjects.find(subject =>
      subject.department.toLowerCase() === cleanDepartment.toLowerCase() &&
      subject.name.toLowerCase() === cleanSubjectName.toLowerCase()
    );
    if (!existingSubject) return res.status(404).json({ error: 'Subject not found in administrator-managed data.' });

    let parsedContent = content;
    if (cleanResourceType === 'question-bank' || cleanResourceType === 'syllabus') {
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch {
        return res.status(400).json({ error: 'Invalid JSON resource content.' });
      }
    }

    const resources = Array.isArray(existingSubject.resources) ? [...existingSubject.resources] : [];
    const resource = {
      id: `res-${crypto.randomUUID()}`,
      title: String(title || `${cleanSubjectName} resource`).trim().slice(0, 300),
      description: String(description || '').trim().slice(0, 2000),
      resourceType: cleanResourceType,
      fileName: `${cleanResourceType}.managed`,
      unit: String(unit || 'All Units').trim().slice(0, 200),
      author: String(author || 'Administrator').trim().slice(0, 200),
      updatedAt: new Date().toISOString()
    };

    const existingIndex = resources.findIndex(item => item.resourceType === cleanResourceType);
    if (existingIndex >= 0) {
      resource.id = resources[existingIndex].id || resource.id;
      resources[existingIndex] = resource;
    } else {
      resources.push(resource);
    }

    const persistedPayload = {
      ...existingSubject,
      resources,
      resourcesAvailable: {
        ...(existingSubject.resourcesAvailable || {}),
        [payloadField]: true
      },
      contentSource: existingSubject.contentSource || 'administrator-managed'
    };

    if (cleanResourceType === 'question-bank') {
      if (!Array.isArray(parsedContent)) return res.status(400).json({ error: 'Question bank must be an array.' });
      persistedPayload.questionBank = parsedContent.slice(0, 500);
      persistedPayload.questionCount = persistedPayload.questionBank.length;
    } else if (cleanResourceType === 'syllabus') {
      if (!parsedContent || typeof parsedContent !== 'object' || Array.isArray(parsedContent)) {
        return res.status(400).json({ error: 'Syllabus must be a JSON object.' });
      }
      Object.assign(persistedPayload, parsedContent);
      persistedPayload.id = existingSubject.id;
      persistedPayload.name = existingSubject.name;
      persistedPayload.code = existingSubject.code;
      persistedPayload.department = existingSubject.department;
    } else {
      persistedPayload[payloadField] = String(parsedContent);
    }

    await saveKnowledgeBaseOverride({
      subjectId: existingSubject.id,
      department: existingSubject.department,
      payload: persistedPayload,
      deleted: false
    });

    res.json({
      success: true,
      message: `Resource "${resource.title}" saved to administrator-managed data.`,
      resource,
      resources
    });
  } catch {
    res.status(500).json({ error: 'Resource could not be saved.' });
  }
});

// ADMIN: Delete a subject by writing a durable MongoDB tombstone.
app.delete('/api/admin/subjects/:name', requireAdmin, rateLimit(60 * 60 * 1000, 20), async (req, res) => {
  try {
    const name = String(req.params.name || '').trim();
    const department = String(req.query.department || '').trim();
    const subjectId = `${department.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const existing = (await getAllSubjects('All')).find(subject => subject.id === subjectId);
    if (!existing) return res.status(404).json({ error: `Subject "${name}" not found.` });

    await saveKnowledgeBaseOverride({
      subjectId,
      department,
      deleted: true,
      payload: { id: subjectId, name, department }
    });
    res.json({ success: true, deletedSubject: name });
  } catch {
    res.status(500).json({ error: 'Subject could not be deleted.' });
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

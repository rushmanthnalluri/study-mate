import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const savedNotesFile = path.join(dataDir, 'saved-notes.json');
const feedbackFile = path.join(dataDir, 'feedback.json');
const chatHistoryFile = path.join(dataDir, 'chat-history.json');

// Mongoose Schemas for Render MongoDB
const AiConfigSchema = new mongoose.Schema({
  id: { type: String, unique: true, default: 'global' },
  provider: { type: String, default: 'offline' },
  model: { type: String, default: '' },
  encryptedApiKey: { type: String, default: '' },
  updatedAt: { type: String }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  klId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, select: false },
  passwordHash: { type: String },
  authTokenHash: { type: String },
  authTokenIssuedAt: { type: String },
  department: { type: String, default: 'Food Technology' },
  role: { type: String, default: 'student' },
  isLmsConnected: { type: Boolean, default: true },
  lmsUsername: { type: String },
  lmsLastSynced: { type: String },
  enrolledCourses: { type: Array, default: [] },
}, { timestamps: true });

const SavedNoteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  subject: { type: String, required: true },
  department: { type: String, default: 'Food Technology' },
  code: { type: String },
  unit: { type: String },
  keywords: [String],
  twoMarks: { question: String, answer: String },
  fiveMarks: { question: String, answer: String },
  tenMarks: { question: String, answer: String },
  diagram: { type: Object },
  resourcesUsed: { type: Array, default: [] },
  savedAt: { type: String },
  isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

const FeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  department: { type: String, default: 'Food Technology' },
  subject: { type: String, default: 'General' },
  source: { type: String, default: 'Student' },
  rating: { type: String, enum: ['useful', 'not_useful'], default: 'useful' },
  comment: { type: String, default: '' },
  createdAt: { type: String }
}, { timestamps: true });

const StudySourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  mimeType: { type: String, default: 'text/plain' },
  content: { type: String, required: true },
  createdAt: { type: String, required: true }
}, { timestamps: true });

const QuizAttemptSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  subject: { type: String, required: true },
  mode: { type: String, enum: ['quiz', 'model'], required: true },
  score: { type: Number, min: 0, required: true },
  total: { type: Number, min: 1, required: true },
  percentage: { type: Number, min: 0, max: 100, required: true },
  completedAt: { type: String, required: true }
}, { timestamps: true });

const ChatMessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  topic: { type: String },
  subject: { type: String },
  department: { type: String },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

export let AiConfigModel;
export let UserModel;
export let SavedNoteModel;
export let FeedbackModel;
export let ChatMessageModel;
export let QuizAttemptModel;
export let StudySourceModel;

let isMongoConnected = false;
let mongoRequired = Boolean(process.env.MONGODB_URI);

function assertStorageReady() {
  if (mongoRequired && !isMongoConnected) throw new Error('Database unavailable.');
}

function atomicWriteJson(file, value) {
  const temp = file + '.tmp-' + process.pid + '-' + Date.now();
  fs.writeFileSync(temp, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temp, file);
}

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false
      });
      isMongoConnected = true;
      mongoRequired = true;
      console.log('🍃 [Render MongoDB] Connected successfully to MongoDB instance!');

      AiConfigModel = mongoose.models.AiConfig || mongoose.model('AiConfig', AiConfigSchema);
      UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
      SavedNoteModel = mongoose.models.SavedNote || mongoose.model('SavedNote', SavedNoteSchema);
      FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
      ChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
      QuizAttemptModel = mongoose.models.QuizAttempt || mongoose.model('QuizAttempt', QuizAttemptSchema);
      StudySourceModel = mongoose.models.StudySource || mongoose.model('StudySource', StudySourceSchema);
      return true;
    } catch (err) {
      console.warn('⚠️ [MongoDB Warning] Could not connect to MONGODB_URI.', err.message);
      isMongoConnected = false;
    }
  } else {
    mongoRequired = false;
    console.log('📁 [Storage] Running in local file-based storage mode.');
  }

  return false;
}

// -------------------------------------------------------------
export async function getAiConfig() {
  assertStorageReady();
  if (isMongoConnected && AiConfigModel) {
    try {
      return await AiConfigModel.findOne({ id: 'global' }).lean();
    } catch (e) {
      throw new Error('Database unavailable.');
    }
  }
  return null;
}

export async function saveAiConfig(config) {
  assertStorageReady();
  const payload = { ...config, id: 'global', updatedAt: new Date().toISOString() };
  if (isMongoConnected && AiConfigModel) {
    return AiConfigModel.findOneAndUpdate({ id: 'global' }, payload, { upsert: true, returnDocument: 'after' }).lean();
  }
  return payload;
}

// -------------------------------------------------------------
// USER OPERATIONS (Dual Mongo / File Support)
// -------------------------------------------------------------
export async function getAllUsers() {
  assertStorageReady();
  if (isMongoConnected && UserModel) {
    try {
      return await UserModel.find({}).lean();
    } catch (e) {
      throw new Error('Database unavailable.');
    }
  }
  if (!fs.existsSync(usersFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function saveUser(user) {
  assertStorageReady();
  if (isMongoConnected && UserModel) {
    return UserModel.findOneAndUpdate(
      { id: user.id },
      user,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }
  const users = await getAllUsers();
  const existingIdx = users.findIndex(u => u.id === user.id || u.klId === user.klId || u.email === user.email);
  if (existingIdx >= 0) users[existingIdx] = { ...users[existingIdx], ...user };
  else users.push(user);
  atomicWriteJson(usersFile, users);
  return user;
}
// -------------------------------------------------------------
// SAVED NOTES OPERATIONS
// -------------------------------------------------------------
export async function getSavedNotes(userId = null) {
  assertStorageReady();
  if (isMongoConnected && SavedNoteModel) {
    try {
      return await SavedNoteModel.find(userId ? { userId } : {}).sort({ createdAt: -1 }).lean();
    } catch (e) {
      throw new Error('Database unavailable.');
    }
  }
  if (!fs.existsSync(savedNotesFile)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(savedNotesFile, 'utf8'));
    return userId ? list.filter(n => n.userId === userId) : list;
  } catch (e) {
    return [];
  }
}

export async function addSavedNote(note) {
  assertStorageReady();
  if (isMongoConnected && SavedNoteModel) {
    return SavedNoteModel.findOneAndUpdate(
      { userId: note.userId, topic: note.topic, subject: note.subject },
      note,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
  }
  // File fallback must preserve every user's records. Never replace the
  // complete file with a single user's filtered view.
  let notes = [];
  if (fs.existsSync(savedNotesFile)) {
    try {
      notes = JSON.parse(fs.readFileSync(savedNotesFile, 'utf8'));
    } catch (e) {
      notes = [];
    }
  }

  const ownerId = String(note.userId || '');
  if (!ownerId) throw new Error('Saved notes require an authenticated user.');

  // Keep the existing per-user uniqueness behavior without touching
  // another user's records.
  notes = notes.filter(n => !(n.userId === ownerId && n.topic === note.topic && n.subject === note.subject));
  notes.unshift(note);
  atomicWriteJson(savedNotesFile, notes);
  return note;
}

export async function deleteSavedNote(id, userId = null) {
  assertStorageReady();
  if (isMongoConnected && SavedNoteModel) {
    const result = await SavedNoteModel.deleteOne({ id, userId: String(userId || '') });
    return result.deletedCount > 0;
  }
  const ownerId = String(userId || '');
  if (!ownerId) throw new Error('Saved notes require an authenticated user.');

  let notes = [];
  if (fs.existsSync(savedNotesFile)) {
    try {
      notes = JSON.parse(fs.readFileSync(savedNotesFile, 'utf8'));
    } catch (e) {
      notes = [];
    }
  }

  notes = notes.filter(n => !(n.id === id && n.userId === ownerId));
  atomicWriteJson(savedNotesFile, notes);
  return true;
}

// -------------------------------------------------------------
// FEEDBACK OPERATIONS
// -------------------------------------------------------------
export async function getFeedbacks() {
  assertStorageReady();
  if (isMongoConnected && FeedbackModel) {
    try {
      return await FeedbackModel.find({}).sort({ createdAt: -1 }).lean();
    } catch (e) {
      throw new Error('Database unavailable.');
    }
  }
  if (!fs.existsSync(feedbackFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function addFeedback(feedback) {
  assertStorageReady();
  if (isMongoConnected && FeedbackModel) {
    return FeedbackModel.create(feedback).then(doc => doc.toObject());
  }
  const list = await getFeedbacks();
  list.unshift(feedback);
  atomicWriteJson(feedbackFile, list);
  return feedback;
}



// -------------------------------------------------------------
// STUDY SOURCES
// -------------------------------------------------------------
export async function addStudySource(source) {
  assertStorageReady();
  if (isMongoConnected && StudySourceModel) return StudySourceModel.create(source).then(doc => doc.toObject());
  const file = path.join(dataDir, 'study-sources.json');
  const list = fs.existsSync(file) ? await readJson(file) : [];
  list.unshift(source);
  atomicWriteJson(file, list.slice(0, 1000));
  return source;
}

export async function getStudySources(userId, limit = 20) {
  assertStorageReady();
  if (!userId) throw new Error('Study sources require an authenticated user.');
  if (isMongoConnected && StudySourceModel) return StudySourceModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  const file = path.join(dataDir, 'study-sources.json');
  const list = fs.existsSync(file) ? await readJson(file) : [];
  return list.filter(s => s.userId === userId).slice(0, limit);
}

export async function deleteStudySource(id, userId) {
  assertStorageReady();
  if (!userId) throw new Error('Study sources require an authenticated user.');
  if (isMongoConnected && StudySourceModel) return StudySourceModel.deleteOne({ id, userId });
  const file = path.join(dataDir, 'study-sources.json');
  const list = fs.existsSync(file) ? await readJson(file) : [];
  atomicWriteJson(file, list.filter(s => !(s.id === id && s.userId === userId)));
  return true;
}

// -------------------------------------------------------------
// QUIZ ATTEMPTS
// -------------------------------------------------------------
export async function addQuizAttempt(attempt) {
  assertStorageReady();
  if (isMongoConnected && QuizAttemptModel) return QuizAttemptModel.create(attempt).then(doc => doc.toObject());
  const file = path.join(dataDir, 'quiz-attempts.json');
  const list = fs.existsSync(file) ? await readJson(file) : [];
  list.unshift(attempt);
  atomicWriteJson(file, list.slice(0, 5000));
  return attempt;
}

export async function getQuizAttempts(userId, limit = 20) {
  assertStorageReady();
  if (!userId) throw new Error('Quiz history requires an authenticated user.');
  if (isMongoConnected && QuizAttemptModel) {
    return QuizAttemptModel.find({ userId }).sort({ completedAt: -1 }).limit(limit).lean();
  }
  const file = path.join(dataDir, 'quiz-attempts.json');
  const list = fs.existsSync(file) ? await readJson(file) : [];
  return list.filter(a => a.userId === userId).slice(0, limit);
}

// -------------------------------------------------------------
// CHATBOT MESSAGE PERSISTENCE
// -------------------------------------------------------------
export async function getChatMessages(userId) {
  assertStorageReady();
  if (!userId) throw new Error('Chat history requires an authenticated user.');
  if (isMongoConnected && ChatMessageModel) {
    try {
      const docs = await ChatMessageModel.find({ userId }).sort({ createdAt: 1 }).lean();
      return docs;
    } catch (e) {}
  }
  if (!fs.existsSync(chatHistoryFile)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
    return list.filter(m => m.userId === userId);
  } catch (e) {
    return [];
  }
}

export async function saveChatMessage(msg) {
  assertStorageReady();
  if (!msg?.userId) throw new Error('Chat messages require an authenticated user.');
  if (isMongoConnected && ChatMessageModel) {
    return ChatMessageModel.create(msg).then(doc => doc.toObject());
  }
  let list = [];
  if (fs.existsSync(chatHistoryFile)) {
    try {
      list = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
    } catch (e) {}
  }
  list.push(msg);
  // Keep last 100 messages in local file
  if (list.length > 100) list = list.slice(-100);
  atomicWriteJson(chatHistoryFile, list);
  return msg;
}

export async function clearStudyMateData() {
  assertStorageReady();
  if (isMongoConnected) {
    await Promise.all([
      UserModel?.deleteMany({}), SavedNoteModel?.deleteMany({}),
      FeedbackModel?.deleteMany({}), ChatMessageModel?.deleteMany({}), QuizAttemptModel?.deleteMany({}), StudySourceModel?.deleteMany({})
    ]);
    return;
  }
  const files = [usersFile, savedNotesFile, feedbackFile, chatHistoryFile, path.join(dataDir, 'quiz-attempts.json'), path.join(dataDir, 'study-sources.json')];
  for (const file of files) atomicWriteJson(file, []);
}

export function isDatabaseConnected() {
  return isMongoConnected;
}

export async function closeDatabase() {
  if (isMongoConnected) {
    await mongoose.disconnect();
    isMongoConnected = false;
  }
}

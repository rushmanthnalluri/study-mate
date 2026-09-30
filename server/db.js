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
  aiSettings: { type: Object }
}, { timestamps: true });

const SavedNoteSchema = new mongoose.Schema({
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
  topic: { type: String, required: true },
  department: { type: String, default: 'Food Technology' },
  subject: { type: String, default: 'General' },
  source: { type: String, default: 'Student' },
  rating: { type: String, enum: ['useful', 'not_useful'], default: 'useful' },
  comment: { type: String, default: '' },
  createdAt: { type: String }
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

export let UserModel;
export let SavedNoteModel;
export let FeedbackModel;
export let ChatMessageModel;

let isMongoConnected = false;

export async function initDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        bufferCommands: false
      });
      isMongoConnected = true;
      console.log('🍃 [Render MongoDB] Connected successfully to MongoDB instance!');

      UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
      SavedNoteModel = mongoose.models.SavedNote || mongoose.model('SavedNote', SavedNoteSchema);
      FeedbackModel = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
      ChatMessageModel = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
      return true;
    } catch (err) {
      console.warn('⚠️ [MongoDB Warning] Could not connect to MONGODB_URI. Falling back gracefully to JSON storage.', err.message);
      isMongoConnected = false;
    }
  } else {
    console.log('📁 [Storage] Running in resilient file-based storage mode. (Set MONGODB_URI on Render to enable MongoDB).');
  }

  return false;
}

// -------------------------------------------------------------
// USER OPERATIONS (Dual Mongo / File Support)
// -------------------------------------------------------------
export async function getAllUsers() {
  if (isMongoConnected && UserModel) {
    try {
      const docs = await UserModel.find({}).lean();
      if (docs.length > 0) return docs;
    } catch (e) {
      console.warn('Mongo read error, falling back to file:', e.message);
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
  // Update file storage
  const users = await getAllUsers();
  const existingIdx = users.findIndex(u => u.id === user.id || u.klId === user.klId || u.email === user.email);
  if (existingIdx >= 0) {
    users[existingIdx] = { ...users[existingIdx], ...user };
  } else {
    users.push(user);
  }
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

  // Update MongoDB if connected
  if (isMongoConnected && UserModel) {
    try {
      await UserModel.findOneAndUpdate(
        { id: user.id },
        user,
        { upsert: true, new: true }
      );
    } catch (e) {
      console.warn('Failed to upsert user in MongoDB:', e.message);
    }
  }

  return user;
}

// -------------------------------------------------------------
// SAVED NOTES OPERATIONS
// -------------------------------------------------------------
export async function getSavedNotes() {
  if (isMongoConnected && SavedNoteModel) {
    try {
      const docs = await SavedNoteModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs.length > 0) return docs;
    } catch (e) {}
  }
  if (!fs.existsSync(savedNotesFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(savedNotesFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function addSavedNote(note) {
  const notes = await getSavedNotes();
  const filtered = notes.filter(n => !(n.topic === note.topic && n.subject === note.subject));
  filtered.unshift(note);
  fs.writeFileSync(savedNotesFile, JSON.stringify(filtered, null, 2), 'utf8');

  if (isMongoConnected && SavedNoteModel) {
    try {
      await SavedNoteModel.findOneAndUpdate(
        { id: note.id },
        note,
        { upsert: true, new: true }
      );
    } catch (e) {}
  }
  return note;
}

export async function deleteSavedNote(id) {
  const notes = await getSavedNotes();
  const filtered = notes.filter(n => n.id !== id);
  fs.writeFileSync(savedNotesFile, JSON.stringify(filtered, null, 2), 'utf8');

  if (isMongoConnected && SavedNoteModel) {
    try {
      await SavedNoteModel.deleteOne({ id });
    } catch (e) {}
  }
  return true;
}

// -------------------------------------------------------------
// FEEDBACK OPERATIONS
// -------------------------------------------------------------
export async function getFeedbacks() {
  if (isMongoConnected && FeedbackModel) {
    try {
      const docs = await FeedbackModel.find({}).sort({ createdAt: -1 }).lean();
      if (docs.length > 0) return docs;
    } catch (e) {}
  }
  if (!fs.existsSync(feedbackFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
  } catch (e) {
    return [];
  }
}

export async function addFeedback(feedback) {
  const list = await getFeedbacks();
  list.unshift(feedback);
  fs.writeFileSync(feedbackFile, JSON.stringify(list, null, 2), 'utf8');

  if (isMongoConnected && FeedbackModel) {
    try {
      await FeedbackModel.create(feedback);
    } catch (e) {}
  }
  return feedback;
}

// -------------------------------------------------------------
// CHATBOT MESSAGE PERSISTENCE
// -------------------------------------------------------------
export async function getChatMessages(userId = 'default') {
  if (isMongoConnected && ChatMessageModel) {
    try {
      const docs = await ChatMessageModel.find({ userId }).sort({ createdAt: 1 }).lean();
      if (docs.length > 0) return docs;
    } catch (e) {}
  }
  if (!fs.existsSync(chatHistoryFile)) return [];
  try {
    const list = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
    return list.filter(m => !userId || m.userId === userId || m.userId === 'default');
  } catch (e) {
    return [];
  }
}

export async function saveChatMessage(msg) {
  let list = [];
  if (fs.existsSync(chatHistoryFile)) {
    try {
      list = JSON.parse(fs.readFileSync(chatHistoryFile, 'utf8'));
    } catch (e) {}
  }
  list.push(msg);
  // Keep last 100 messages in local file
  if (list.length > 100) list = list.slice(-100);
  fs.writeFileSync(chatHistoryFile, JSON.stringify(list, null, 2), 'utf8');

  if (isMongoConnected && ChatMessageModel) {
    try {
      await ChatMessageModel.create(msg);
    } catch (e) {}
  }
  return msg;
}

export async function clearStudyMateData() {
  const files = [usersFile, savedNotesFile, feedbackFile, chatHistoryFile];
  for (const file of files) fs.writeFileSync(file, '[]', 'utf8');
  if (isMongoConnected) {
    await Promise.all([
      UserModel?.deleteMany({}), SavedNoteModel?.deleteMany({}),
      FeedbackModel?.deleteMany({}), ChatMessageModel?.deleteMany({})
    ]);
  }
}

export function isDatabaseConnected() {
  return isMongoConnected;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const server = fs.readFileSync(path.join(root, 'server', 'index.js'), 'utf8');
const db = fs.readFileSync(path.join(root, 'server', 'db.js'), 'utf8');

test('all personalized API routes require authentication', () => {
  const required = [
    "app.post('/api/generate', requireAuth",
    "app.get('/api/saved-notes', requireAuth",
    "app.post('/api/saved-notes', requireAuth",
    "app.delete('/api/saved-notes/:id', requireAuth",
    "app.post('/api/feedback', requireAuth",
    "app.get('/api/feedback/summary', requireAuth",
    "app.post('/api/chat', requireAuth",
    "app.get('/api/chat/history', requireAuth",
    "app.put('/api/auth/profile', requireAuth",
    "app.post('/api/quiz/generate', requireAuth",
    "app.post('/api/quiz/attempts', requireAuth",
    "app.get('/api/quiz/attempts', requireAuth",
    "app.post('/api/studio/sources', requireAuth",
    "app.post('/api/studio/sources/pdf', requireAuth",
    "app.get('/api/studio/sources', requireAuth",
    "app.delete('/api/studio/sources/:id', requireAuth",
    "app.post('/api/studio/ask', requireAuth",
    "app.post('/api/auth/signup', rateLimit",
    "app.post('/api/auth/password', requireAuth, rateLimit",
    "app.get('/api/flashcards/progress', requireAuth",
    "app.put('/api/flashcards/progress/:flashcardId', requireAuth"
  ];
  for (const route of required) assert.ok(server.includes(route), route);
});

test('admin configuration and mutation routes require administrator authorization', () => {
  const routes = [
    "app.get('/api/admin/ai-config', requireAdmin",
    "app.put('/api/admin/ai-config', requireAdmin",
    "app.get('/api/admin/stats', requireAdmin",
    "app.post('/api/admin/subjects', requireAdmin",
    "app.post('/api/admin/resources', requireAdmin",
    "app.delete('/api/admin/subjects/:name', requireAdmin"
  ];
  for (const route of routes) assert.ok(server.includes(route), route);
});

test('production database mode fails closed instead of silently falling back to files', () => {
  assert.ok(db.includes('let mongoRequired = Boolean(process.env.MONGODB_URI);'));
  assert.ok(db.includes('function assertStorageReady()'));
  assert.ok(db.includes("throw new Error('Database unavailable.')"));
});

test('session revocation endpoint exists and clears server token state', () => {
  assert.ok(server.includes("app.post('/api/auth/logout', requireAuth"));
  assert.ok(server.includes("req.user.authTokenHash = ''"));
});

test('expensive authenticated endpoints have rate limits', () => {
  const routes = [
    "app.post('/api/generate', requireAuth, rateLimit",
    "app.post('/api/chat', requireAuth, rateLimit",
    "app.post('/api/quiz/generate', requireAuth, rateLimit",
    "app.post('/api/feedback', requireAuth, rateLimit",
    "app.post('/api/saved-notes', requireAuth, rateLimit"
  ];
  for (const route of routes) assert.ok(server.includes(route), route);
});

test('production responses do not expose caught exception messages from API handlers', () => {
  assert.doesNotMatch(server, /res.status(500).json({ error: err.message })/);
  assert.match(server, /Internal server error./);
});


test('offline quiz fallback only accepts administrator-managed structured MCQs', () => {
  assert.match(server, /Array\.isArray\(q\.options\)/);
  assert.match(server, /Number\.isInteger\(q\.answer\)/);
  assert.doesNotMatch(server, /Which unit is this question mapped to/);
});

test('MongoDB connection failures do not silently fall back after startup', () => {
  assert.doesNotMatch(db, /Mongo read error, falling back to file/);
  assert.doesNotMatch(db, /Falling back gracefully to JSON storage/);
  assert.match(db, /throw new Error\('Database unavailable\.'\)/);
});

test('Mongo-backed writes do not duplicate into local JSON storage', () => {
  assert.match(db, /if \(isMongoConnected && ChatMessageModel\) \{\s*return ChatMessageModel\.create/);
  assert.match(db, /if \(isMongoConnected && FeedbackModel\) \{\s*return FeedbackModel\.create/);
});


test('PDF Studio ingestion is authenticated and size-limited', () => {
  assert.match(server, /app\.post\('\/api\/studio\/sources\/pdf', requireAuth, rateLimit/);
  assert.match(server, /express\.raw\(\{ type: \['application\/pdf', 'application\/octet-stream'\], limit: '12mb' \}\)/);
  assert.match(server, /buffer\.length > 10 \* 1024 \* 1024/);
  assert.match(server, /extractPdfText\(buffer\)/);
});


test('flashcard progress is server-backed and scoped to the authenticated account', () => {
  assert.match(db, /FlashcardProgressSchema/);
  assert.match(db, /FlashcardProgressSchema\.index\(\{ userId: 1, flashcardId: 1 \}, \{ unique: true \}\)/);
  assert.match(db, /find\(\{ userId \}\)/);
  assert.match(db, /findOneAndUpdate\([\s\S]*\{ userId, flashcardId \}/);
});


test('flashcard review schedules are validated server-side', () => {
  assert.match(server, /Number\.isNaN\(parsed\.getTime\(\)\)/);
  assert.match(server, /Review date is too far in the future/);
  assert.match(server, /req\.user\.id/);
});

test('flashcard UI does not persist mastery as browser source of truth', () => {
  const flashcards = fs.readFileSync(path.join(root, 'src', 'screens', 'FlashcardsScreen.tsx'), 'utf8');
  assert.doesNotMatch(flashcards, /localStorage\.setItem\(.*studymate_flashcard_progress_/);
});


test('document analyzer has no fabricated sample-document corpus', () => {
  const analyzer = fs.readFileSync(path.join(root, 'src', 'screens', 'PaperAnalyzerScreen.tsx'), 'utf8');
  assert.doesNotMatch(analyzer, /SAMPLE_DOCS|Quick 1-Click Sample Handouts/);
  assert.doesNotMatch(analyzer, /Primary Kinetic Index|Quality Retention Benchmark/);
});

test('Mermaid rendering uses strict security mode and accessible controls', () => {
  const mermaid = fs.readFileSync(path.join(root, 'src', 'components', 'MermaidViewer.tsx'), 'utf8');
  assert.match(mermaid, /securityLevel:\s*['"]strict['"]/);
  assert.match(mermaid, /aria-label="Zoom out diagram"/);
  assert.match(mermaid, /aria-label="Zoom in diagram"/);
});

test('account dialogs expose modal semantics', () => {
  const auth = fs.readFileSync(path.join(root, 'src', 'components', 'AuthModal.tsx'), 'utf8');
  const settings = fs.readFileSync(path.join(root, 'src', 'components', 'SettingsModal.tsx'), 'utf8');
  assert.ok(auth.includes('role="dialog"'));
  assert.ok(auth.includes('aria-modal="true"'));
  assert.ok(settings.includes('role="dialog"'));
  assert.ok(settings.includes('aria-modal="true"'));
});


test('MongoDB enforces unique user email and KL ID identity fields', () => {
  assert.match(db, /UserSchema\.index\(\{ email: 1 \}, \{ unique: true/);
  assert.match(db, /UserSchema\.index\(\{ klId: 1 \}, \{ unique: true/);
  assert.match(server, /err\?\.code === 11000/);
});

test('user uniqueness migration detects legacy duplicates before creating unique indexes', () => {
  const migration = fs.readFileSync(path.join(root, 'scripts', 'mongodb-migrate.mjs'), 'utf8');
  assert.match(migration, /hasMigration\(db, 1\)/);
  assert.match(migration, /hasMigration\(db, 2\)/);
  assert.match(migration, /duplicate email or KL ID records exist/);
  assert.match(migration, /users_email_unique_ci/);
  assert.match(migration, /users_klid_unique_ci/);
});


test('profile updates validate identity fields and handle uniqueness conflicts', () => {
  assert.match(server, /Profile fields must be between 2 and 100 characters/);
  assert.match(server, /An account with this KL ID already exists/);
  assert.match(server, /err\?\.code === 11000/);
});

test('Mermaid output is rendered as an isolated image resource, not injected HTML', () => {
  const mermaid = fs.readFileSync(path.join(root, 'src', 'components', 'MermaidViewer.tsx'), 'utf8');
  assert.doesNotMatch(mermaid, /dangerouslySetInnerHTML/);
  assert.match(mermaid, /URL\.createObjectURL/);
  assert.match(mermaid, /type: 'image\/svg\+xml'/);
  assert.match(mermaid, /<img/);
});


test('admin knowledge-base filesystem writes are path-confined and resource types are allowlisted', () => {
  assert.match(server, /const resolveKnowledgeBasePath = \(\.\.\.segments\)/);
  assert.match(server, /path\.relative\(kbRoot, candidate\)/);
  assert.match(server, /if \(!targetFile\) return res\.status\(400\)/);
  assert.match(server, /path\.dirname\(filePath\) !== subjDir/);
  assert.match(server, /resolveKnowledgeBasePath\(String\(department\)\.trim\(\), String\(name\)\.trim\(\)\)/);
});


test('production HTTP security baseline includes proxy trust and CSP', () => {
  assert.match(server, /process\.env\.NODE_ENV === 'production'\) app\.set\('trust proxy', 1\)/);
  assert.match(server, /Content-Security-Policy/);
  assert.match(server, /object-src 'none'/);
  assert.match(server, /frame-ancestors 'none'/);
});


test('production browser security headers and mutation rate limits are enforced', () => {
  assert.match(server, /Content-Security-Policy/);
  assert.match(server, /Strict-Transport-Security/);
  assert.match(server, /app\.put\('\/api\/auth\/profile', requireAuth, rateLimit/);
  assert.match(server, /app\.post\('\/api\/admin\/subjects', requireAdmin, rateLimit/);
  assert.match(server, /app\.post\('\/api\/admin\/resources', requireAdmin, rateLimit/);
  assert.match(server, /app\.delete\('\/api\/admin\/subjects\/:name', requireAdmin, rateLimit/);
});


test('admin knowledge-base mutations persist through MongoDB overrides', () => {
  assert.match(db, /KnowledgeBaseOverrideSchema/);
  assert.match(db, /export let KnowledgeBaseOverrideModel/);
  assert.match(db, /saveKnowledgeBaseOverride/);
  assert.match(server, /getKnowledgeBaseOverrides/);
  assert.match(server, /await saveKnowledgeBaseOverride\(/);
  assert.match(server, /const persistedSubject =/);
});


test('AI configuration encryption requires a strong server-side secret', () => {
  assert.match(server, /hasStrongConfigSecret/);
  assert.match(server, /length >= 32/);
  const chatbot = fs.readFileSync(path.join(root, 'server', 'chatbot.js'), 'utf8');
  assert.match(chatbot, /secret\.length >= 32/);
});

test('LMS is completely removed from the application surface', () => {
  const app = fs.readFileSync(path.join(root, 'src', 'App.tsx'), 'utf8');
  const types = fs.readFileSync(path.join(root, 'src', 'types.ts'), 'utf8');
  const header = fs.readFileSync(path.join(root, 'src', 'components', 'Header.tsx'), 'utf8');
  const home = fs.readFileSync(path.join(root, 'src', 'screens', 'HomeScreen.tsx'), 'utf8');
  assert.doesNotMatch(app, /LmsSyncScreen|lms-sync|onNavigateToLmsSync/);
  assert.doesNotMatch(types, /isLmsConnected|lmsUsername|lmsLastSynced|lms-sync/);
  assert.doesNotMatch(header, /LMS|lms-sync|RefreshCw/);
  assert.doesNotMatch(home, /KL LMS|lms-sync/);
  assert.doesNotMatch(server, /\/api\/auth\/kl-lms|lmsUsername|isLmsConnected|lmsLastSynced|enrolledCourses/);
  assert.doesNotMatch(db, /isLmsConnected|lmsUsername|lmsLastSynced|enrolledCourses/);
});

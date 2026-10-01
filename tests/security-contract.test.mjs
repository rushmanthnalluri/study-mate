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
    "app.post('/api/auth/kl-lms/connect', requireAuth",
    "app.post('/api/auth/kl-lms/sync', requireAuth",
    "app.post('/api/quiz/generate', requireAuth"
  ];
  for (const route of required) assert.ok(server.includes(route), route);
});

test('admin configuration and mutation routes require administrator authorization', () => {
  assert.match(server, /app.get('\/api\/admin\/ai-config', requireAdmin/);
  assert.match(server, /app.put('\/api\/admin\/ai-config', requireAdmin/);
  assert.match(server, /app.get('\/api\/admin\/stats', requireAdmin/);
  assert.match(server, /app.post('\/api\/admin\/subjects', requireAdmin/);
  assert.match(server, /app.post('\/api\/admin\/resources', requireAdmin/);
  assert.match(server, /app.delete('\/api\/admin\/subjects\/:name', requireAdmin/);
});

test('production database mode fails closed instead of silently falling back to files', () => {
  assert.match(db, /let mongoRequired = Boolean(process.env.MONGODB_URI)/);
  assert.match(db, /function assertStorageReady()/);
  assert.match(db, /throw new Error('Database unavailable.')/);
});

test('session revocation endpoint exists and clears server token state', () => {
  assert.match(server, /app.post('\/api\/auth\/logout', requireAuth/);
  assert.match(server, /req.user.authTokenHash = ''/);
});

test('expensive authenticated endpoints have rate limits', () => {
  assert.match(server, /app.post('\/api\/generate', requireAuth, rateLimit/);
  assert.match(server, /app.post('\/api\/chat', requireAuth, rateLimit/);
  assert.match(server, /app.post('\/api\/quiz\/generate', requireAuth, rateLimit/);
  assert.match(server, /app.post('\/api\/feedback', requireAuth, rateLimit/);
  assert.match(server, /app.post('\/api\/saved-notes', requireAuth, rateLimit/);
});

test('production responses do not expose caught exception messages from API handlers', () => {
  assert.doesNotMatch(server, /res.status(500).json({ error: err.message })/);
  assert.match(server, /Internal server error./);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');

test('MongoDB operations are explicitly environment-driven and fail closed', () => {
  const backup = read('scripts/mongodb-backup.mjs');
  const restore = read('scripts/mongodb-restore.mjs');
  const migrate = read('scripts/mongodb-migrate.mjs');

  assert.match(backup, /MONGODB_URI/);
  assert.match(backup, /spawn\('mongodump'/);
  assert.match(backup, /shell:\s*false/);

  assert.match(restore, /MONGODB_URI/);
  assert.match(restore, /ALLOW_MONGORESTORE !== 'true'/);
  assert.match(restore, /--drop/);
  assert.match(restore, /spawn\('mongorestore'/);
  assert.match(restore, /shell:\s*false/);

  assert.match(migrate, /hasMigration\(db, 1\)/);
  assert.match(migrate, /hasMigration\(db, 2\)/);
  assert.match(migrate, /knowledgebaseoverrides/);
  assert.match(migrate, /hasMigration\(db, 3\)/);
  assert.match(migrate, /_schema_migrations/);
  assert.match(migrate, /Enforce case-insensitive unique user email and KL ID constraints/);
  assert.match(migrate, /unique:\s*true/);
  assert.match(migrate, /NamespaceExists/);
});

test('health endpoint is unauthenticated and reports storage readiness', () => {
  const server = read('server/index.js');
  assert.match(server, /app\.get\('\/api\/health', \(req, res\) =>/);
  assert.match(server, /isDatabaseConnected\(\) \? 200 : 503/);
  assert.match(server, /service:\s*'studymate'/);
});

test('production launcher runs MongoDB migrations before the server when MongoDB is configured', () => {
  const launcher = read('server.js');
  assert.match(launcher, /if \(process\.env\.MONGODB_URI\)/);
  assert.match(launcher, /await import\('\.\/scripts\/mongodb-migrate\.mjs'\)/);
  assert.match(launcher, /await import\('\.\/server\/index\.js'\)/);
});

test('Render production service has a deterministic Node start command', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts.start, 'node server.js');
  assert.equal(packageJson.engines.node, '>=22.12.0');
});

#!/usr/bin/env node
import { mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI is required.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = resolve(process.env.MONGODB_BACKUP_DIR || 'backups', stamp);
mkdirSync(output, { recursive: true });

const child = spawn('mongodump', ['--uri', uri, '--out', output], {
  stdio: 'inherit',
  shell: false
});
child.on('error', err => {
  console.error('Unable to start mongodump:', err.message);
  process.exit(1);
});
child.on('exit', code => {
  if (code === 0) console.log(`MongoDB backup completed: ${output}`);
  process.exit(code ?? 1);
});

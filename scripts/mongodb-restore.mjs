#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const uri = process.env.MONGODB_URI;
const backupPath = process.argv[2];
if (!uri) {
  console.error('MONGODB_URI is required.');
  process.exit(1);
}
if (!backupPath) {
  console.error('Usage: npm run db:restore -- <backup-directory>');
  process.exit(1);
}
if (process.env.ALLOW_MONGORESTORE !== 'true') {
  console.error('Restore is destructive. Set ALLOW_MONGORESTORE=true after verifying the backup and target database.');
  process.exit(1);
}

const source = resolve(backupPath);
if (!existsSync(source)) {
  console.error(`Backup directory does not exist: ${source}`);
  process.exit(1);
}

const child = spawn('mongorestore', ['--uri', uri, '--drop', source], {
  stdio: 'inherit',
  shell: false
});
child.on('error', err => {
  console.error('Unable to start mongorestore:', err.message);
  process.exit(1);
});
child.on('exit', code => {
  if (code === 0) console.log(`MongoDB restore completed from: ${source}`);
  process.exit(code ?? 1);
});

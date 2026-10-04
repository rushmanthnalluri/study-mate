const { initDatabase, isDatabaseConnected } = await import('./server/db.js');

if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  console.error('StudyMate startup aborted: MONGODB_URI is required in production.');
  process.exit(1);
}

if (process.env.MONGODB_URI) {
  await import('./scripts/mongodb-migrate.mjs');
}

const databaseReady = await initDatabase();
if (process.env.MONGODB_URI && !databaseReady && !isDatabaseConnected()) {
  console.error('StudyMate startup aborted: MONGODB_URI is configured but MongoDB initialization failed.');
  process.exit(1);
}

await import('./server/index.js');

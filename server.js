if (process.env.MONGODB_URI) {
  await import('./scripts/mongodb-migrate.mjs');
}

await import('./server/index.js');

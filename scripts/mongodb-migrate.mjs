import mongoose from 'mongoose';

const CURRENT_SCHEMA_VERSION = 1;
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI is required for migrations.');
}

await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false
});

try {
  const db = mongoose.connection.db;
  const migrations = db.collection('_schema_migrations');
  await migrations.createIndex({ version: 1 }, { unique: true });

  const applied = await migrations.findOne({ version: CURRENT_SCHEMA_VERSION });
  if (!applied) {
    const indexes = await db.collection('flashcardprogresses').listIndexes().toArray();
    const equivalent = indexes.find(index =>
      index.unique === true &&
      JSON.stringify(index.key) === JSON.stringify({ userId: 1, flashcardId: 1 })
    );
    if (!equivalent) {
      await db.collection('flashcardprogresses').createIndex(
        { userId: 1, flashcardId: 1 },
        { unique: true, name: 'user_flashcard_unique' }
      );
    }

    await migrations.insertOne({
      version: CURRENT_SCHEMA_VERSION,
      appliedAt: new Date().toISOString(),
      description: 'Initial production schema/index contract'
    });
    console.log(`Applied MongoDB schema migration v${CURRENT_SCHEMA_VERSION}.`);
  } else {
    console.log(`MongoDB schema migration v${CURRENT_SCHEMA_VERSION} already applied.`);
  }
} finally {
  await mongoose.disconnect();
}

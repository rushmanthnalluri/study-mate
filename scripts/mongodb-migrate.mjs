import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required for migrations.');

await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  bufferCommands: false
});

const hasMigration = async (db, version) =>
  Boolean(await db.collection('_schema_migrations').findOne({ version }));

const recordMigration = async (db, version, description) => {
  await db.collection('_schema_migrations').insertOne({
    version,
    appliedAt: new Date().toISOString(),
    description
  });
};

try {
  const db = mongoose.connection.db;
  const migrations = db.collection('_schema_migrations');
  await migrations.createIndex({ version: 1 }, { unique: true });

  if (!(await hasMigration(db, 1))) {
    try {
      await db.createCollection('flashcardprogresses');
    } catch (error) {
      if (error?.code !== 48 && error?.codeName !== 'NamespaceExists') throw error;
    }

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

    await recordMigration(db, 1, 'Initial production schema/index contract for flashcard progress.');
    console.log('Applied MongoDB schema migration v1.');
  }

  if (!(await hasMigration(db, 2))) {
    const users = db.collection('users');
    const duplicateEmail = await users.aggregate([
      { $match: { email: { $type: 'string' } } },
      { $group: { _id: { $toLower: '$email' }, ids: { $push: '$id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 }
    ]).toArray();
    const duplicateKlId = await users.aggregate([
      { $match: { klId: { $type: 'string' } } },
      { $group: { _id: { $toLower: '$klId' }, ids: { $push: '$id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 1 }
    ]).toArray();

    if (duplicateEmail.length || duplicateKlId.length) {
      throw new Error('Cannot apply user uniqueness migration: duplicate email or KL ID records exist.');
    }

    await users.createIndex(
      { email: 1 },
      { unique: true, collation: { locale: 'en', strength: 2 }, name: 'users_email_unique_ci' }
    );
    await users.createIndex(
      { klId: 1 },
      { unique: true, collation: { locale: 'en', strength: 2 }, name: 'users_klid_unique_ci' }
    );

    await recordMigration(db, 2, 'Enforce case-insensitive unique user email and KL ID constraints.');
    console.log('Applied MongoDB schema migration v2.');
  }
  if (!(await hasMigration(db, 3))) {
    await db.collection('knowledgebaseoverrides').createIndex(
      { subjectId: 1 },
      { unique: true, name: 'knowledge_base_subject_unique' }
    );
    await recordMigration(db, 3, 'Persist administrator knowledge-base subject overrides durably in MongoDB.');
    console.log('Applied MongoDB schema migration v3.');
  }


  console.log('MongoDB schema migrations verified through v3.');
} finally {
  await mongoose.disconnect();
}

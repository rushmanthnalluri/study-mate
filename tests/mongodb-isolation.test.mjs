import test from 'node:test';
import assert from 'node:assert/strict';

const mongoUri = process.env.MONGODB_URI;
const enabled = Boolean(mongoUri);

test('MongoDB cross-user isolation', { skip: !enabled, timeout: 120000 }, async () => {
  const db = await import('../server/db.js');
  const {
    initDatabase,
    saveUser,
    addSavedNote,
    getSavedNotes,
    deleteSavedNote,
    addStudySource,
    getStudySources,
    deleteStudySource,
    addQuizAttempt,
    getQuizAttempts,
    saveChatMessage,
    getChatMessages,
    UserModel,
    SavedNoteModel,
    StudySourceModel,
    QuizAttemptModel,
    ChatMessageModel,
    FlashcardProgressModel,
    closeDatabase
  } = db;

  console.log('integration: connecting');
  await initDatabase();
  console.log('integration: connected');
  assert.equal(db.isDatabaseConnected(), true, 'MongoDB must be connected for this test');

  const suffix = `integration-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const userA = `mongo-a-${suffix}`;
  const userB = `mongo-b-${suffix}`;

  try {
    console.log('integration: writes and isolation checks');
    await saveUser({
      id: userA,
      klId: `KLA-${suffix}`,
      name: 'Integration A',
      email: `a-${suffix}@example.test`,
      passwordHash: 'test-hash',
      role: 'student'
    });
    await saveUser({
      id: userB,
      klId: `KLB-${suffix}`,
      name: 'Integration B',
      email: `b-${suffix}@example.test`,
      passwordHash: 'test-hash',
      role: 'student'
    });

    await addSavedNote({
      id: `note-a-${suffix}`,
      userId: userA,
      topic: 'Isolation topic',
      subject: 'Isolation subject',
      department: 'Test',
      savedAt: new Date().toISOString()
    });
    await addSavedNote({
      id: `note-b-${suffix}`,
      userId: userB,
      topic: 'Isolation topic',
      subject: 'Isolation subject',
      department: 'Test',
      savedAt: new Date().toISOString()
    });

    assert.deepEqual(
      (await getSavedNotes(userA)).map(n => n.userId),
      [userA],
      'user A must only receive user A notes'
    );
    assert.deepEqual(
      (await getSavedNotes(userB)).map(n => n.userId),
      [userB],
      'user B must only receive user B notes'
    );

    assert.equal(await deleteSavedNote(`note-b-${suffix}`, userA), false,
      'user A must not delete user B note');

    await addStudySource({
      id: `source-a-${suffix}`,
      userId: userA,
      name: 'A source',
      mimeType: 'text/plain',
      content: 'private A',
      createdAt: new Date().toISOString()
    });
    await addStudySource({
      id: `source-b-${suffix}`,
      userId: userB,
      name: 'B source',
      mimeType: 'text/plain',
      content: 'private B',
      createdAt: new Date().toISOString()
    });

    assert.deepEqual((await getStudySources(userA)).map(s => s.userId), [userA]);
    assert.deepEqual((await getStudySources(userB)).map(s => s.userId), [userB]);

    const crossDelete = await deleteStudySource(`source-b-${suffix}`, userA);
    assert.equal(crossDelete.deletedCount, 0, 'user A must not delete user B source');

    await addQuizAttempt({
      id: `attempt-a-${suffix}`,
      userId: userA,
      subject: 'Isolation subject',
      mode: 'quiz',
      score: 8,
      total: 10,
      percentage: 80,
      completedAt: new Date().toISOString()
    });
    await addQuizAttempt({
      id: `attempt-b-${suffix}`,
      userId: userB,
      subject: 'Isolation subject',
      mode: 'quiz',
      score: 4,
      total: 10,
      percentage: 40,
      completedAt: new Date().toISOString()
    });

    assert.deepEqual((await getQuizAttempts(userA)).map(a => a.userId), [userA]);
    assert.deepEqual((await getQuizAttempts(userB)).map(a => a.userId), [userB]);

    await db.saveFlashcardProgress({ userId: userA, flashcardId: 'fc-test', mastered: true, nextReviewAt: new Date(Date.now() + 86400000).toISOString() });
    await db.saveFlashcardProgress({ userId: userB, flashcardId: 'fc-test', mastered: false, nextReviewAt: new Date().toISOString() });
    await db.saveFlashcardProgress({ userId: userA, flashcardId: 'fc-test', mastered: false, nextReviewAt: new Date(Date.now() + 172800000).toISOString() });
    const userBProgressAfterAUpdate = await db.getFlashcardProgress(userB);
    assert.equal(userBProgressAfterAUpdate[0].mastered, false, 'user A must not modify user B progress');
    assert.deepEqual((await db.getFlashcardProgress(userA)).map(p => p.userId), [userA]);
    assert.equal((await db.getFlashcardProgress(userA))[0].mastered, false);
    assert.notEqual((await db.getFlashcardProgress(userA))[0].nextReviewAt, (await db.getFlashcardProgress(userB))[0].nextReviewAt);
    assert.deepEqual((await db.getFlashcardProgress(userB)).map(p => p.userId), [userB]);

    await saveChatMessage({
      id: `chat-a-${suffix}`,
      userId: userA,
      role: 'user',
      content: 'private A',
      timestamp: new Date().toISOString()
    });
    await saveChatMessage({
      id: `chat-b-${suffix}`,
      userId: userB,
      role: 'user',
      content: 'private B',
      timestamp: new Date().toISOString()
    });

    assert.deepEqual((await getChatMessages(userA)).map(m => m.userId), [userA]);
    assert.deepEqual((await getChatMessages(userB)).map(m => m.userId), [userB]);
  } finally {
    console.log('integration: cleanup');
    await Promise.all([
      UserModel.deleteMany({ id: { $in: [userA, userB] } }),
      SavedNoteModel.deleteMany({ id: { $in: [`note-a-${suffix}`, `note-b-${suffix}`] } }),
      StudySourceModel.deleteMany({ id: { $in: [`source-a-${suffix}`, `source-b-${suffix}`] } }),
      QuizAttemptModel.deleteMany({ id: { $in: [`attempt-a-${suffix}`, `attempt-b-${suffix}`] } }),
      ChatMessageModel.deleteMany({ id: { $in: [`chat-a-${suffix}`, `chat-b-${suffix}`] } }),
      FlashcardProgressModel.deleteMany({ userId: { $in: [userA, userB] }, flashcardId: 'fc-test' })
    ]);
    await closeDatabase();
    console.log('integration: complete');
  }
});

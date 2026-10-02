# StudyMate MongoDB Operations

## Backup

Production data is stored in MongoDB when `MONGODB_URI` is configured. Create a filesystem backup before production migrations or releases that change persisted schemas:

```bash
MONGODB_URI="..." npm run db:backup
```

The backup is written to `backups/<timestamp>/`. Keep backups outside the application deployment filesystem for real disaster recovery (for example, object storage or a managed MongoDB backup policy).

Recommended retention:
- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 12 months

At least one restore drill should be performed periodically against a disposable database.

## Restore

Restore only into a verified target database. The command is intentionally guarded:

```bash
ALLOW_MONGORESTORE=true MONGODB_URI="..." npm run db:restore -- ./backups/<timestamp>/<database>
```

`mongorestore --drop` replaces collections in the target database. Never point this at production until the backup, target URI, and restore scope have been independently verified.

After restore:
1. Run the application integration tests against the restored database.
2. Verify user isolation, notes, Study Studio sources, quiz attempts, and flashcard progress.
3. Verify application health and authentication.
4. Record the restore date, backup identifier, and validation result.

## Migration/version strategy

Schema changes use an explicit integer migration version stored in MongoDB's `_schema_migrations` collection.

Run migrations explicitly when validating a release or performing a controlled migration drill:

```bash
MONGODB_URI="..." npm run db:migrate
```

Production startup also runs the idempotent migration runner whenever `MONGODB_URI` is configured. A migration failure prevents the application from starting, so the service cannot run against an unverified schema.

Migration rules:
- Migrations are forward-only and idempotent.
- Never silently drop production data during application startup.
- Add a new migration version for every persisted-schema/index change.
- Test each migration against a disposable MongoDB instance before production.
- Take a backup before applying a production migration.
- Keep application code backward-compatible with the previous schema during rollout when possible.
- A migration that cannot complete must fail rather than partially pretending the target schema is ready.

Current migrations:
- **v1** establishes the production schema/index contract for flashcard progress.
- **v2** enforces case-insensitive unique user email and KL ID indexes after detecting legacy duplicates.

Both migrations are recorded in MongoDB's `_schema_migrations` collection and run idempotently at production startup.

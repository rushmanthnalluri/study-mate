# StudyMate production operations

## Backups

MongoDB is the production data store. Run backups from a trusted machine with the MongoDB Database Tools installed:

```bash
MONGODB_URI='***' npm run db:backup
```

The command creates a timestamped directory under `backups/` (or `MONGODB_BACKUP_DIR`). Never commit a backup directory or put the connection string in source control.

A backup is not considered usable until a restore has been tested against a disposable MongoDB database.

## Restore

Restore is intentionally blocked by default because it is destructive:

```bash
ALLOW_MONGORESTORE=true MONGODB_URI='***' npm run db:restore -- backups/<timestamp>
```

Verify the target database before enabling the destructive restore. Do not run restore against the production database during normal incident response without an explicit change/rollback decision.

## Database schema migrations

Migrations are versioned in `scripts/mongodb-migrate.mjs` and tracked in the `_schema_migrations` collection.

The current schema version is 1. Each migration is idempotent and should:

1. Make schema/index changes only.
2. Record its version and applied timestamp.
3. Never delete application data implicitly.
4. Be safe to re-run after a partial deployment.

CI runs the migration script against its disposable MongoDB service before the isolation suite.

For a production release, run:

```bash
MONGODB_URI='***' npm run db:migrate
```

before deploying application code that depends on a new schema version.

## Release verification

Required local/CI checks:

```bash
npm ci
npm test
npm run db:migrate
npm run test:integration
npm run build
```

The production service should also report a connected database through `GET /api/health`.

## Incident handling

On a database outage, production is fail-closed when `MONGODB_URI` is configured. The application must not silently switch to local JSON files.

For an authentication incident, revoke affected sessions and rotate secrets as appropriate. Never paste credentials, bearer tokens, MongoDB URIs, or AI API keys into issues or logs.


## Knowledge-base administration

The repository's seeded knowledge base is shipped with the application, but administrator-created/edited/deleted subjects are persisted as MongoDB overrides. Do not treat Render's application filesystem as durable application state; Render services use an ephemeral filesystem by default. citeturn0search0

A MongoDB backup therefore covers administrator knowledge-base changes along with accounts, notes, Study Studio sources, quiz attempts, and flashcard progress.

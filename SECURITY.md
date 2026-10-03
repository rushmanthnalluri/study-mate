# StudyMate Security

## Authentication
- Accounts are required; there is no guest production mode.
- Passwords are stored as scrypt hashes.
- Authentication uses opaque bearer tokens stored only as hashes server-side.
- Sessions expire and can be explicitly revoked through logout.
- Login and signup use generic invalid-credential responses to reduce account enumeration.

## Authorization
- User-owned notes, feedback and chat history are scoped to the authenticated account.
- Admin endpoints use a server-side role check.
- AI provider configuration is administrator-only.
- Client-supplied user IDs are never trusted for ownership.

## Secrets
- AI API keys are never returned to the frontend.
- Administrator-managed keys are encrypted at rest with AES-256-GCM.
- Never commit .env files, API keys, MongoDB credentials, or tokens.

## Data storage
- Production MongoDB is authoritative.
- If MONGODB_URI is configured but unavailable, the application fails closed rather than silently switching to file storage.
- File storage is intended only for local development.
- JSON fallback writes use atomic temporary-file replacement.

## API security
- Production CORS requires the configured origin.
- Security headers are enabled.
- Expensive authenticated endpoints are rate limited.
- Request bodies are bounded.
- Provider requests have timeouts.
- Production API errors do not expose stack traces or raw exception messages.

## Reporting
Report security issues privately to the repository owner rather than publishing credentials, tokens or exploit details in an issue.

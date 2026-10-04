# StudyMate — Client Submission Checklist

## Before sending
- [ ] Confirm the live URL opens.
- [ ] Confirm client credentials.
- [ ] Send credentials through a secure channel.
- [ ] Confirm GitHub repository access.
- [ ] Share the demo video.
- [ ] Share the final QA report.
- [ ] Share setup/operations documentation.
- [ ] Tell the client how to submit acceptance feedback.

## Client acceptance
- [ ] Authentication
- [ ] Dashboard
- [ ] Published subjects
- [ ] Note generation
- [ ] Flashcards
- [ ] Assessment practice
- [ ] Saved notes
- [ ] Study Studio
- [ ] Glossary
- [ ] Knowledge Base
- [ ] AI Tutor
- [ ] Study-source ingestion
- [ ] Administrator functions, if in scope
- [ ] Mobile/responsive navigation
- [ ] Logout/session behavior

## Never disclose in Git or public messages
- MongoDB connection strings
- AI provider API keys
- Administrator passwords
- JWT/session secrets
- Deployment tokens
- Other environment secrets

## Acceptance
> The client has reviewed the live application and delivered functionality and either accepts the release or provides a written list of requested changes.

## Post-handover
1. Preserve the accepted release/tag or commit reference.
2. Keep production secrets in the deployment secret store.
3. Track new feature requests as new change sets.
4. Retain the QA report with the project records.

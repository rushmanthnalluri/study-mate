# StudyMate AI — KL Exam Mode (v0.1)

> **"Study the way KL exams expect."**  
> An AI study companion grounded in KL University course materials, past semester papers, and exact examiner mark rubrics across all engineering departments.

---

## Administrator-published academic library

StudyMate does not ship a student-facing catalog of departments, subjects or exam schedules. The student experience reads its academic content from administrator-managed MongoDB subject records.

Each published subject can contain:
- subject metadata and units
- administrator-published resources
- question-bank entries
- assessment metadata where explicitly provided by the administrator

The repository `knowledge-base/` and seed script are development/operations assets only; they are not a production fallback for student content.

---

## Product surface

The current workspace includes:
- Home and published subject selection
- Topic-based note generation grounded in the selected subject
- Dashboard and revision planner
- Flashcards and assessment practice
- Saved notes and feedback
- Past-paper analysis
- Study Studio
- Glossary
- Knowledge Base resource viewer
- AI Tutor
- Administrator portal

LMS synchronization, attendance, marks scraping, hall-ticket workflows and LMS connection state are not part of the product.

---

## MongoDB & Render Deployment

StudyMate AI natively supports **Render** deployment with **MongoDB** (Atlas or Render Managed MongoDB):

1. **Environment Variables**:
   - `MONGODB_URI`: MongoDB connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/studymate?retryWrites=true&w=majority`).
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - AI provider configuration is managed centrally by an administrator and stored encrypted server-side.

2. **1-Click Render Deployment**:
   The repository includes a root [`render.yaml`](render.yaml) blueprint:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`

3. **Resilient Dual Storage Architecture**:
   If `MONGODB_URI` is present, StudyMate automatically stores users, notes, feedback, and chat messages in MongoDB via Mongoose. Local file storage is development-only; production MongoDB is authoritative and fails closed when unavailable.

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Build frontend
npm run build

# 3. Start StudyMate AI Server
npm start
```
Server runs on `http://localhost:3001` (or `$PORT`).


## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Seed knowledge base
node scripts/seedKnowledgeBase.js

# 3. Start development server
# Terminal 1: Backend API
npm start

# Terminal 2: Vite Frontend
npm run dev

# Or build production bundle
npm run build
```

---

## Production hardening

StudyMate enforces authenticated account access for personalized study data, administrator-only AI configuration, server-side session validation and revocation, production-origin CORS, security headers, bounded request bodies, rate limiting, AI provider timeouts, safe API error responses, and fail-closed MongoDB behavior when MONGODB_URI is configured.

### Study workspace

- AI-generated exam notes and authenticated saved notes
- Timed quiz and model-test engine with persisted assessment history
- Account-scoped flashcard mastery and review scheduling
- Notebook-style Studio with browser audio/voice, flowcharts and mind maps
- Private PDF, text, and Markdown study-source ingestion with server-side PDF extraction and source-grounded Q&A
- Authenticated profile and password rotation
- Server-backed flashcard mastery and review scheduling

### Operations

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for MongoDB backup, restore, migration, incident handling, and release verification procedures.

### Verification

Run:

    npm ci
    npm test
    npm run build

CI runs the security regression suite and production frontend build on pushes and pull requests to main.

See SECURITY.md for the security model and .env.example for required environment variables.

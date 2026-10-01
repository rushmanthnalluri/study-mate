# StudyMate AI — KL Exam Mode (v0.1)

> **"Study the way KL exams expect."**  
> An AI study companion grounded in KL University course materials, past semester papers, and exact examiner mark rubrics across all engineering departments.

---

## 🎯 Departments Supported

In accordance with KL University's engineering curriculum, StudyMate AI provides dedicated knowledge bases across:

1. **CSE (Computer Science & Engineering)**
   - Operating Systems (`21CS2104`)
   - Data Structures and Algorithms (`21CS1202`)
   - Database Management Systems (`21CS2205`)
2. **AI & DS (Artificial Intelligence & Data Science)**
   - Machine Learning (`21AD2201`)
   - Deep Learning and Neural Networks (`21AD3103`)
3. **ECE (Electronics & Communication Engineering)**
   - Digital Signal Processing (`21EC2208`)
   - VLSI Design (`21EC3109`)
4. **EEE (Electrical & Electronics Engineering)**
   - Power Systems (`21EE2207`)
   - Control Systems (`21EE2105`)
5. **Food Technology (Biotechnology & Food Engineering)**
   - Food Microbiology (`21BT2210`)
   - Dairy Technology (`21BT3112`)

---

## 🏛️ The KL Knowledge Base Architecture

The knowledge base is structured as a shared academic library (`knowledge-base/[Department]/[Subject]/`) with the exact 6 standard items per subject:

1. `course-materials.md` — Course units, Bloom's Taxonomy mapping, and textbook summaries.
2. `previous-papers.md` — KL semester papers (End-Sem May/Dec, In-Sem Midterms).
3. `question-bank.json` — High-frequency past questions categorized by marks and units.
4. `marks-pattern.md` — KL marks breakdown (2 Marks, 5 Marks, 10 Marks).
5. `answer-style.md` — What KL evaluators look for to award maximum marks.
6. `syllabus.json` — Subject metadata and course unit codes.

---

## 📱 The 6-Screen User Journey (Matching System Blueprint)

The web application is designed mobile-first and installable as a PWA:

- **Screen 01 — Home**: Recent subjects, department filters, and the single primary action.
- **Screen 02 — Select Subject**: Search and pick from the knowledge base by department.
- **Screen 03 — Enter Topic**: Topic or past exam question input with quick chips from previous papers.
- **Screen 04 — Generate Notes**:
  - 🔑 **Key Words**: Essential scoring vocabulary
  - 📌 **2 Marks Answer**: Crisp 20–40 words definition/formula
  - 📝 **5 Marks Answer**: Structured points & mini-flowchart (~150 words)
  - 📚 **10 Marks Answer**: Comprehensive KL exam essay format (350–500 words)
  - 📊 **Process / Diagram**: Rendered Mermaid.js flowcharts and system diagrams
- **Screen 07 — AI Academic Tutor Chatbot**: 24/7 interactive tutor answering kinetics doubts, formula derivations, and 2M/5M/10M tips.
- **Screen 08 — Interactive Quiz & Flashcards**: Rapid 2-mark recall cards and live multiple-choice quiz with immediate evaluator explanations and scoring.
- **Screen 09 — KL LMS Synchronization**: Direct gateway to `https://lms.kluniversity.in` tracking 85% attendance exam eligibility, In-Sem assignment deadlines, and enrolled course modules.
- **Screen 10 — Admin Portal & Resource Scaffold**: Department-wide curriculum management, subject provisioning, and grounded study material uploads.

---

## 🍃 MongoDB & Render Deployment

StudyMate AI natively supports **Render** deployment with **MongoDB** (Atlas or Render Managed MongoDB):

1. **Environment Variables**:
   - `MONGODB_URI`: MongoDB connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/studymate?retryWrites=true&w=majority`).
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render default)
   - `GROQ_API_KEY` (Optional): For high-speed online LLaMA 3.3 70B inference.
   - `GEMINI_API_KEY` (Optional): For Google Gemini 1.5 Flash inference.

2. **1-Click Render Deployment**:
   The repository includes a root [`render.yaml`](render.yaml) blueprint:
   - Build Command: `npm install && npm run build`
   - Start Command: `node server.js`

3. **Resilient Dual Storage Architecture**:
   If `MONGODB_URI` is present, StudyMate automatically stores users, notes, feedback, and chat messages in MongoDB via Mongoose. If running offline or without MongoDB, it gracefully falls back to local file-based storage.

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
npm run server

# Terminal 2: Vite Frontend
npm run dev

# Or build production bundle
npm run build
```

---

## 🎨 Visual Identity & Food Science Daily Alignment
Styled with the clean editorial typography of [Food Science Daily](https://foodsciencedaily.com/login?next=%2Fdashboard):
- **Typography**: Inter (UI), Barlow Condensed (eyebrows/badges), Source Serif 4 (scholarly headers), IBM Plex Mono (technical terms).
- **Colors**: Food Science Daily Maroon (`#831d32`), warm off-white surface (`#fbfaf8`), subtle borders, emerald and amber accents.


## Production hardening

StudyMate now enforces authenticated account access for personalized study data, administrator-only AI configuration, server-side session validation and revocation, production-origin CORS, security headers, bounded request bodies, rate limiting, AI provider timeouts, safe API error responses, and fail-closed MongoDB behavior when MONGODB_URI is configured.

### Study workspace

- AI-generated exam notes and authenticated saved notes
- Timed quiz and model-test engine with persisted assessment history
- Account-scoped flashcard mastery and review scheduling
- Notebook-style Studio with browser audio/voice, flowcharts and mind maps
- Private text/Markdown study-source upload and source-grounded Q&A
- Authenticated profile and password rotation

### Verification

Run:

    npm ci
    npm test
    npm run build

CI runs the security regression suite and production frontend build on pushes and pull requests to main.

See SECURITY.md for the security model and .env.example for required environment variables.

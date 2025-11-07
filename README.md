# ClassroomConnect — Frontend

A React + TypeScript app that helps teachers learn how their students learn best.  
Students join a live session (QR/link), take a short survey, and teachers see results and recommended activities in real time.

---

## ✨ Features

### Student

- **Join via QR/Link**: `/join/:token` (auto-detects token)
- **Guest Mode** with friendly name capture (no account needed)
- **Authenticated Student Mode** (JWT) with profile fetch
- **Interactive Survey** with progress and animated choices
- **Completion Screen** with learning style, mood, and a **Recommended Activity** (video/link embed support)

### Teacher

- **Login/Signup** (JWT stored in `localStorage`)
- **Dashboard & Course Detail** with **LearningStyle × Mood** activity recommendation matrix
- **Start Session** page: generates **Join Link + QR Code**
- **Live Results** page: auto-refreshes every 6 seconds and aggregates student submissions

### Engineering

- React 18 + TypeScript + Vite
- Tailwind CSS
- Robust API layer with:
  - Shared `VITE_API_BASE_URL`
  - Graceful JSON parsing + human-friendly errors
  - Student/Teacher token helpers
  - Public submit retry (falls back when `Authorization` is rejected)
- Local/session storage hygiene:
  - `teacher_token`, `student_token` (localStorage)
  - `session`, `guest_name`, `student_full_name` (sessionStorage)

---

## 🗺️ Routes

```text
/                              Home (Student/Teacher entry)
/login                         Unified login (used for teacher in this app)
/signup                        Unified signup (used for teacher in this app)

# Student public flow (handled by <App/>)
 /                             Home → (Welcome) → Survey
 /join                         Manual join page (enter token)
 /join/:token                  Auto-join by token (QR/link)
 (Welcome)                     Student name capture
 (Survey)                      Mood + questions → submit → activity

# Teacher (protected by token)
 /teacher/dashboard            Teacher dashboard
 /teacher/courses/:id          Course detail + recommendation matrix
 /teacher/courses/:id/session  Start session (join link + QR)
 /teacher/sessions/:id/results Live results (auto-refresh)
Guard: RequireTeacher redirects to /login if teacher_token is missing.

🧱 Project Structure
text
Copy code
src/
├─ App.tsx                     # Controls student public flow (Home → Welcome → Survey)
├─ main.tsx                    # Router and all <Route> definitions
├─ auth.ts                     # Token helpers (getStudentToken / getTeacherToken)
├─ components/
│  ├─ ProgressBar.tsx
│  └─ (…)
├─ constants/
│  └─ surveyData.ts            # Fallback survey questions/options (when backend not present)
├─ pages/
│  ├─ Home.tsx
│  ├─ Welcome.tsx
│  ├─ JoinSessionPage.tsx
│  ├─ SurveyPage.tsx
│  ├─ StudentHome.tsx
│  ├─ TeacherDashboard.tsx
│  ├─ TeacherCourseDetail.tsx
│  ├─ StartSessionPage.tsx
│  └─ SessionResultsPage.tsx
├─ services/
│  ├─ api.ts                   # publicApi + authApi (students/teachers)
│  └─ teacherApi.ts            # teacher-only endpoints (courses, sessions, activities, surveys)
└─ index.css                   # Tailwind entry
⚙️ Environment
Create .env in the project root:

env
Copy code
VITE_API_BASE_URL=http://localhost:8000
Defaults to http://localhost:8000 if unset.

Ensure the backend CORS allows http://localhost:5173.

🚀 Getting Started
bash
Copy code
# 1) Clone
git clone https://github.com/YOUR-USERNAME/classroomconnect-frontend.git
cd classroomconnect-frontend

# 2) Install deps
npm install

# 3) Run dev server
npm run dev
Open http://localhost:5173.

🔌 Backend (expected)
This frontend expects the CS5500 backend (FastAPI) with endpoints like:

Public

GET /api/public/join/{join_token}

POST /api/public/join/{join_token}/submit

Students

POST /api/students/login

GET /api/students/me

GET /api/students/submissions

Teachers (JWT)

POST /api/teachers/login

GET /api/courses/:id

GET /api/activities

PATCH /api/courses/:id/recommendations

POST /api/sessions/{course_id}/sessions

GET /api/sessions/{session_id}/submissions

Seed data typically includes an open session and test teacher/student accounts.
Confirm at http://localhost:8000/docs.

🧪 End-to-End Testing (Manual)
A) Teacher flow
Visit /login and sign in with a seeded teacher (e.g., teacher1@example.com / Passw0rd!).

Go to a course: /teacher/courses/:id

Click “🚀 Start Session” → /teacher/courses/:id/session

Press “▶ Start Session” to generate join link + QR.

Click “📊 View Results” (will be empty until students submit).

The app stores last started session in sessionStorage.active_session so you can return to results.

B) Student flow (Guest)
On another tab/device, open the Join Link from the teacher page or scan the QR.

You’ll land on /join/:token and continue to Welcome to enter a name.

Complete the Survey → see Recommended Activity.

Teacher Live Results page should now show the submission within ~6 seconds.

C) Student flow (Authenticated)
Call POST /api/students/login (or build a simple student login page).

Ensure student_token is present in localStorage.

Join via /join/:token; submit survey → counts as authenticated submission.

🔐 Storage Keys
localStorage.teacher_token — JWT for teacher area

localStorage.student_token — JWT for student

sessionStorage.session — server session blob after joining

sessionStorage.guest_name — temporary guest name

sessionStorage.student_full_name — fetched once for greeting

sessionStorage.active_session — last started teacher session (to persist across pages)

🧰 NPM Scripts
bash
Copy code
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview the production build
npm run lint       # ESLint
npm run type-check # TypeScript diagnostics
🩺 Troubleshooting
I go straight to /join after restarting dev server.
Clear sessionStorage.session and reload. Or visit / directly.

Teacher “View Results” is empty after student submission.

Confirm student submitted to the same join_token.

Keep the results page open (it auto-refreshes every 6s).

Ensure backend shows the submission under /api/sessions/{id}/submissions.

CORS / 401 on public submit with Authorization header.
publicApi.submitSurvey will retry without Authorization if the first attempt fails with 401 or a CORS network error.

Session disappeared after logout / refresh.
Teacher session UI persists a started session in sessionStorage.active_session. If you log out, re-start a session or rehydrate from your backend (optional enhancement).

🧭 Roadmap
Student login UI (currently API-only)

Teacher dashboard list view & filters

Persist “active session” server-side and list open sessions

Better activity previews (thumbnails)

Unit tests & E2E tests

👥 Team
Frontend: Kole, Dayu

Backend: Michael, Tommy

📄 License
CS5500 Final Project — Fall 2025
Made with ❤️ by the ClassroomConnect Team
```

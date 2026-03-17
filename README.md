# ClassroomConnect 🎓

**Full-Stack Educational Platform for Elementary Students with Learning Needs**

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://www.docker.com)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://classroomconnect-frontend-tovf.onrender.com)

Youtube demo
> [![ClassroomConnect Demo](https://img.youtube.com/vi/ZhG1Rrx031I/maxresdefault.jpg)](https://www.youtube.com/watch?v=ZhG1Rrx031I)

> **Note**: This project was developed as part of a team-based course at Northeastern University.
> **My role**: Frontend Lead — responsible for architecting and implementing the complete
> React/TypeScript frontend (15,000+ lines, 80+ components). Backend API developed by teammate Michael.

---

## Overview

ClassroomConnect is an educational web application designed to help elementary school teachers better serve students with diverse learning needs. The platform enables teachers to create courses, run sessions, and deliver personalized activity recommendations based on student mood and learning style — powered by AI.

---

## Live Demo

🌐 **[https://classroomconnect-frontend-tovf.onrender.com](https://classroomconnect-frontend-tovf.onrender.com)**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher1@example.com | Passw0rd! |
| Student | student1@example.com | Passw0rd! |
| Student | student2@example.com | Passw0rd! |

---

## Features

### Teacher Portal
- Create and manage courses with custom learning style categories
- Design interactive surveys to assess student learning preferences
- Generate QR codes and join links for instant session access
- Configure activity recommendations based on mood and learning style
- Real-time session monitoring dashboard

### Student Interface
- Quick session join via QR code or unique link
- Express emotional state through intuitive mood selector
- Complete learning style assessments
- Receive personalized activity recommendations

### Guest Experience
- Participate without account creation
- Submit mood and survey responses
- Access recommended activities

---

## Tech Stack

### Frontend (My Work)
| Technology | Purpose |
|------------|---------|
| React 19 + TypeScript | UI framework with type safety |
| Chakra UI | Accessible component library |
| React Router v6 | Client-side routing |
| Axios | HTTP client with interceptors |
| Vite | Build tool and dev server |

### Backend (Teammate's Work)
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance Python web framework |
| PostgreSQL | Relational database |
| SQLAlchemy | ORM and SQL toolkit |
| JWT | Secure authentication |
| Docker | Containerization |

---

## Architecture
```
┌─────────────────────┐         ┌──────────────────────┐
│   React Frontend    │────────▶│   FastAPI Backend    │
│   (Port 5173)       │◀────────│   (Port 8000)        │
│                     │   REST  │                      │
│  - Teacher Portal   │   API   │  - Auth & Sessions   │
│  - Student Dashboard│         │  - Recommendations   │
│  - QR Join System   │         │  - AI Integration    │
└─────────────────────┘         └──────────────────────┘
                                          │
                                          ▼
                                ┌──────────────────────┐
                                │   PostgreSQL DB      │
                                │   (Port 5432)        │
                                └──────────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- WSL2 (Windows users)

### Backend Setup
```bash
# Clone backend repository
git clone https://github.com/Michael-Alz/cs5500-final-backend.git
cd cs5500-final-backend

# Configure environment
cp .env.example.docker .env.dev.docker
```

Edit `.env.dev.docker` and set:
```ini
APP_MODULE=app.main:app
CORS_ORIGINS=["http://localhost:5173"]
```
```bash
# Start backend services
docker compose -f docker-compose.dev.yml up --build
```

Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### Frontend Setup
```bash
# Clone this repository
git clone https://github.com/agavakole/classroomconnect-frontend.git
cd classroomconnect-frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Project Structure
```
src/
├── api/                 # API integration layer
│   ├── client.ts        # Axios configuration
│   ├── auth.ts          # Authentication
│   ├── teachers.ts      # Teacher endpoints
│   └── students.ts      # Student endpoints
├── components/
│   ├── layout/          # App structure
│   ├── routing/         # Protected routes
│   └── ui/              # Shared components
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── pages/
│   ├── auth/            # Login/signup
│   ├── teacher/         # Teacher dashboard
│   ├── student/         # Student interface
│   └── guest/           # Guest join flow
└── theme/               # Chakra UI customization
```

---

## My Contributions

As Frontend Lead, I architected and built the complete React/TypeScript frontend:

**Core Infrastructure**
- Project setup with Vite + React 19 + TypeScript
- React Router v6 with protected routes and role-based access control
- React Context API for auth and global state
- Axios client with interceptors and centralized error handling
- Custom Chakra UI theme with responsive design

**Teacher Portal** — 15+ pages including course management, session monitoring, activity builder, survey designer, QR code generator, and analytics dashboard

**Student Interface** — 8+ pages including session join, mood selector, learning style assessment, and activity recommendations

**80+ Reusable Components** — layout, forms, data display, navigation, and feedback components

---

## Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

---

## Deployment

The frontend is deployed on **Render** as a static site, auto-deploying from the `main` branch on every push.

Set this environment variable in your Render service:
```
VITE_API_BASE_URL=your-backend-url
```

---

## Collaboration

| Contributor | Role |
|-------------|------|
| Kole Agava | Frontend Lead — complete React/TypeScript application |
| Michael | Backend — FastAPI server, database, AI integration |

---

## License

Developed as part of CS5500 Software Engineering at Northeastern University.

---

## Contact

**Kole Agava** — Northeastern University, MS Computer Science

[![GitHub](https://img.shields.io/badge/GitHub-agavakole-black?logo=github)](https://github.com/agavakole)
[![Email](https://img.shields.io/badge/Email-agavakole@gmail.com-red?logo=gmail)](mailto:agavakole@gmail.com)

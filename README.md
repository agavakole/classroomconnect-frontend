# ClassroomConnect 🎓

**Full-Stack Educational Platform for Elementary Students with Learning Needs**

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green?logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Containerized-blue?logo=docker)](https://www.docker.com)

> **Note**: This project was developed as part of a team-based course at Northeastern University. 
> **My role**: Frontend Lead - I was responsible for architecting and implementing the complete 
> React/TypeScript frontend (15,000+ lines, 80+ components). The backend API was developed by my teammate.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Full Application](#running-the-full-application)
- [Test Credentials](#test-credentials)
- [My Contributions](#my-contributions)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)

---

## 🎯 Overview

ClassroomConnect is an educational web application designed to help elementary school teachers better serve students with diverse learning needs. The platform enables:

- 🎓 **Teachers** to create courses, manage sessions, and track student engagement
- 👨‍🎓 **Students** to join sessions, express their mood, and receive personalized learning recommendations
- 🎭 **Guests** to participate anonymously without creating an account
- 🤖 **AI-Powered** recommendations based on learning styles and emotional states

---

## ✨ Features

### Teacher Portal
- ✅ Create and manage courses with custom learning style categories
- ✅ Design interactive surveys to assess student learning preferences
- ✅ Generate QR codes and join links for instant session access
- ✅ Configure activity recommendations based on mood + learning style
- ✅ Track student progress and engagement over time
- ✅ Real-time session monitoring dashboard

### Student Interface
- ✅ Quick session join via QR code or unique link
- ✅ Express emotional state through intuitive mood selector
- ✅ Complete learning style assessments
- ✅ Receive personalized activity recommendations
- ✅ View personal dashboard with activity history

### Guest Experience
- ✅ Participate without account creation
- ✅ Submit mood and survey responses
- ✅ Access recommended activities
- ✅ Simple name-based identification

---

## 🛠️ Tech Stack

### Frontend (My Work)
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Chakra UI** - Component library for accessible design
- **React Router v6** - Client-side routing
- **Axios** - HTTP client for API integration
- **Vite** - Fast build tool and dev server

### Backend (Teammate's Work)
- **FastAPI** - High-performance Python web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **JWT** - Secure authentication
- **Docker** - Containerization for easy deployment

---

## 🏗️ Architecture

### System Architecture

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
                                │                      │
                                │  - User Data         │
                                │  - Courses/Sessions  │
                                │  - Activity Catalog  │
                                └──────────────────────┘
```

### Frontend Architecture

```
src/
├── pages/              # Route components
│   ├── auth/          # Login/signup pages
│   ├── teacher/       # Teacher dashboard & management
│   └── student/       # Student interface
├── components/         # Reusable UI components
│   ├── layout/        # App structure (nav, layout)
│   ├── routing/       # Protected routes
│   └── ui/            # Shared components
├── api/               # API integration layer
│   ├── client.ts      # Axios configuration
│   └── [services]/    # API endpoint modules
├── contexts/          # React Context providers
└── theme/             # Chakra UI customization
```

---

## 🚀 Getting Started

### Prerequisites

#### For Windows Users (Recommended):
1. **WSL2 (Windows Subsystem for Linux)** - [Installation Guide](https://learn.microsoft.com/en-us/windows/wsl/install)
   ```powershell
   # Run in PowerShell as Administrator
   wsl --install
   ```

2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
   - Make sure "Use WSL 2 based engine" is enabled

3. **Node.js 18+** - Install in WSL2:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

#### For Mac/Linux Users:
- Docker Desktop or Docker Engine
- Node.js 18+
- Git

---

## 🔧 Backend Setup

### Step 1: Clone the Backend Repository

```bash
# In WSL2 terminal (Ubuntu) or Mac/Linux terminal
cd ~
git clone https://github.com/Michael-Alz/cs5500-final-backend.git
cd cs5500-final-backend
```

### Step 2: Configure Environment

```bash
# Copy environment configuration
cp .env.example.docker .env.dev.docker

# Edit environment file
nano .env.dev.docker
```

**Required Changes** in `.env.dev.docker`:

1. **Add this line** (required for Swagger UI to work):
   ```ini
   APP_MODULE=app.main:app
   ```

2. **Update CORS settings** to include your frontend URL:
   ```bash
   CORS_ORIGINS=["http://localhost:5173"]
   ```

**Example `.env.dev.docker`:**
```bash
APP_NAME=5500 Backend
APP_ENV=dev
APP_MODULE=app.main:app                                    # ← Add this line!
PORT=8000
DATABASE_URL=postgresql+psycopg://class_connect_user:class_connect_password@database:5432/class_connect_db
JWT_SECRET=change_me_in_dev
JWT_EXPIRE_HOURS=24
CORS_ORIGINS=["http://localhost:5173"]                     # ← Update this
PUBLIC_APP_URL=http://localhost:5173
HOST_PORT=8000
LOG_LEVEL=debug
MAINTENANCE_ADMIN_PASSWORD=changeme
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`)

### Step 3: Run Setup

```bash
# Install dependencies and set up development environment
make setup
```

### Step 4: Start Backend Services

```bash
# Clean any existing containers and start fresh
docker compose -f docker-compose.dev.yml down -v

# Build and start all services (database + backend)
docker compose -f docker-compose.dev.yml up --build
```

**Alternative (if `make dev` works for you):**
```bash
make dev
```

This will:
- ✅ Start PostgreSQL database (port 5432)
- ✅ Run database migrations
- ✅ Seed test data (teacher and student accounts)
- ✅ Start FastAPI backend (port 8000)

### Step 5: Verify Backend is Running

Wait for the services to start (you'll see logs indicating "Application startup complete").

```bash
# In a new terminal, check health endpoint
curl http://localhost:8000/health
# Should return: {"status":"ok"}
```

**View API Documentation (Swagger UI):**

Open your browser and visit: **http://localhost:8000/docs**

You should see the FastAPI interactive documentation with all endpoints! 🎉

If you see a blank page or errors:
- ✅ Check that you added `APP_MODULE=app.main:app` to `.env.dev.docker`
- ✅ Rebuild: `docker compose -f docker-compose.dev.yml down -v && docker compose -f docker-compose.dev.yml up --build`

### Step 6: Seed Test Data

If using `make dev`, test data is seeded automatically. Otherwise:

```bash
# In a new terminal
docker compose -f docker-compose.dev.yml exec backend python scripts/seed.py
```

This creates:
- ✅ Teacher account: `teacher1@example.com` / `Passw0rd!`
- ✅ Student accounts with sample data
- ✅ Sample course, activities, and sessions

### Useful Backend Commands

```bash
# View backend logs
make docker-logs
# OR
docker compose -f docker-compose.dev.yml logs -f backend

# Stop all services
make docker-down
# OR
docker compose -f docker-compose.dev.yml down

# Restart backend only
docker compose -f docker-compose.dev.yml restart backend

# Reset database (clean + reseed)
make db-clean
make db-seed

# Rebuild everything from scratch
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build
```

### Backend Troubleshooting

#### ❌ Problem: Swagger UI (http://localhost:8000/docs) Shows Blank Page

**Solution:**
```bash
# 1. Edit .env.dev.docker and add this line:
nano .env.dev.docker
# Add: APP_MODULE=app.main:app

# 2. Rebuild containers
docker compose -f docker-compose.dev.yml down -v
docker compose -f docker-compose.dev.yml up --build

# 3. Wait for "Application startup complete" in logs
# 4. Visit http://localhost:8000/docs again
```

#### ❌ Problem: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Make sure Docker Desktop is running (WSL2 backend enabled)
# OR start Docker service:
sudo systemctl start docker
```

#### ❌ Problem: Port 8000 Already in Use

**Solution:**
```bash
# Find and kill process using port 8000
sudo lsof -ti:8000 | xargs kill -9

# Or change port in .env.dev.docker:
# HOST_PORT=8001
```

#### ❌ Problem: Database Connection Failed

**Solution:**
```bash
# Make sure database container is running
docker ps | grep database

# Restart database
docker compose -f docker-compose.dev.yml restart database

# Wait 30 seconds, then restart backend
docker compose -f docker-compose.dev.yml restart backend
```

#### ❌ Problem: Frontend Can't Connect to Backend (CORS Error)

**Solution:**
```bash
# Edit .env.dev.docker
nano .env.dev.docker

# Make sure this line includes your frontend URL:
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Restart backend
docker compose -f docker-compose.dev.yml restart backend
```

---

## 💻 Frontend Setup

### Step 1: Clone Frontend Repository

```bash
# In WSL2 terminal or separate directory
cd ~
git clone https://github.com/agavakole/classroomconnect-frontend.git
cd classroomconnect-frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Create environment file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
```

### Step 4: Start Development Server

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🎮 Running the Full Application

### Terminal 1 - Backend (WSL2/Ubuntu):
```bash
cd ~/cs5500-final-backend
make dev
# Wait for "Application startup complete"
```

### Terminal 2 - Frontend (WSL2/Ubuntu or Windows):
```bash
cd ~/classroomconnect-frontend
npm run dev
# Open http://localhost:5173
```

### Quick Health Check:
1. ✅ Backend: http://localhost:8000/docs (Swagger UI)
2. ✅ Frontend: http://localhost:5173 (Landing page)
3. ✅ Try logging in with test credentials below

---

## 🔐 Test Credentials

After running `make dev`, these accounts are available:

### Teacher Account
```
Email:    teacher1@example.com
Password: Passw0rd!
Name:     Dr. Riley Smith
```

### Student Accounts
```
Email:    student1@example.com
Password: Passw0rd!
Name:     Alex Johnson

Email:    student2@example.com
Password: Passw0rd!
Name:     Maya Chen
```

### What Gets Seeded:
- ✅ 1 Course: "CS101 – Intro Class"
- ✅ Learning style categories: Active, Structured, Passive learner
- ✅ Mood labels: Happy, Sad, Tired, Energetic, Confused, Curious
- ✅ Sample activities mapped to learning styles
- ✅ 2 class sessions (one with survey, one mood-only)

---

## 👨‍💻 My Contributions (Frontend Lead)

As the Frontend Lead, I was responsible for architecting and implementing the React/TypeScript frontend:

### Core Architecture & Infrastructure
- ✅ **Project Setup**: Vite + React 19 + TypeScript configuration
- ✅ **Routing System**: React Router v6 with protected routes and role-based access
- ✅ **State Management**: React Context API for auth and app state
- ✅ **API Integration**: Complete Axios client with interceptors and error handling
- ✅ **Theme System**: Custom Chakra UI theme with responsive design patterns

### Teacher Portal (15+ Pages)
- ✅ **Course Management**: Create, edit, and configure courses
- ✅ **Session Dashboard**: Real-time monitoring of active sessions
- ✅ **Activity Builder**: Drag-and-drop activity creation interface
- ✅ **Survey Designer**: Custom learning style assessment builder
- ✅ **Recommendation Engine**: Configure mood + learning style → activity mappings
- ✅ **Analytics Dashboard**: Student progress tracking and visualization
- ✅ **QR Code Generator**: Instant session join code creation

### Student Interface (8+ Pages)
- ✅ **Dashboard**: Personalized activity feed and progress tracker
- ✅ **Session Join**: QR code scanner and link-based join
- ✅ **Mood Selector**: Interactive emotional state input
- ✅ **Survey Interface**: Multi-step learning style assessment
- ✅ **Activity View**: Responsive activity display and submission

### Authentication System
- ✅ **Teacher Login/Signup**: Secure JWT-based authentication
- ✅ **Student Login/Signup**: Separate student authentication flow
- ✅ **Guest Join**: Anonymous session participation
- ✅ **Protected Routes**: Role-based access control

### UI Components (80+ Components)
- ✅ **Layout Components**: AppLayout, TeacherLayout with responsive navigation
- ✅ **Form Components**: Custom input, select, textarea with validation
- ✅ **Data Display**: Cards, tables, lists with sorting and filtering
- ✅ **Navigation**: Breadcrumbs, sidebar, mobile menu
- ✅ **Feedback**: Toast notifications, loading states, error boundaries

### Key Technical Decisions
- ✅ **Component Architecture**: Composition over inheritance
- ✅ **Custom Hooks**: Reusable logic for auth, API calls, forms
- ✅ **Error Handling**: Centralized error management with user-friendly messages
- ✅ **Responsive Design**: Mobile-first approach with Chakra UI breakpoints
- ✅ **Performance**: Code splitting, lazy loading, optimized re-renders


**Backend Credit**: All backend API development, database design, and server infrastructure was implemented by my teammate Michael.

---

## 📁 Project Structure

```
classroomconnect-frontend/
├── public/
│   └── images/              # Static assets
├── src/
│   ├── api/                 # API integration layer
│   │   ├── client.ts        # Axios configuration
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── teachers.ts      # Teacher API calls
│   │   ├── students.ts      # Student API calls
│   │   ├── sessions.ts      # Session management
│   │   ├── activities.ts    # Activity CRUD
│   │   ├── courses.ts       # Course management
│   │   └── surveys.ts       # Survey endpoints
│   ├── components/
│   │   ├── layout/          # App structure
│   │   │   ├── AppLayout.tsx
│   │   │   └── TeacherLayout.tsx
│   │   ├── routing/         # Protected routes
│   │   │   └── RequireAuth.tsx
│   │   └── ui/              # Shared components
│   ├── contexts/            # React Context
│   │   └── AuthContext.tsx  # Authentication state
│   ├── pages/               # Route components
│   │   ├── auth/            # Login/signup
│   │   ├── teacher/         # Teacher dashboard
│   │   ├── student/         # Student interface
│   │   └── guest/           # Guest join flow
│   ├── theme/               # Chakra UI theme
│   │   └── index.ts
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite configuration
```

---

## 📜 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
make dev             # Start full dev environment
make docker-logs     # View backend logs
make docker-down     # Stop all services
make db-seed         # Seed database with test data
make db-clean        # Clean database
make test            # Run tests
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add VITE_API_BASE_URL production
# Value: your-backend-url
```

### Backend Deployment
See backend repository for deployment instructions.

---

## 🔗 Links

- Live Demo: https://classroomconnect-frontend-tovf.onrender.com
[![ClassroomConnect Demo](https://img.youtube.com/vi/ZhG1Rrx031I/maxresdefault.jpg)]



---

## 🤝 Collaboration

This project demonstrates effective team collaboration:
- **Frontend Development** (Kole Agava): Complete React/TypeScript application
- **Backend Development** (Michael): FastAPI server, database, and AI integration
- **Integration**: Collaborative API design and seamless frontend-backend communication

---

## 📝 License

This project was developed as part of coursework at Northeastern University.

---

## 🙏 Acknowledgments

- **Northeastern University** - CS5500 Software Engineering course
- **Teaching Staff** - For project guidance and support
- **Team Members** - For collaborative development experience

---

## 📧 Contact

**Kole Agava**  
Northeastern University - Computer Science Graduate Student  
- GitHub: [@agavakole](https://github.com/agavakole)
- Email: agava.k@northeastern.edu

---

**Built with ❤️ for elementary students with diverse learning needs**

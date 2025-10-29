# ClassroomConnect Frontend

Frontend application for ClassroomConnect - A learning style assessment tool that helps teachers understand how their students learn best and provides personalized activity recommendations.

## 🎯 Overview

ClassroomConnect allows teachers to create quick learning style surveys for their students. Students take an 8-question survey (via QR code or manual entry), and the system uses AI to generate personalized learning activities based on their learning style profile.

## ✨ Features

### (Current) - Guest Survey Flow
- **🏠 Home Page** - Welcome screen with login/signup/guest options
- **👋 Welcome Page** - Student name collection
- **📋 Interactive Survey** - 8-question learning style assessment with 4 answer options per question
- **🎉 Results Display** - Learning style breakdown with AI-generated activities
- **📱 QR Code Integration** - Automatic session joining via QR code scanning
- **💾 API Integration** - Backend connection for session fetching and survey submission
- **🎨 Responsive Design** - Works on mobile, tablet, and desktop
- **⚡ Guest Mode** - Quick surveys without account creation


## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling and animations
- **React Hooks** - State management (useState, useEffect)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (tested with v22.19.0 ✅)
- npm 10+ (tested with v10.9.3 ✅)

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/classroomconnect-frontend.git
cd classroomconnect-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app!

### Testing the App

#### Test Normal Flow (Without Backend):
```bash
# Open in browser
http://localhost:5173/

# Click "Continue as Guest"
# Enter a name
# Complete the survey
# See completion screen
```

#### Test QR Code Flow:
```bash
# Open in browser with a join token
http://localhost:5173/join/TEST123

# App will attempt to connect to backend
# If backend is offline, you'll see error message
# This is expected! Backend integration coming in Week 2
```

## 📁 Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── AnswerButton.tsx       # Survey answer option button
│   ├── ProgressBar.tsx        # Survey progress indicator
│   └── QuestionCard.tsx       # Survey question display
│
├── pages/             # Full page components
│   ├── Home.tsx              # Landing page with auth options
│   ├── Welcome.tsx           # Student name entry page
│   ├── SurveyPage.tsx        # 8-question survey
│   └── (more coming in Week 2)
│
├── services/          # API integration
│   └── api.ts                # Backend API calls
│
├── constants/         # Static data
│   └── surveyData.ts         # Survey questions and options
│
├── types/             # TypeScript definitions
│   └── index.ts              # All type definitions
│
├── App.tsx            # Main app with routing logic
└── main.tsx           # App entry point
```

## 🔌 Backend Integration

This frontend connects to the ClassroomConnect backend API.

**Backend Repository:** [Link to Michael's backend repo]

**API Endpoints Used:**
- `GET /join/{token}` - Fetch session by join token
- `GET /sessions/{id}/survey` - Fetch survey questions
- `POST /sessions/{id}/submit` - Submit survey answers

**API Base URL:** 
- Development: `http://localhost:8000`
- Production: TBD

## 🎨 Design Decisions

### Guest Mode
Guest mode allows students (especially young children) to take surveys without creating accounts. This reduces friction and ensures high completion rates in classroom settings.

**Guest Flow:**
1. Student scans QR code (or enters join code)
2. Student enters their name
3. Student completes survey
4. Results submitted to teacher
5. Optional: Create account to save results permanently

### QR Code Integration
Teachers display QR codes in the classroom. Students scan with their phones to instantly join the survey session. The join token is embedded in the URL and automatically detected by the app.

### Answer Options
Each question has 4 answer options representing different levels of agreement:
- "Yes! All the time!" (Strong yes)
- "Yes, sometimes!" (Moderate yes)
- "Not sure!" (Neutral)
- "Not really!" (Disagree)

## 📱 Responsive Design

The app is fully responsive and optimized for:
- **Mobile** (320px+) - Touch-friendly, single column
- **Tablet** (640px+) - Larger touch targets, optimized spacing
- **Desktop** (1024px+) - Centered layouts, optimal reading width

## 🧪 Available Scripts
```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized production bundle
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🚧 Current Status

### ✅ Completed
- [x] Project setup and configuration
- [x] Home page with guest/login/signup options
- [x] Welcome page for name collection
- [x] Survey page with 8 questions and 4 answer options per question(not connected to backend currently)
- [x] Progress tracking and navigation (Previous button, question counter)
- [x] Completion screen
- [x] QR code URL detection and auto-join
- [x] API service layer (getSession, getSurvey, submitSurvey)
- [x] Guest survey submission
- [x] Error handling and loading states
- [x] Responsive design for all screen sizes
- [x] TypeScript types and interfaces

### 🔄 In Progress
- [ ] Authentication system (Login/Signup)
- [ ] Teacher dashboard
- [ ] Student portal
- [ ] Results display with learning styles
- [ ] AI-generated activities display
- [ ] Manual join code entry

## 👥 Team

**Frontend Developers:**
- Kole - Lead Developer
- Dayu - Developer

**Backend Developers:**
- Michael - Lead Backend Developer
- Tommy - Backend Developer

## 📚 Learning Resources

### Key Concepts Used in Week 1:
- **React Hooks** - useState for state management, useEffect for side effects
- **TypeScript** - Interface definitions, type safety
- **Async/Await** - API calls and promise handling
- **Component Architecture** - Reusable, modular components
- **Responsive Design** - Mobile-first approach with Tailwind
- **URL Routing** - Detection and parameter extraction

## 🐛 Known Issues

- [ ] Guest results are not displayed after survey completion (Week 2 feature)
- [ ] No manual join code entry yet (Week 2 feature)

## 📄 License

CS5500 Final Project - Fall 2025

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📞 Contact

For questions or issues, please contact the development team or create an issue in the repository.

---

**Made with ❤️ by the ClassroomConnect Team**

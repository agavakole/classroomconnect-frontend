// src/App.tsx
import { useState, useEffect } from "react";
import "./index.css";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup"; // ← ADD THIS IMPORT!
import { Welcome } from "./pages/Welcome";
import { Survey } from "./pages/SurveyPage";
import { publicApi } from "./services/api";

type Screen = "home" | "welcome" | "survey" | "loading" | "login" | "signup"; // ← ADD "signup"

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("loading");
  const [studentName, setStudentName] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"student" | "teacher" | null>(null);

  // ========================================
  // EXISTING: Handle QR Code Join
  // ========================================
  const handleJoinSession = async (joinToken: string) => {
    try {
      console.log("🔍 Fetching session for token:", joinToken);

      // Step 1: Get session info from backend
      const session = await publicApi.getSession(joinToken);
      console.log("✅ Session data received:", session);

      // Step 2: Get survey questions from backend
      const survey = await publicApi.getSurvey(session.sessionId);
      console.log("✅ Survey data received:", survey);

      // Step 3: Combine session + survey data
      const completeData = {
        ...session,
        survey: survey,
      };

      // Step 4: Save to state
      setSessionData(completeData);

      // Step 5: Go to welcome page (skip home!)
      setCurrentScreen("welcome");

      console.log("🎉 Successfully joined session!");
    } catch (error) {
      console.error("❌ Error joining session:", error);
      alert("Invalid join code! Please check and try again.");

      // Go to home page on error
      setCurrentScreen("home");
    }
  };

  // ========================================
  // Handle Login
  // ========================================
  const handleLogin = (type: "student" | "teacher") => {
    console.log("✅ User logged in as:", type);

    setIsAuthenticated(true);
    setUserType(type);

    if (type === "teacher") {
      alert("Welcome Teacher! 👨‍🏫 Dashboard coming in Session 3!");
    } else {
      alert("Welcome Student! 🎓 Dashboard coming in Session 4!");
    }

    setCurrentScreen("home");
  };

  // ========================================
  // NEW: Handle Signup
  // ========================================
  const handleSignup = (type: "student" | "teacher") => {
    console.log("✅ User signed up as:", type);

    setIsAuthenticated(true);
    setUserType(type);

    if (type === "teacher") {
      alert(
        "Account created! Welcome Teacher! 👨‍🏫 Dashboard coming in Session 3!"
      );
    } else {
      alert(
        "Account created! Welcome Student! 🎓 Dashboard coming in Session 4!"
      );
    }

    setCurrentScreen("home");
  };

  // ========================================
  // Check URL on Load
  // ========================================
  useEffect(() => {
    console.log("🚀 App loading...");

    const path = window.location.pathname;
    console.log("📍 Current path:", path);

    if (path.startsWith("/join/")) {
      console.log("🎯 QR code detected!");

      const joinToken = path.split("/").pop();
      console.log("🔑 Join token:", joinToken);

      if (joinToken) {
        handleJoinSession(joinToken);
      }
    } else {
      console.log("🏠 Normal homepage load");
      setCurrentScreen("home");
    }
  }, []);

  // ========================================
  // Navigation Functions
  // ========================================
  const handleGoToWelcome = () => setCurrentScreen("welcome");

  const handleStartSurvey = (name: string) => {
    setStudentName(name);
    setCurrentScreen("survey");
  };

  // ========================================
  // RENDER SCREENS
  // ========================================

  // Loading Screen
  if (currentScreen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-gray-700">Loading...</p>
          <p className="text-gray-500 mt-2">Checking your link...</p>
        </div>
      </div>
    );
  }

  // Home Screen
  if (currentScreen === "home") {
    return (
      <Home
        onStudent={handleGoToWelcome}
        onLogin={() => setCurrentScreen("login")}
        onSignup={() => setCurrentScreen("signup")} // ← CHANGED!
      />
    );
  }

  // Login Screen
  if (currentScreen === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onBackToHome={() => setCurrentScreen("home")}
      />
    );
  }

  // ← NEW SCREEN!
  // Signup Screen
  if (currentScreen === "signup") {
    return (
      <Signup
        onSignup={handleSignup}
        onBackToHome={() => setCurrentScreen("home")}
      />
    );
  }

  // Welcome Screen
  if (currentScreen === "welcome") {
    return <Welcome onStart={handleStartSurvey} />;
  }

  // Survey Screen
  if (currentScreen === "survey") {
    return <Survey studentName={studentName} sessionData={sessionData} />;
  }

  return null;
}

export default App;

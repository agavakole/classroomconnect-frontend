// src/App.tsx
import { useState, useEffect } from "react"; // ← ADD useEffect!
import "./index.css";
import { Home } from "./pages/Home";
import { Welcome } from "./pages/Welcome";
import { Survey } from "./pages/SurveyPage";
import { publicApi } from "./services/api";

type Screen = "home" | "welcome" | "survey" | "loading"; // ← ADD "loading"

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("loading"); // ← START with "loading"
  const [studentName, setStudentName] = useState("");
  const [sessionData, setSessionData] = useState<any>(null); // ← NEW! Store session data

  // ========================================
  // NEW FUNCTION: Handle QR Code Join
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
  // NEW useEffect: Check URL on Load
  // ========================================
  useEffect(() => {
    console.log("🚀 App loading...");

    // Step 1: Get current URL path
    const path = window.location.pathname;
    console.log("📍 Current path:", path);

    // Step 2: Check if it's a QR code link
    if (path.startsWith("/join/")) {
      console.log("🎯 QR code detected!");

      // Step 3: Extract join token from URL
      const joinToken = path.split("/").pop();
      console.log("🔑 Join token:", joinToken);

      // Step 4: Join session automatically
      if (joinToken) {
        handleJoinSession(joinToken);
      }
    } else {
      // Normal home page - no QR code
      console.log("🏠 Normal homepage load");
      setCurrentScreen("home");
    }
  }, []); // ← Empty array = run once on load

  // ========================================
  // EXISTING FUNCTIONS (Keep these!)
  // ========================================

  // Home -> Welcome
  const handleGoToWelcome = () => setCurrentScreen("welcome");

  // Welcome -> Survey
  const handleStartSurvey = (name: string) => {
    setStudentName(name);
    setCurrentScreen("survey");
  };

  // ========================================
  // NEW SCREEN: Loading
  // ========================================
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

  // ========================================
  // EXISTING SCREENS (Keep these!)
  // ========================================

  if (currentScreen === "home") {
    return <Home onStudent={handleGoToWelcome} />;
  }

  if (currentScreen === "welcome") {
    return <Welcome onStart={handleStartSurvey} />;
  }

  if (currentScreen === "survey") {
    return <Survey studentName={studentName} sessionData={sessionData} />; // ← Pass sessionData!
  }

  return null;
}

export default App;

// src/App.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import { Welcome } from "./pages/Welcome";
import { Survey as SurveyScreen } from "./pages/SurveyPage";

// Four possible UI states for the main app flow
type Screen = "home" | "welcome" | "survey" | "loading";

export default function App() {
  const location = useLocation(); // Current URL and query params
  const navigate = useNavigate(); // Programmatic navigation

  // Controls which screen is displayed (home, welcome, survey, or loading)
  const [currentScreen, setCurrentScreen] = useState<Screen>("loading");
  
  // Stores the student's display name (from login or guest input)
  const [studentName, setStudentName] = useState("");
  
  // Stores session data fetched from backend via /api/public/join/{token}
  // Contains: joinToken, session (with session_id, survey, mood_check_schema, etc.)
  const [sessionData, setSessionData] = useState<any>(null);

  /**
   * Retrieves cached session data from sessionStorage
   * This data was stored after successful join token resolution
   * Contains backend response from /api/public/join/{joinToken}
   */
  const loadSessionFromStorage = () => {
    try {
      const raw = sessionStorage.getItem("session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null; // Invalid JSON or missing data
    }
  };

  /**
   * On mount: determines initial screen based on:
   * 1. Whether user came from /join page (via ?from=join query param)
   * 2. Whether valid session data exists in sessionStorage
   * 3. Whether student is authenticated (has token in localStorage)
   * 
   * Flow:
   * - If coming from /join WITH session → show Welcome (guest) or Survey (logged-in)
   * - If session exists but not from /join → resume at Welcome or Survey
   * - Otherwise → show Home landing page
   */
  useEffect(() => {
    // Check if redirected from JoinSession page after successful token resolution
    const hasFromJoin =
      new URLSearchParams(location.search).get("from") === "join";
    
    // Load any cached session from previous join attempt
    const sess = loadSessionFromStorage();
    
    // Check if student is logged in (has auth token from backend login)
    const isStudent = Boolean(localStorage.getItem("student_token"));

    // Validate session has all required fields from backend response
    const validSession = !!(
      sess &&
      sess.joinToken &&
      sess.session &&
      sess.session.session_id
    );

    // User just joined and has valid session → route appropriately
    if (hasFromJoin && validSession) {
      setSessionData(sess);
      // Logged-in students skip Welcome, go straight to Survey
      setCurrentScreen(isStudent ? "survey" : "welcome");
      navigate("/", { replace: true }); // Clean URL
      return;
    }

    // User has valid session from earlier → resume where they left off
    if (validSession) {
      setSessionData(sess);
      setCurrentScreen(isStudent ? "survey" : "welcome");
      return;
    }

    // No valid session → show landing page
    setCurrentScreen("home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Ensures valid session data exists before rendering Welcome/Survey
   * If no session found, redirects to /join page
   * This prevents students from accessing survey without joining first
   * 
   * Backend connection: checks for cached response from /api/public/join/{token}
   */
  const ensureSessionOrKick = () => {
    const s = sessionData ?? loadSessionFromStorage();
    const valid = !!(s && s.joinToken && s.session && s.session.session_id);
    if (!valid) {
      navigate("/join", { replace: true }); // Redirect to join page
      return null;
    }
    if (!sessionData) setSessionData(s); // Update state if needed
    return s;
  };

  // Loading screen: shown briefly while checking authentication/session state
  if (currentScreen === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-2xl font-bold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Home screen: landing page for new visitors (no active session)
  if (currentScreen === "home") return <Home />;

  // Welcome screen: shown to GUEST users (not logged in) to collect their name
  // After entering name, they proceed to Survey screen
  if (currentScreen === "welcome") {
    const sess = ensureSessionOrKick(); // Validate session or redirect
    if (!sess) return null;
    return (
      <Welcome
        onStart={(name) => {
          setStudentName(name);
          sessionStorage.setItem("guest_name", name.trim()); // Cache for submission
          setCurrentScreen("survey"); // Advance to survey
        }}
      />
    );
  }

  // Survey screen: shows mood picker + optional survey questions
  // Submits to backend via /api/public/join/{joinToken}/submit
  if (currentScreen === "survey") {
    const sess = ensureSessionOrKick(); // Validate session or redirect
    if (!sess) return null;

    // Determine display name: logged-in students use profile name, guests use input
    const nameForGreeting = localStorage.getItem("student_token")
      ? sessionStorage.getItem("student_full_name") || studentName
      : studentName;

    return (
      <SurveyScreen 
        studentName={nameForGreeting || ""} 
        sessionData={sess} // Contains session details from backend
      />
    );
  }

  return null;
}
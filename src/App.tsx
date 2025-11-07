import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// (do NOT import "./index.css" here; it's in main.tsx)

import Home from "./pages/Home";
import { Welcome } from "./pages/Welcome";
import { Survey as SurveyScreen } from "./pages/SurveyPage";

type Screen = "home" | "welcome" | "survey" | "loading";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentScreen, setCurrentScreen] = useState<Screen>("loading");
  const [studentName, setStudentName] = useState("");
  const [sessionData, setSessionData] = useState<any>(null);

  const loadSessionFromStorage = () => {
    try {
      const raw = sessionStorage.getItem("session");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const hasFromJoin =
      new URLSearchParams(location.search).get("from") === "join";
    const sess = loadSessionFromStorage();
    const isStudent = Boolean(localStorage.getItem("student_token"));

    const validSession = !!(
      sess &&
      sess.joinToken &&
      sess.session &&
      sess.session.session_id
    );

    if (hasFromJoin && validSession) {
      setSessionData(sess);
      setCurrentScreen(isStudent ? "survey" : "welcome");
      navigate("/", { replace: true });
      return;
    }

    if (validSession) {
      setSessionData(sess);
      setCurrentScreen(isStudent ? "survey" : "welcome");
      return;
    }

    setCurrentScreen("home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureSessionOrKick = () => {
    const s = sessionData ?? loadSessionFromStorage();
    const valid = !!(s && s.joinToken && s.session && s.session.session_id);
    if (!valid) {
      navigate("/join", { replace: true });
      return null;
    }
    if (!sessionData) setSessionData(s);
    return s;
  };

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

  if (currentScreen === "home") return <Home />;

  if (currentScreen === "welcome") {
    const sess = ensureSessionOrKick();
    if (!sess) return null;
    return (
      <Welcome
        onStart={(name) => {
          setStudentName(name);
          sessionStorage.setItem("guest_name", name.trim());
          setCurrentScreen("survey");
        }}
      />
    );
  }

  if (currentScreen === "survey") {
    const sess = ensureSessionOrKick();
    if (!sess) return null;

    const nameForGreeting = localStorage.getItem("student_token")
      ? sessionStorage.getItem("student_full_name") || studentName
      : studentName;

    return (
      <SurveyScreen studentName={nameForGreeting || ""} sessionData={sess} />
    );
  }

  return null;
}

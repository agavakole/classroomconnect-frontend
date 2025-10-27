// src/App.tsx
import { useState } from "react";
import "./index.css";
import { Home } from "./pages/Home";
import { Welcome } from "./pages/Welcome";
import { Survey } from "./pages/SurveyPage";

type Screen = "home" | "welcome" | "survey";

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [studentName, setStudentName] = useState("");

  // Home -> Welcome
  const handleGoToWelcome = () => setCurrentScreen("welcome");

  // Welcome -> Survey
  const handleStartSurvey = (name: string) => {
    setStudentName(name);
    setCurrentScreen("survey");
  };

  if (currentScreen === "home") {
    return <Home onStudent={handleGoToWelcome} />;
  }

  if (currentScreen === "welcome") {
    return <Welcome onStart={handleStartSurvey} />;
  }

  if (currentScreen === "survey") {
    return <Survey studentName={studentName} />;
  }

  return null;
}

export default App;

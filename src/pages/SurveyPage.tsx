// src/pages/SurveyPage.tsx
import { useEffect, useState, type ReactElement } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { SURVEY_QUESTIONS, ANSWER_OPTIONS } from "../constants/surveyData";
import type { AnswerOption, Question, BackendQuestion } from "../types";
import { publicApi, authApi } from "../services/api";
import { getStudentToken } from "../services/api";

/**
 * Mood assets for visual mood picker
 * Maps mood names to images and colors
 * Uses local images from /public/images/
 */
/* ---------- Mood assets (visual only) ---------- */
const MOOD_ASSETS: Record<
  string,
  { label: string; img: string; color: string }
> = {
  curious: { label: "Curious", img: "/images/curious.png", color: "#22D3EE" },
  energized: {
    label: "Energized",
    img: "/images/energetic.png",
    color: "#10B981",
  },
  happy: { label: "Happy", img: "/images/happy-img.png", color: "#F59E0B" },
  calm: { label: "Calm", img: "/images/calm-img.png", color: "#8B5CF6" },
  tired: { label: "Tired", img: "/images/tired.png", color: "#6366F1" },
  nervous: {
    label: "Nervous",
    img: "/images/nervous-img.png",
    color: "#EF4444",
  },
};
const GRADIENTS = [
  { from: "#FFB457", to: "#FF8A00" },
  { from: "#9B8CFF", to: "#6A5BFF" },
  { from: "#6EE7B7", to: "#34D399" },
  { from: "#22D3EE", to: "#0EA5E9" },
  { from: "#F472B6", to: "#EC4899" },
  { from: "#FCD34D", to: "#F59E0B" },
];
const toKey = (s: string) => s.trim().toLowerCase();

// Shared CSS classes for consistent styling
const panel = "bg-white ring-1 ring-gray-200 rounded-3xl shadow-sm";
const primaryBtn =
  "px-5 py-3 rounded-2xl bg-gradient-to-r from-[#00C6FF] to-[#0072FF] text-white font-semibold shadow-[0_10px_20px_rgba(38,132,255,0.35)] hover:shadow-[0_14px_28px_rgba(38,132,255,0.45)] transition";
const subtleBtn =
  "px-5 py-3 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#0072FF] font-semibold transition";

/**
 * Mood choice button component
 * Displays mood image with selection state
 */
function MoodChoice({
  value,
  selected,
  onClick,
}: {
  value: string;
  selected: boolean;
  onClick: (v: string) => void;
}) {
  const key = toKey(value);
  const asset = MOOD_ASSETS[key] ?? { label: value, img: "", color: "#3B82F6" };
  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={() => onClick(value)}
        aria-pressed={selected}
        className={[
          "relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36",
          "rounded-2xl overflow-hidden transition-all",
          "bg-white shadow-md hover:shadow-xl hover:scale-105 active:scale-95",
          selected ? "ring-4 scale-105" : "border-2 border-gray-200",
        ].join(" ")}
        style={{
          borderColor: selected ? asset.color : undefined,
          boxShadow: selected ? `0 0 0 4px ${asset.color}40` : undefined,
        }}
      >
        {asset.img ? (
          <img
            src={asset.img}
            alt={`${asset.label} mood`}
            className="w-full h-full object-cover"
            onError={(e) =>
              ((e.currentTarget as HTMLImageElement).style.display = "none")
            }
          />
        ) : null}
      </button>
      <div
        className="mt-2 text-sm font-bold"
        style={{ color: selected ? asset.color : "#374151" }}
      >
        {asset.label}
      </div>
    </div>
  );
}

/**
 * Answer option tile component
 * Styled with gradient backgrounds cycling through GRADIENTS array
 */
function AnswerTile({
  text,
  emoji,
  index,
  selected,
  onClick,
}: {
  text: string;
  emoji?: string;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  const g = GRADIENTS[index % GRADIENTS.length];
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative w-full rounded-[22px] p-4 sm:p-5 text-left",
        "text-white transition-all",
        "hover:scale-[1.015]",
        "border-2 border-white/50",
        selected ? "ring-4 scale-[1.02]" : "ring-0",
      ].join(" ")}
      style={{
        background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
        boxShadow: selected
          ? `0 0 0 4px ${g.to}80, 0 12px 26px rgba(0,0,0,0.12)`
          : "0 8px 20px rgba(0,0,0,0.10)",
      }}
      aria-pressed={selected}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-12 h-12 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center text-2xl">
          {emoji ?? "✨"}
        </div>
        <div className="font-semibold text-base sm:text-lg leading-snug drop-shadow">
          {text}
        </div>
      </div>
    </button>
  );
}

/**
 * Component props
 */
interface SurveyProps {
  studentName: string; // Display name for greeting
  sessionData?: {
    joinToken: string;
    session: {
      session_id: string;
      require_survey: boolean; // Whether survey is required
      mood_check_schema?: { prompt: string; options: string[] }; // Mood configuration
      survey?: {
        survey_id: string;
        title: string;
        questions: BackendQuestion[]; // Dynamic questions from backend
      };
      status: string;
    };
  };
}

/**
 * Renders video player for video activities
 * Converts YouTube URLs to embed format
 */
function renderVideo(url: string, title: string) {
  const embed = url
    .replace("watch?v=", "embed/")
    .replace("youtu.be/", "youtube.com/embed/");
  return (
    <div className="mt-4">
      <p className="font-medium text-gray-700 mb-2">🎬 Watch this:</p>
      <div
        className="relative w-full rounded-lg overflow-hidden shadow-lg"
        style={{ paddingBottom: "56.25%" }} // 16:9 aspect ratio
      >
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={embed}
          title={title || "Recommended video"}
          frameBorder={0}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

/**
 * Renders activity details based on activity type
 * Handles: video, in-class-task, breathing-exercise, worksheet, article
 * 
 * Each activity type has different content_json structure:
 * - video: { url, duration?, notes? }
 * - task/exercise: { steps[], materials[]?, duration?, notes? }
 * - worksheet/article: { file_url, duration?, notes? }
 */
function renderActivityDetails(a: any) {
  if (!a) return null;

  const cj = a?.content_json ?? {};
  const type = String(a?.type || "").toLowerCase();

  // Extract steps from various possible field names
  const steps: string[] = Array.isArray(cj.script_steps)
    ? cj.script_steps
    : Array.isArray(cj.steps)
    ? cj.steps
    : Array.isArray(cj.instructions)
    ? cj.instructions
    : [];

  // Extract materials list
  const materials: string[] = Array.isArray(cj.materials_needed)
    ? cj.materials_needed
    : Array.isArray(cj.materials)
    ? cj.materials
    : [];

  // Extract duration (in seconds)
  const durationSec: number | undefined =
    typeof cj.duration_sec === "number"
      ? cj.duration_sec
      : typeof cj.duration === "number"
      ? cj.duration
      : undefined;

  // Extract teacher notes
  const teacherNotes: string | undefined =
    cj.notes_for_teacher ?? cj.teacher_notes ?? cj.notes;

  // Extract URL (for videos and files)
  const videoUrl: string | undefined =
    cj.url || cj.video_url || a?.link || a?.url || cj.file_url;

  return (
    <>
      {/* Activity title and description */}
      <h3 className="text-xl font-bold text-green-700 mb-2">{a.name}</h3>
      <p className="text-gray-700 mb-4">{a.summary}</p>
      
      {/* Activity type badge */}
      <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-2">
        {a.type}
      </div>
      
      {/* Duration display */}
      {durationSec ? (
        <div className="text-sm text-gray-600 mb-2">⏱ {durationSec} sec</div>
      ) : null}

      {/* TASK/EXERCISE: Display steps and materials */}
      {(type === "in-class-task" || type === "breathing-exercise") && (
        <div className="mt-3 space-y-3">
          {steps.length > 0 && (
            <>
              <p className="font-medium text-gray-700">Steps</p>
              <ol className="list-decimal pl-6 space-y-1 text-gray-800">
                {steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </>
          )}
          {materials.length > 0 && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Materials:</span>{" "}
              {materials.join(", ")}
            </p>
          )}
          {teacherNotes && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes:</span> {teacherNotes}
            </p>
          )}
        </div>
      )}

      {/* VIDEO: Embed YouTube player */}
      {type === "video" && videoUrl ? renderVideo(String(videoUrl), a.name) : null}

      {/* WORKSHEET/ARTICLE: Download link */}
      {(type === "worksheet" || type === "article") &&
        (cj.file_url || a?.url) && (
          <div className="mt-4">
            <a
              href={cj.file_url || a?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              📄 Open file
            </a>
          </div>
        )}
    </>
  );
}

/**
 * Main Survey Component
 * 
 * Flow:
 * 1. Student selects mood (if configured)
 * 2. Student answers survey questions (if require_survey = true)
 * 3. On completion, submit to backend
 * 4. Backend calculates learning_style from answers
 * 5. Backend returns recommended activity
 * 6. Show completion screen with activity
 * 
 * Backend connections:
 * - POST /api/public/join/{joinToken}/submit - Submit mood + answers
 * - Returns: { mood, learning_style, recommended_activity }
 */
export function Survey({
  studentName,
  sessionData,
}: SurveyProps): ReactElement {
  const token = getStudentToken(); // JWT token if student is logged in
  const [nameForGreeting, setNameForGreeting] = useState(studentName || "");

  /**
   * Fetch student profile if logged in but no name provided
   * Gets full_name from backend to use in greeting
   */
  useEffect(() => {
    if (token && !nameForGreeting) {
      (async () => {
        try {
          const p = await authApi.getStudentProfile(token);
          setNameForGreeting(p.full_name || "");
          sessionStorage.setItem("student_full_name", p.full_name || "");
        } catch {
          /* ignore - will use guest name or blank */
        }
      })();
    }
  }, [token, nameForGreeting]);

  // Survey state
  const [currentQuestion, setCurrentQuestion] = useState(0); // Current question index
  const [answers, setAnswers] = useState<Record<number, number>>({}); // question_index -> option_index
  const [isComplete, setIsComplete] = useState(false); // Whether survey is done
  const [mood, setMood] = useState(""); // Selected mood
  const [result, setResult] = useState<any>(null); // Backend response after submission

  // Respect teacher's survey setting
  const shouldAskSurvey = sessionData?.session?.require_survey ?? true;

  // Use backend questions if provided, otherwise fall back to hardcoded defaults
  const backendQuestions = sessionData?.session?.survey?.questions;
  const questions: (Question | BackendQuestion)[] = shouldAskSurvey
    ? (backendQuestions ?? SURVEY_QUESTIONS)
    : [];
  const hasAnyQuestions = questions.length > 0;

  const currentQ = hasAnyQuestions ? questions[currentQuestion] : undefined;
  const isBackendQuestion = currentQ ? "question_id" in currentQ : false;
  const questionText = (currentQ as any)?.text ?? "";

  // Mood picker configuration from session
  const moodPrompt =
    sessionData?.session?.mood_check_schema?.prompt ?? "How are you feeling today?";
  const moodOptions = sessionData?.session?.mood_check_schema?.options ?? [];
  const answeredCount = Object.keys(answers).length;

  /**
   * Converts frontend answer format to backend format
   * Frontend: { 0: 2, 1: 1 } (question index -> option index)
   * Backend: { "q1": "q1_opt_2", "q2": "q2_opt_1" } (question_id -> option_id)
   */
  function toBackendAnswers(
    backendQs: BackendQuestion[] | undefined,
    newAnswers: Record<number, number>
  ): Record<string, string> {
    const out: Record<string, string> = {};
    if (backendQs && backendQs.length) {
      // Backend questions with IDs
      backendQs.forEach((q, idx) => {
        const choiceIdx = newAnswers[idx];
        if (choiceIdx !== undefined && q.options[choiceIdx]) {
          out[String(q.question_id)] = String(q.options[choiceIdx].option_id);
        }
      });
    } else {
      // Hardcoded questions - use indices as IDs
      SURVEY_QUESTIONS.forEach((q, idx) => {
        const choiceIdx = newAnswers[idx];
        if (choiceIdx !== undefined) out[String(q.id)] = String(choiceIdx);
      });
    }
    return out;
  }

  /**
   * Submits survey to backend
   * Backend: POST /api/public/join/{joinToken}/submit
   * 
   * Payload:
   * - mood: Selected mood string
   * - answers: Question/option ID mappings
   * - is_guest: Whether student is guest (no auth token)
   * - student_name: Display name (required for guests)
   * 
   * Backend processes:
   * 1. Calculates learning_style from answer scores
   * 2. Looks up recommended activity based on (learning_style + mood)
   * 3. Returns: { mood, learning_style, recommended_activity }
   */
  async function submitNow(newAnswers: Record<number, number> = {}) {
    try {
      if (sessionData?.joinToken) {
        const answersMap = toBackendAnswers(backendQuestions, newAnswers);

        // Validate that answers exist if survey is required
        if (shouldAskSurvey && !Object.keys(answersMap).length) {
          alert("Please answer the questions before submitting.");
          return;
        }

        // Determine mood to send (default to "Neutral" if no options)
        const moodToSend =
          (sessionData?.session?.mood_check_schema?.options?.length ?? 0) > 0
            ? mood || "Neutral"
            : mood || "Neutral";

        // Get display name from various sources
        const displayName = (
          nameForGreeting ||
          studentName ||
          sessionStorage.getItem("student_full_name") ||
          sessionStorage.getItem("guest_name") ||
          ""
        ).trim();

        let submissionResult: any;

        if (token) {
          // Logged-in student submission
          try {
            submissionResult = await publicApi.submitSurvey(
              sessionData.joinToken,
              {
                mood: moodToSend,
                answers: answersMap,
                is_guest: false,
                ...(displayName ? { student_name: displayName } : {}),
              },
              token // Include auth token
            );
          } catch (e: any) {
            // If backend rejects auth, retry as guest
            const msg = String(e?.message || "");
            if (e?.status === 400 && msg.toUpperCase().includes("GUEST_NAME_REQUIRED")) {
              submissionResult = await publicApi.submitSurvey(sessionData.joinToken, {
                mood: moodToSend,
                answers: answersMap,
                is_guest: true,
                student_name: displayName || "Student",
              });
            } else {
              throw e;
            }
          }
        } else {
          // Guest submission (no auth token)
          if (!displayName) {
            alert("Please enter your name before submitting.");
            return;
          }
          submissionResult = await publicApi.submitSurvey(sessionData.joinToken, {
            mood: moodToSend,
            answers: answersMap,
            is_guest: true,
            student_name: displayName,
          });
        }

        setResult(submissionResult);
      } else {
        // No session data - just store mood locally
        setResult({ mood: mood || "neutral" });
      }

      setIsComplete(true); // Show completion screen
    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert("Oops! We couldn't save your answers. Please try again!");
    }
  }

  /**
   * Handles answer selection for current question
   * If last question, submits survey
   * Otherwise, advances to next question
   */
  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      // More questions remain
      setCurrentQuestion((q) => q + 1);
      return;
    }
    
    // Last question - submit survey
    await submitNow(newAnswers);
  };

  /**
   * Goes back to previous question
   */
  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  /**
   * COMPLETION SCREEN
   * Shown after successful survey submission
   * Displays:
   * - Student's learning style
   * - Selected mood
   * - Recommended activity (if backend returned one)
   */
  if (isComplete) {
    const hasActivity = result?.recommended_activity?.activity;

    const mascotSrc = "/images/happy-img.png";

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[position:center_105%] lg:bg-[position:center_100%] xl:bg-[position:center_60%]"
        style={{
          backgroundImage: "url('/images/3d-image.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className={`${panel} max-w-4xl w-full p-16 sm:p-10`}>
          {/* Success header with mascot */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
            <div className="mb-6 h-28 w-28 md:h-32 md:w-32 rounded-3xl ring-1 ring-gray-100 bg-white flex items-center justify-center">
              <img
                src={mascotSrc}
                alt="Happy"
                className="w-24 h-24 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/images/energetic.png";
                }}
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Amazing job, {nameForGreeting || "friend"}!
              </h1>
              <p className="text-gray-700 mt-1">You finished the survey, high five!</p>
              
              {/* Result badges: learning style + mood */}
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                  Learning Style: {result?.learning_style ?? "—"}
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                  Mood: {result?.mood ?? mood ?? "neutral"}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended activity section */}
          {hasActivity && (
            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Recommended Activity</h2>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                {renderActivityDetails(result.recommended_activity.activity)}
              </div>
            </div>
          )}

          {/* Backend message (if any) */}
          {result?.message && (
            <div className="text-center text-gray-600 text-sm">{result.message}</div>
          )}
        </div>
        
        {/* Back button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="/student/home" className={subtleBtn}>
            ← Back
          </a>
        </div>
      </div>
    );
  }

  /**
   * SURVEY SCREEN
   * Shows mood picker and/or questions based on configuration
   */
  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative"
      style={{
        backgroundImage: "url('/images/3d-image.png')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom center",
        backgroundSize: "cover",
      }}
    >
      <div className="relative z-10 mx-auto w-full px-4 sm:px-5 md:px-6 lg:px-8 py-6 md:py-10 max-w-[900px]">
        {/* Header with greeting and question counter */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-bold text-cyan-500">
              Hi {nameForGreeting}!
            </h2>
            <p className="text-gray-600">Let&apos;s learn about how you learn best!</p>
          </div>

          {/* Question counter - only shown if questions exist */}
          {hasAnyQuestions && (
            <div
              className="text-white px-4 py-2 rounded-full text-sm font-medium shadow-md sm:text-base sm:px-5"
              style={{
                background: "linear-gradient(135deg,#6EE7B7 0%,#0AC5FF 100%)",
              }}
            >
              Question {Math.min(currentQuestion + 1, questions.length)} of {questions.length}
            </div>
          )}
        </div>

        {/* MOOD PICKER - shown if teacher configured moods */}
        {moodOptions.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <div className="font-bold text-lg sm:text-xl mb-6 text-gray-800">
                {moodPrompt}
              </div>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                {moodOptions.map((opt) => {
                  const key = toKey(opt);
                  return (
                    <MoodChoice
                      key={key}
                      value={opt}
                      selected={toKey(mood) === key}
                      onClick={(v) => setMood(v)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* NO QUESTIONS MODE - mood-only submission */}
        {!hasAnyQuestions ? (
          <div className={`${panel} p-6 sm:p-8 md:p-10`}>
            <p className="text-gray-700 text-center mb-4">
              Thanks! If your teacher didn't require a survey today, you can continue after
              selecting your mood.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => submitNow({})}
                className={primaryBtn}
                disabled={
                  (sessionData?.session?.mood_check_schema?.options?.length ?? 0) > 0 && !mood
                }
                title={
                  ((sessionData?.session?.mood_check_schema?.options?.length ?? 0) > 0 && !mood)
                    ? "Pick a mood to continue"
                    : undefined
                }
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          // FULL SURVEY MODE - questions with multiple choice answers
          <div className="w-full bg-white rounded-3xl md:rounded-[32px] shadow-[4px_8px_28px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10">
            <p className="text-2xl text-gray-700 mb-8 text-center">
              There are NO wrong answers! Just pick what feels right for you!
            </p>

            {/* Current question display */}
            <div className="mb-6 text-center">
              <img
                src={"/images/confuse.png"}
                alt="Question"
                className="mx-auto w-14 h-14 sm:w-16 sm:h-16 object-contain"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).style.display = "none")
                }
              />
              <h3 className="mt-3 text-xl sm:text-2xl font-bold text-gray-800">
                {questionText}
              </h3>
            </div>

            {/* Answer options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-8">
              {(isBackendQuestion
                ? (currentQ as BackendQuestion).options.map((op, idx) => ({
                    text: op.text,
                    emoji: ["🎨", "🔊", "✋", "🧠"][idx % 4],
                    idx,
                  }))
                : (ANSWER_OPTIONS as AnswerOption[]).map((op, idx) => ({
                    text: op.text,
                    emoji: op.emoji,
                    idx,
                  }))
              ).map((o) => (
                <AnswerTile
                  key={o.idx}
                  text={o.text}
                  emoji={o.emoji}
                  index={o.idx}
                  selected={answers[currentQuestion] === o.idx}
                  onClick={() => handleAnswer(o.idx)}
                />
              ))}
            </div>

            {/* Progress bar */}
            <div className="mt-3 mb-5">
              <ProgressBar current={answeredCount} total={questions.length} />
            </div>

            {/* Navigation footer */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Previous button */}
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={[
                    "w-full sm:w-auto",
                    "px-4 py-3 rounded-xl text-sm sm:text-base font-medium",
                    "transition-colors duration-150",
                    currentQuestion === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm",
                  ].join(" ")}
                >
                  ← Previous
                </button>

                {/* Progress message */}
                <div className="text-center text-gray-600 text-sm sm:text-base font-medium">
                  {answeredCount === 0
                    ? "Let's start! 🌟"
                    : answeredCount === questions.length
                    ? "All done! 🎉"
                    : `${answeredCount} done! Keep going! ⭐`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Survey;
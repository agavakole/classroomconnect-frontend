// src/pages/SurveyPage.tsx
import { useState, useEffect } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { SURVEY_QUESTIONS, ANSWER_OPTIONS } from "../constants/surveyData";
import type { AnswerOption, Question, BackendQuestion } from "../types";
import { publicApi, authApi } from "../services/api";
import { getStudentToken } from "../auth";
import type { ReactElement } from "react";

/* ---------------- Mood assets ---------------- */
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
const CONFUSE_IMG = "/images/confuse.png";
const GRADIENTS = [
  { from: "#FFB457", to: "#FF8A00" },
  { from: "#9B8CFF", to: "#6A5BFF" },
  { from: "#6EE7B7", to: "#34D399" },
  { from: "#22D3EE", to: "#0EA5E9" },
  { from: "#F472B6", to: "#EC4899" },
  { from: "#FCD34D", to: "#F59E0B" },
];
const MOOD_CANON: Record<string, string> = {
  curious: "Curious",
  energized: "Energized",
  tired: "Tired",
  happy: "Happy",
  calm: "Calm",
  nervous: "Nervous",
  neutral: "Neutral",
};
const toKey = (s: string) => s.trim().toLowerCase();

/* ---------------- UI bits ---------------- */
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
          "rounded-2xl overflow-hidden transition-all duration-200",
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
        "text-white shadow-[0_8px_20px_rgba(0,0,0,0.10)]",
        "transition-all duration-200 ease-out",
        "hover:scale-[1.015] hover:shadow-[0_12px_26px_rgba(0,0,0,0.12)]",
        "border-2 border-white/50",
        selected ? "ring-4 scale-[1.02]" : "ring-0",
      ].join(" ")}
      style={{
        background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
        boxShadow: selected
          ? `0 0 0 4px ${g.to}80, 0 12px 26px rgba(0,0,0,0.12)`
          : undefined,
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

/* ---------------- Types & page ---------------- */
interface SurveyProps {
  studentName: string;
  sessionData?: {
    joinToken: string;
    session: {
      session_id: string;
      require_survey: boolean;
      mood_check_schema?: { prompt: string; options: string[] };
      survey?: {
        survey_id: string;
        title: string;
        questions: BackendQuestion[];
      };
      status: string;
    };
  };
}

export function Survey({
  studentName,
  sessionData,
}: SurveyProps): ReactElement {
  const token = getStudentToken();
  const [nameForGreeting, setNameForGreeting] = useState(studentName || "");

  useEffect(() => {
    if (token && !nameForGreeting) {
      (async () => {
        try {
          const p = await authApi.getStudentProfile(token);
          setNameForGreeting(p.full_name || "");
          sessionStorage.setItem("student_full_name", p.full_name || "");
        } catch {
          /* ignore profile errors */
        }
      })();
    }
  }, [token, nameForGreeting]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [mood, setMood] = useState("");
  const [result, setResult] = useState<any>(null);

  const backendQuestions = sessionData?.session?.survey?.questions;
  const questions: (Question | BackendQuestion)[] =
    backendQuestions ?? SURVEY_QUESTIONS;
  const currentQ = questions[currentQuestion];
  const isBackendQuestion = "question_id" in currentQ;
  const questionText = (currentQ as any).text;

  const moodPrompt =
    sessionData?.session?.mood_check_schema?.prompt ??
    "How are you feeling today?";
  const moodOptions = sessionData?.session?.mood_check_schema?.options ?? [];
  const answeredCount = Object.keys(answers).length;

  function toBackendAnswers(
    backendQs: BackendQuestion[] | undefined,
    newAnswers: Record<number, number>
  ): Record<string, string> {
    const out: Record<string, string> = {};
    if (backendQs && backendQs.length) {
      backendQs.forEach((q, idx) => {
        const choiceIdx = newAnswers[idx];
        if (choiceIdx !== undefined && q.options[choiceIdx]) {
          out[String(q.question_id)] = String(q.options[choiceIdx].option_id);
        }
      });
    } else {
      SURVEY_QUESTIONS.forEach((q, idx) => {
        const choiceIdx = newAnswers[idx];
        if (choiceIdx !== undefined) out[String(q.id)] = String(choiceIdx);
      });
    }
    return out;
  }

  const handleAnswer = async (optionIndex: number) => {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1);
      return;
    }

    try {
      if (sessionData?.joinToken) {
        const answersMap = toBackendAnswers(backendQuestions, newAnswers);

        if (
          sessionData?.session?.require_survey &&
          !Object.keys(answersMap).length
        ) {
          alert("Please answer the questions before submitting.");
          return;
        }

   
        // If the session provided a schema, we must send the original label (stored in `mood`).
        // If there's no schema, map our UI key to a title-cased canonical value.
        const moodToSend =
          (sessionData?.session?.mood_check_schema?.options?.length ?? 0) > 0
            ? mood || "Neutral" // raw label from schema
            : MOOD_CANON[toKey(mood)] || "Neutral";
        // Always provide a name – works for both logged-in and guest paths
        const displayName = (
          nameForGreeting ||
          studentName ||
          sessionStorage.getItem("student_full_name") ||
          sessionStorage.getItem("guest_name") ||
          ""
        ).trim();

        let submissionResult: any;

        // try as logged-in (still uses the public endpoint, but with is_guest:false)
        if (token) {
          try {
            submissionResult = await publicApi.submitSurvey(
              sessionData.joinToken,
              {
                mood: moodToSend,
                answers: answersMap,
                is_guest: false,
                ...(displayName ? { student_name: displayName } : {}),
              },
              token
            );
          } catch (e: any) {
            // If backend says it needs a guest name, retry as guest with the same data
            const msg = String(e?.message || "");
            if (
              e?.status === 400 &&
              msg.toUpperCase().includes("GUEST_NAME_REQUIRED")
            ) {
              submissionResult = await publicApi.submitSurvey(
                sessionData.joinToken,
                {
                  mood: moodToSend,
                  answers: answersMap,
                  is_guest: true,
                  student_name: displayName || "Student",
                }
              );
            } else {
              throw e;
            }
          }
        } else {
          // guest path
          if (!displayName) {
            alert("Please enter your name before submitting.");
            return;
          }
          submissionResult = await publicApi.submitSurvey(
            sessionData.joinToken,
            {
              mood: moodToSend,
              answers: answersMap,
              is_guest: true,
              student_name: displayName,
            }
          );
        }

        setResult(submissionResult);
      } else {
        setResult({ mood: mood || "neutral" });
      }

      setIsComplete(true);
    } catch (err) {
      console.error("❌ Submission failed:", err);
      alert("Oops! We couldn't save your answers. Please try again!");
    }
  }; // ← ← IMPORTANT: close handleAnswer here

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  /* ---------------- Completion screen ---------------- */
  if (isComplete) {
    const hasActivity = result?.recommended_activity?.activity;
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 md:p-8"
        style={{
          backgroundImage: "url('/images/3d-image.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-3xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-700  mb-2">
              Amazing Job, {nameForGreeting}!
            </h1>
            <p className="text-lg md:text-xl text-gray-700">
              You've completed the survey!
            </p>
          </div>

          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">
                    Your Learning Style
                  </p>
                  <p className="text-2xl font-bold text-blue-600 capitalize">
                    {result.learning_style === "visual" && "👁️ Visual"}
                    {result.learning_style === "auditory" && "🎧 Auditory"}
                    {result.learning_style === "kinesthetic" &&
                      "✋ Kinesthetic"}
                    {!result.learning_style && "—"}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Your Mood</p>
                  <p className="text-2xl font-bold text-purple-600 capitalize">
                    😊 {result.mood ?? mood ?? "neutral"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasActivity && (
            <div className="bg-white border-2 border-green-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Recommended Activity
                </h2>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  {result.recommended_activity.activity.name}
                </h3>
                <p className="text-gray-700 mb-4">
                  {result.recommended_activity.activity.summary}
                </p>
                <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  {result.recommended_activity.activity.type}
                </div>

                {(() => {
                  const a = result?.recommended_activity?.activity;
                  const cj = a?.content_json ?? {};
                  const rawUrl: string | undefined =
                    cj.url || cj.video_url || a?.link || a?.url;
                  if (!rawUrl) return null;
                  const url = String(rawUrl);

                  if (url.includes("youtube.com") || url.includes("youtu.be")) {
                    const embedSrc = url
                      .replace("watch?v=", "embed/")
                      .replace("youtu.be/", "youtube.com/embed/");
                    return (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">
                          🎬 Watch this:
                        </p>
                        <div
                          className="relative w-full rounded-lg overflow-hidden shadow-lg"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={embedSrc}
                            title={a?.name ?? "Recommended video"}
                            frameBorder={0}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  }

                  if (url.includes("vimeo.com")) {
                    const id = url.split("/").pop();
                    const embedSrc = `https://player.vimeo.com/video/${id}`;
                    return (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">
                          🎬 Watch this:
                        </p>
                        <div
                          className="relative w-full rounded-lg overflow-hidden shadow-lg"
                          style={{ paddingBottom: "56.25%" }}
                        >
                          <iframe
                            className="absolute top-0 left-0 w-full h-full"
                            src={embedSrc}
                            title={a?.name ?? "Recommended video"}
                            frameBorder={0}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  }

                  if (
                    url.endsWith(".mp4") ||
                    url.endsWith(".webm") ||
                    url.endsWith(".ogg")
                  ) {
                    return (
                      <div className="mt-4">
                        <video
                          className="w-full rounded-lg shadow-lg"
                          src={url}
                          controls
                          playsInline
                        />
                      </div>
                    );
                  }

                  return (
                    <div className="mt-4">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-medium"
                      >
                        <span className="text-xl">▶️</span>
                        <span>Open Video</span>
                      </a>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {result?.message && (
            <div className="text-center text-gray-600 text-sm">
              {result.message}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- Survey screen ---------------- */
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
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-3xl font-bold text-cyan-500">
              Hi {nameForGreeting}!
            </h2>
            <p className="text-gray-600">
              Let's learn about how you learn best!
            </p>
          </div>
          <div
            className="text-white px-4 py-2 rounded-full text-sm font-medium shadow-md sm:text-base sm:px-5"
            style={{
              background: "linear-gradient(135deg,#6EE7B7 0%,#0AC5FF 100%)",
            }}
          >
            Question {currentQuestion + 1} of {questions.length}
          </div>
        </div>

        {/* Mood picker */}
        {moodOptions.length > 0 && (
          <div className="mb-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
              <div className="font-bold text-lg sm:text-xl mb-6 text-gray-800">
                {moodPrompt}
              </div>
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12">
                {moodOptions.map((opt) => {
                  const key = toKey(opt); // key for visuals only
                  return (
                    <MoodChoice
                      key={key}
                      value={opt} // <-- keep ORIGINAL label here
                      selected={toKey(mood) === key} // compare by key
                      onClick={(v) => setMood(v)} // <-- store ORIGINAL label in state
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="w-full bg-white rounded-3xl md:rounded-[32px] shadow-[4px_8px_28px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10">
          <p className="text-2xl text-gray-700 mb-8 text-center">
            There are NO wrong answers! Just pick what feels right for you!
          </p>

          <div className="mb-6 text-center">
            <img
              src={CONFUSE_IMG}
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

          <div className="mt-3 mb-5">
            <ProgressBar current={answeredCount} total={questions.length} />
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
      </div>
    </div>
  );
}

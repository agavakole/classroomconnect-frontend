import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { QuestionCard } from "../components/QuestionCard";
import { AnswerButton } from "../components/AnswerButton";
import { SURVEY_QUESTIONS, ANSWER_OPTIONS } from "../constants/surveyData";
import type { AnswerOption } from "../types";
import { publicApi } from "../services/api"; // ← NEW!

interface SurveyProps {
  studentName: string;
  sessionData?: any;
}

export function Survey({ studentName, sessionData }: SurveyProps) {
  console.log("📊 Survey received:", { studentName, sessionData });

  // States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isComplete, setIsComplete] = useState(false);

  // ✅ Use backend questions if available, fallback to hardcoded
  const questions = sessionData?.survey?.questions || SURVEY_QUESTIONS;
  const question = questions[currentQuestion];

  console.log("📝 Current question:", question);

  // ========================================
  // UPDATED FUNCTION WITH SUBMISSION
  // ========================================
  const handleAnswer = async (optionIndex: number) => {
    console.log("👆 Answer clicked:", optionIndex);

    // Save answer
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    // Check if this was the last question
    if (currentQuestion < questions.length - 1) {
      // Not done yet - go to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question! Submit to backend
      console.log("🎉 Survey complete! Submitting...");

      try {
        // Only submit if we have session data (from QR code)
        if (sessionData?.sessionId) {
          // Format answers for backend
          const formattedAnswers: Record<string, string> = {};

          // Convert answer indices to question IDs
          questions.forEach((q: any, index: number) => {
            const answerIndex = newAnswers[index];
            if (answerIndex !== undefined) {
              formattedAnswers[q.id] = String(answerIndex);
            }
          });

          console.log("📤 Submitting answers:", formattedAnswers);
          console.log("📤 Student name:", studentName);
          console.log("📤 Session ID:", sessionData.sessionId);

          // Submit to backend
          await publicApi.submitSurvey(sessionData.sessionId, {
            student_name: studentName,
            answers: formattedAnswers,
            is_guest: true,
          });

          console.log("✅ Submission successful!");
        } else {
          console.log(
            "ℹ️ No session data - skipping backend submission (testing mode)"
          );
        }

        // Show completion screen
        setIsComplete(true);
      } catch (error) {
        console.error("❌ Submission failed:", error);
        alert("Oops! We couldn't save your answers. Please try again!");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // COMPLETION SCREEN
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
          <div className="text-7xl md:text-9xl mb-6">🎉</div>
          <h1 className="text-3xl md:text-5xl font-bold text-purple-600 mb-4">
            Amazing Job, {studentName}!
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-6">
            You've completed the survey! Thank you for sharing about yourself!
          </p>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
            <p className="text-lg md:text-xl font-semibold text-purple-700">
              ✨ All {questions.length} questions answered! ✨
            </p>
          </div>
          <div className="text-base md:text-lg text-gray-600">
            Your magical profile has been saved! 🌟
          </div>
        </div>
      </div>
    );
  }

  // Regular survey
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
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-cyan-500">
              Hi {studentName}! 😊
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

        {/* Progress bar */}
        <div className="mt-3 mb-5">
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </div>

        {/* Main survey card */}
        <div className="w-full bg-white rounded-3xl md:rounded-[32px] shadow-[4px_8px_28px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10">
          <p className="text-2xl text-gray-700 mb-8 text-center">
            There are NO wrong answers! Just pick what feels right for you! ❤️
          </p>

          <QuestionCard emoji={question.emoji} text={question.text} />

          {/* Answer buttons */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-8 max-[360px]:grid-cols-1">
            {(question.options || ANSWER_OPTIONS).map(
              (option: AnswerOption, index: number) => (
                <AnswerButton
                  key={option.value}
                  value={index}
                  text={option.text}
                  emoji={option.emoji}
                  color={option.color}
                  textColor={option.textColor}
                  onClick={handleAnswer}
                  isSelected={answers[currentQuestion] === index}
                  ringColor={option.ringColor}
                />
              )
            )}
          </div>

          {/* Navigation footer */}
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
                {Object.keys(answers).length === 0
                  ? "Let's start! 🌟"
                  : Object.keys(answers).length === questions.length
                  ? "All done! 🎉"
                  : `${Object.keys(answers).length} done! Keep going! ⭐`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

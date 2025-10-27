import { useState } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { QuestionCard } from "../components/QuestionCard";
import { AnswerButton } from "../components/AnswerButton";
import { SURVEY_QUESTIONS, ANSWER_OPTIONS } from "../constants/surveyData";
interface SurveyProps {
  studentName: string;
}

export function Survey({ studentName }: SurveyProps) {
  // States
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [isComplete, setIsComplete] = useState(false);

  const question = SURVEY_QUESTIONS[currentQuestion]; // Needs to update when state changes!

  // Functions
  const handleAnswer = (value: number) => {
    // Create the new answers object FIRST
    const newAnswers = {
      ...answers,
      [question.id]: value, // The ... means make a copy then append
    };

    // Update state
    setAnswers(newAnswers);

    if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      console.log("Survey complete!", newAnswers); // ← Log the NEW answers!
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  //  COMPLETION SCREEN
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center max-w-2xl w-full">
          {/* Celebration Emoji */}
          <div className="text-7xl md:text-9xl mb-6">🎉</div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-purple-600 mb-4">
            Amazing Job!
          </h1>

          {/* Message */}
          <p className="text-xl md:text-2xl text-gray-700 mb-6">
            You've completed the survey! Thank you for sharing about yourself!
          </p>

          {/* Completion Badge */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
            <p className="text-lg md:text-xl font-semibold text-purple-700">
              ✨ All 8 questions answered! ✨
            </p>
          </div>

          {/* Success Message */}
          <div className="text-base md:text-lg text-gray-600">
            Your magical profile has been saved! 🌟
          </div>
        </div>
      </div>
    );
  }

  // Regular survey (only shows if NOT complete)

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
      {/* content container */}
      <div
        className="
        relative z-10
        mx-auto
        w-full
        px-4 sm:px-5 md:px-6 lg:px-8
        py-6 md:py-10
        max-w-[900px]
      "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#0AC5FF]">
            Getting to Know YOU!
          </h1>
          <div
            className="text-white px-4 py-2 rounded-full text-sm font-medium shadow-md sm:text-base sm:px-5"
            style={{
              background: "linear-gradient(135deg,#6EE7B7 0%,#0AC5FF 100%)",
            }}
          >
            Question {currentQuestion + 1} of {SURVEY_QUESTIONS.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 mb-5">
          <ProgressBar
            current={currentQuestion + 1}
            total={SURVEY_QUESTIONS.length}
          />
        </div>

        {/* Main survey card */}
        <div
          className="w-full bg-white rounded-3xl md:rounded-[32px]
                   shadow-[4px_8px_28px_rgba(0,0,0,0.08)] p-6 sm:p-8 md:p-10"
        >
          <p className="text-2xl text-gray-700 mb-8 text-center">
            There are NO wrong answers! Just pick what feels right for you! ❤️
          </p>

          <QuestionCard emoji={question.emoji} text={question.text} />

          <div className="grid grid-cols-2 gap-4 sm:gap-5 mb-8 max-[360px]:grid-cols-1">
            {ANSWER_OPTIONS.map((option) => (
              <AnswerButton
                key={option.value}
                value={option.value}
                text={option.text}
                emoji={option.emoji}
                color={option.color}
                textColor={option.textColor}
                onClick={handleAnswer}
                isSelected={answers[question.id] === option.value}
                ringColor={option.ringColor}
              />
            ))}
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
                aria-label="Go to previous question"
              >
                ← Previous
              </button>

              <div className="text-center text-gray-600 text-sm sm:text-base font-medium">
                {Object.keys(answers).length === 0
                  ? "Let's start! 🌟"
                  : Object.keys(answers).length === SURVEY_QUESTIONS.length
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

// src/pages/Welcome.tsx
import { useState } from "react";

/**
 * Component props
 */
interface WelcomeProps {
  onStart: (name: string) => void; // Callback when user enters name
}

/**
 * Welcome screen for guest users (not logged in)
 * 
 * Purpose:
 * - Collect guest name before survey
 * - Friendly, engaging first impression
 * - Simple one-field form
 * 
 * Flow:
 * 1. User lands here from App.tsx if not logged in
 * 2. Enters their name
 * 3. Name stored in sessionStorage for survey submission
 * 4. Callback advances to Survey screen
 * 
 * Stored data:
 * - sessionStorage: guest_name - Used in survey submission
 * - App.tsx state: studentName - Passed to Survey for greeting
 * 
 * Used for guest submissions:
 * POST /api/public/join/{joinToken}/submit
 * { is_guest: true, student_name: "entered_name", ... }
 */
export function Welcome({ onStart }: WelcomeProps) {
  const [name, setName] = useState("");

  /**
   * Handles form submission
   * Validates name exists, stores in sessionStorage, triggers callback
   */
  const handleSubmit = () => {
    const val = name.trim();
    if (!val) return; // Require non-empty name
    
    // Persist name for later use in survey submission
    sessionStorage.setItem("guest_name", val);
    
    // Notify parent (App.tsx) to advance to survey
    onStart(val);
  };

  return (
    <div
      className="min-h-screen bg-[#E6F6FF] relative flex items-center justify-center px-4
      bg-no-repeat bg-cover
    bg-[position:center_105%]
    lg:bg-[position:center_100%]
    xl:bg-[position:center_60%]"
      style={{
        backgroundImage: "url('/images/3d-image.png')",
      }}
    >
      {/* Centered welcome card */}
      <div className="relative z-10 w-full flex flex-col items-center max-w-[760px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-white/80 p-8 sm:p-10 text-center">
          {/* Friendly greeting */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Welcome,{" "}
            <span className="text-[#0AC5FF] font-bold">Superstar! 😎</span>
          </h1>

          {/* Name input form */}
          <div className="mb-8 text-left">
            <label className="block text-lg font-medium text-gray-700 mb-3">
              What's your name?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()} // Submit on Enter key
              placeholder="Type your name here..."
              className="w-full px-5 py-4 text-xl rounded-2xl border border-gray-200 shadow-inner text-center
                         placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 transition"
              maxLength={30} // Prevent excessively long names
              autoFocus // Focus on mount for quick typing
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`w-full rounded-2xl py-5 text-xl font-semibold transition-all duration-200 ${
              name.trim()
                ? "bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Let's go!
          </button>
        </div>

        {/* Encouraging message */}
        <p className="text-center text-gray-600 text-lg mt-16">
          Tell us your name and let's get started! 🚀
        </p>
      </div>
    </div>
  );
}
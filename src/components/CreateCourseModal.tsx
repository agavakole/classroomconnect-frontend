// src/components/CreateCourseModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { publicApi, authApi, teacherApi } from "../services/api";

/**
 * Predefined mood options that teachers commonly use
 * Teachers can also add custom moods
 */
const COMMON_MOODS = [
  "energized",
  "curious",
  "tired",
  "happy",
  "calm",
  "nervous",
];

interface CreateCourseModalProps {
  surveys: any[]; // List of available surveys from parent (TeacherDashboard)
  onClose: () => void;
  onSuccess: () => void; // Triggers reload of courses in parent
}

export default function CreateCourseModal({
  surveys,
  onClose,
  onSuccess,
}: CreateCourseModalProps) {
  // Course title (e.g., "CS 5500 - Software Engineering")
  const [title, setTitle] = useState("");
  
  // ID of survey that students must complete when joining
  // Backend: GET /api/surveys/ to populate this list
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  
  // Mood options students can choose from (e.g., ["energized", "tired", "happy"])
  // Backend combines mood + learning_style to recommend activities
  const [moodLabels, setMoodLabels] = useState<string[]>([
    "energized",
    "curious",
    "tired",
  ]);
  
  // Temporary input for adding custom moods
  const [customMood, setCustomMood] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Adds a mood to the course's mood list
   * Normalizes to lowercase and prevents duplicates
   * 
   * Backend uses these moods in mood_check_schema when creating sessions
   * Students select one mood before taking survey
   */
  const addMood = (mood: string) => {
    const cleaned = mood.trim().toLowerCase();
    if (cleaned && !moodLabels.includes(cleaned)) {
      setMoodLabels([...moodLabels, cleaned]);
    }
    setCustomMood(""); // Clear input after adding
  };

  /**
   * Removes a mood from the course
   * Students won't see this mood as an option
   */
  const removeMood = (mood: string) => {
    setMoodLabels(moodLabels.filter((m) => m !== mood));
  };

  /**
   * Validates course data before submission
   * Ensures required fields are filled
   */
  const validate = () => {
    if (!title.trim()) return "Please enter a course title.";
    if (!selectedSurveyId) return "Please select a survey.";
    if (moodLabels.length === 0) return "Please add at least one mood label.";
    return "";
  };

  /**
   * Submits course to backend
   * Backend: POST /api/courses/
   * 
   * Creates course with:
   * - Title (shown to teacher)
   * - Survey assignment (students take this when joining)
   * - Mood labels (students pick one mood per session)
   * 
   * Backend also auto-creates learning_style_categories based on survey structure
   * Teacher can then map (learning_style + mood) → activity recommendations
   */
  const handleSave = async () => {
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    const payload = {
      title: title.trim(),
      baseline_survey_id: selectedSurveyId,
      mood_labels: moodLabels,
    };

    try {
      setSaving(true);
      await teacherApi.createCourse(payload); // POST to backend
      onSuccess(); // Reload courses in TeacherDashboard
    } catch (e: any) {
      setError(e?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Course" size="lg">
      <div className="space-y-6">
        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Course title input */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Course Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="CS 5500 - Software Engineering"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Survey selection dropdown */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Select Survey *
          </label>
          {surveys.length === 0 ? (
            // Show warning if no surveys exist yet
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              No surveys available. Please create a survey first.
            </div>
          ) : (
            <select
              value={selectedSurveyId}
              onChange={(e) => setSelectedSurveyId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 outline-none"
            >
              <option value="">-- Choose a survey --</option>
              {surveys.map((survey) => (
                <option key={survey.id} value={survey.id}>
                  {survey.title} (
                  {survey.total || survey.questions?.length || 0} questions)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Mood labels configuration */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Mood Labels *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Students will select one of these moods.
          </p>

          {/* Display current mood labels as removable badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            {moodLabels.map((mood) => (
              <span
                key={mood}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {mood}
                {/* Remove mood button */}
                <button
                  onClick={() => removeMood(mood)}
                  className="text-indigo-500 hover:text-indigo-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Quick add buttons for common moods */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {/* Show only moods not already added */}
              {COMMON_MOODS.filter((m) => !moodLabels.includes(m)).map(
                (mood) => (
                  <button
                    key={mood}
                    onClick={() => addMood(mood)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
                  >
                    + {mood}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Custom mood input */}
          <div className="flex gap-2">
            <input
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMood(customMood);
                }
              }}
              placeholder="Add custom mood..."
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={() => addMood(customMood)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            >
              Add
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving || surveys.length === 0}
            className="flex-1 px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Creating..." : "📚 Create Course"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
// src/components/CreateCourseModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { teacherApi } from "../services/teacherApi";

const COMMON_MOODS = [
  "energized",
  "curious",
  "tired",
  "happy",
  "calm",
  "nervous",
];

interface CreateCourseModalProps {
  surveys: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCourseModal({
  surveys,
  onClose,
  onSuccess,
}: CreateCourseModalProps) {
  const [title, setTitle] = useState("");
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [moodLabels, setMoodLabels] = useState<string[]>([
    "energized",
    "curious",
    "tired",
  ]);
  const [customMood, setCustomMood] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addMood = (mood: string) => {
    const cleaned = mood.trim().toLowerCase();
    if (cleaned && !moodLabels.includes(cleaned)) {
      setMoodLabels([...moodLabels, cleaned]);
    }
    setCustomMood("");
  };

  const removeMood = (mood: string) => {
    setMoodLabels(moodLabels.filter((m) => m !== mood));
  };

  const validate = () => {
    if (!title.trim()) return "Please enter a course title.";
    if (!selectedSurveyId) return "Please select a survey.";
    if (moodLabels.length === 0) return "Please add at least one mood label.";
    return "";
  };

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
      await teacherApi.createCourse(payload);
      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Failed to create course.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Course" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Select Survey *
          </label>
          {surveys.length === 0 ? (
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

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Mood Labels *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Students will select one of these moods.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {moodLabels.map((mood) => (
              <span
                key={mood}
                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {mood}
                <button
                  onClick={() => removeMood(mood)}
                  className="text-indigo-500 hover:text-indigo-700 font-bold"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
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

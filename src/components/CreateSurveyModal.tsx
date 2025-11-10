// src/components/CreateSurveyModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { publicApi, authApi, teacherApi } from "../services/api";

/**
 * Type definitions for survey structure
 * Matches backend schema for learning style assessment
 */
type Score = { visual: number; auditory: number; kinesthetic: number };
type Option = { label: string; scores: Score };
type Question = { text: string; options: Option[] };

interface CreateSurveyModalProps {
  onClose: () => void; // Called when user cancels or clicks X
  onSuccess: () => void; // Called after successful survey creation (triggers reload)
}

/**
 * Transforms frontend question structure to backend format
 * Adds auto-generated IDs for questions and options
 * Backend uses these IDs to track student responses
 * 
 * @returns Survey object ready for POST /api/surveys/
 */
function makeIdsForSurvey(title: string, questions: Question[]) {
  return {
    title: title.trim(),
    questions: questions.map((q, qi) => ({
      id: `q${qi + 1}`, // Auto-generate question IDs
      text: q.text.trim(),
      options: q.options.map((o, oi) => ({
        id: `q${qi + 1}_opt_${oi}`, // Auto-generate option IDs
        label: o.label.trim(),
        scores: {
          visual: Number(o.scores.visual) || 0,
          auditory: Number(o.scores.auditory) || 0,
          kinesthetic: Number(o.scores.kinesthetic) || 0,
        },
      })),
    })),
  };
}

export default function CreateSurveyModal({
  onClose,
  onSuccess,
}: CreateSurveyModalProps) {
  // Survey title shown to students
  const [title, setTitle] = useState("");
  
  // Array of questions, each with multiple choice options
  // Default: 1 question with 3 options (standard survey format)
  const [questions, setQuestions] = useState<Question[]>([
    {
      text: "",
      options: [
        { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
        { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
        { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
      ],
    },
  ]);
  
  // UI state for save operation
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Adds a new blank question with 3 default options
   * Teachers can build multi-question surveys for better assessment
   */
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: [
          { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
          { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
          { label: "", scores: { visual: 0, auditory: 0, kinesthetic: 0 } },
        ],
      },
    ]);
  };

  /**
   * Removes a question from the survey
   * Updates indices of remaining questions automatically
   */
  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  /**
   * Updates the text of a specific question
   * Immutably updates state (React best practice)
   */
  const updateQuestionText = (idx: number, text: string) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], text };
    setQuestions(copy);
  };

  /**
   * Updates the label text of a specific option within a question
   * Uses immutable update pattern for nested state
   */
  const updateOptionLabel = (qIdx: number, oIdx: number, label: string) => {
    const copy = [...questions];
    const qItem = { ...copy[qIdx] };
    const opts = [...qItem.options];
    opts[oIdx] = { ...opts[oIdx], label };
    qItem.options = opts;
    copy[qIdx] = qItem;
    setQuestions(copy);
  };

  /**
   * Updates learning style score for a specific option
   * These scores determine learning style calculation on backend
   * 
   * @param key - "visual", "auditory", or "kinesthetic"
   * @param value - Score value (typically 0-5 range)
   * 
   * Backend sums all scores across questions to determine dominant style
   * Example: If student picks options with high visual scores → classified as "visual learner"
   */
  const updateOptionScore = (
    qIdx: number,
    oIdx: number,
    key: keyof Score,
    value: number
  ) => {
    const copy = [...questions];
    const qItem = { ...copy[qIdx] };
    const opts = [...qItem.options];
    opts[oIdx] = {
      ...opts[oIdx],
      scores: { ...opts[oIdx].scores, [key]: value },
    };
    qItem.options = opts;
    copy[qIdx] = qItem;
    setQuestions(copy);
  };

  /**
   * Validates survey data before submission
   * Ensures all required fields are filled
   * 
   * @returns Error message string, or empty string if valid
   */
  const validate = () => {
    if (!title.trim()) return "Please enter a survey title.";
    if (questions.length === 0) return "Add at least one question.";
    
    // Check each question has text and sufficient options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} needs text.`;
      if (q.options.length < 2)
        return `Question ${i + 1} needs at least 2 options.`;
      
      // Check each option has a label
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].label.trim())
          return `Question ${i + 1}, Option ${j + 1} needs a label.`;
      }
    }
    return "";
  };

  /**
   * Submits survey to backend after validation
   * Backend: POST /api/surveys/
   * 
   * On success:
   * - Survey is saved to database
   * - Appears in teacher's survey list
   * - Can be assigned to courses
   * - Students will see these questions when joining sessions
   */
  const handleSave = async () => {
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    // Transform to backend format with auto-generated IDs
    const payload = makeIdsForSurvey(title, questions);

    try {
      setSaving(true);
      await teacherApi.createSurvey(payload); // POST to backend
      onSuccess(); // Trigger parent to reload survey list
    } catch (e: any) {
      setError(e?.message || "Failed to create survey.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Survey" size="xl">
      <div className="space-y-6">
        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Survey title input */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Survey Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="How Do You Learn?"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Questions list - each question contains multiple options */}
        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Question {qi + 1}</h3>
                {/* Allow removing questions if more than one exists */}
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Question text input */}
              <input
                value={q.text}
                onChange={(e) => updateQuestionText(qi, e.target.value)}
                placeholder="Question text..."
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none mb-3"
              />

              {/* Options grid - each option has label + 3 scores */}
              <div className="grid md:grid-cols-3 gap-3">
                {q.options.map((o, oi) => (
                  <div key={oi} className="border rounded-lg p-3 bg-white">
                    <div className="text-sm text-gray-600 mb-1">
                      Option {oi + 1}
                    </div>
                    
                    {/* Option label */}
                    <input
                      value={o.label}
                      onChange={(e) =>
                        updateOptionLabel(qi, oi, e.target.value)
                      }
                      placeholder="Option label"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none mb-2"
                    />

                    {/* Learning style scores - determines how this option affects learning style calculation */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["visual", "auditory", "kinesthetic"] as const).map(
                        (k) => (
                          <label key={k} className="flex flex-col gap-1">
                            <span className="capitalize text-gray-600">
                              {k.slice(0, 3)} {/* Show "vis", "aud", "kin" */}
                            </span>
                            {/* Score input (0-5 recommended) */}
                            <input
                              type="number"
                              min={0}
                              max={5}
                              value={o.scores[k]}
                              onChange={(e) =>
                                updateOptionScore(
                                  qi,
                                  oi,
                                  k,
                                  Number(e.target.value || 0)
                                )
                              }
                              className="w-full px-2 py-1 rounded border text-center"
                            />
                          </label>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add more questions button */}
        <button
          onClick={addQuestion}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
        >
          + Add Question
        </button>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "✅ Create Survey"}
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
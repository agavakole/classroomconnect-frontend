// src/components/CreateSurveyModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { publicApi, authApi, teacherApi } from "../services/api";

type Score = { visual: number; auditory: number; kinesthetic: number };
type Option = { label: string; scores: Score };
type Question = { text: string; options: Option[] };

interface CreateSurveyModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function makeIdsForSurvey(title: string, questions: Question[]) {
  return {
    title: title.trim(),
    questions: questions.map((q, qi) => ({
      id: `q${qi + 1}`,
      text: q.text.trim(),
      options: q.options.map((o, oi) => ({
        id: `q${qi + 1}_opt_${oi}`,
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
  const [title, setTitle] = useState("");
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx: number, text: string) => {
    const copy = [...questions];
    copy[idx] = { ...copy[idx], text };
    setQuestions(copy);
  };

  const updateOptionLabel = (qIdx: number, oIdx: number, label: string) => {
    const copy = [...questions];
    const qItem = { ...copy[qIdx] };
    const opts = [...qItem.options];
    opts[oIdx] = { ...opts[oIdx], label };
    qItem.options = opts;
    copy[qIdx] = qItem;
    setQuestions(copy);
  };

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

  const validate = () => {
    if (!title.trim()) return "Please enter a survey title.";
    if (questions.length === 0) return "Add at least one question.";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} needs text.`;
      if (q.options.length < 2)
        return `Question ${i + 1} needs at least 2 options.`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].label.trim())
          return `Question ${i + 1}, Option ${j + 1} needs a label.`;
      }
    }
    return "";
  };

  const handleSave = async () => {
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    const payload = makeIdsForSurvey(title, questions);

    try {
      setSaving(true);
      await teacherApi.createSurvey(payload);
      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Failed to create survey.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Survey" size="xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

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

        <div className="space-y-6">
          {questions.map((q, qi) => (
            <div key={qi} className="border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Question {qi + 1}</h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qi)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                value={q.text}
                onChange={(e) => updateQuestionText(qi, e.target.value)}
                placeholder="Question text..."
                className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none mb-3"
              />

              <div className="grid md:grid-cols-3 gap-3">
                {q.options.map((o, oi) => (
                  <div key={oi} className="border rounded-lg p-3 bg-white">
                    <div className="text-sm text-gray-600 mb-1">
                      Option {oi + 1}
                    </div>
                    <input
                      value={o.label}
                      onChange={(e) =>
                        updateOptionLabel(qi, oi, e.target.value)
                      }
                      placeholder="Option label"
                      className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none mb-2"
                    />

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["visual", "auditory", "kinesthetic"] as const).map(
                        (k) => (
                          <label key={k} className="flex flex-col gap-1">
                            <span className="capitalize text-gray-600">
                              {k.slice(0, 3)}
                            </span>
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

        <button
          onClick={addQuestion}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
        >
          + Add Question
        </button>

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

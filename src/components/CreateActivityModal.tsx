// src/components/CreateActivityModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { teacherApi } from "../services/teacherApi";

type ActivityType =
  | "video"
  | "worksheet"
  | "breathing-exercise"
  | "article"
  | "in-class-task";

interface CreateActivityModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateActivityModal({
  onClose,
  onSuccess,
}: CreateActivityModalProps) {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState<ActivityType>("video");
  const [tags, setTags] = useState("");

  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [videoNotes, setVideoNotes] = useState("");
  const [pausePoints, setPausePoints] = useState<
    { timestamp_sec: number; prompt: string }[]
  >([]);

  const [fileUrl, setFileUrl] = useState("");
  const [scriptSteps, setScriptSteps] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<string[]>([""]);
  const [teacherNotes, setTeacherNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const buildContentJson = () => {
    const content: any = {};

    if (type === "video") {
      content.url = videoUrl;
      content.duration_sec = parseInt(duration) || 0;
      if (videoNotes) content.notes = videoNotes;
      if (pausePoints.length > 0) {
        content.pause_points = pausePoints.filter((p) => p.prompt.trim());
      }
    }

    if (type === "worksheet" || type === "article") {
      content.file_url = fileUrl;
      if (type === "worksheet" && duration) {
        content.duration_sec = parseInt(duration) || 0;
      }
    }

    if (type === "breathing-exercise" || type === "in-class-task") {
      const steps = scriptSteps.filter((s) => s.trim());
      if (steps.length > 0) content.script_steps = steps;

      const mats = materials.filter((m) => m.trim());
      if (mats.length > 0) content.materials_needed = mats;

      if (duration) content.duration_sec = parseInt(duration) || 0;
      if (teacherNotes) content.notes_for_teacher = teacherNotes;
    }

    return content;
  };

  const validate = () => {
    if (!name.trim()) return "Please enter activity name.";
    if (!summary.trim()) return "Please enter summary.";
    if (type === "video" && !videoUrl.trim()) return "Please enter video URL.";
    if ((type === "worksheet" || type === "article") && !fileUrl.trim()) {
      return "Please enter file URL.";
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

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    const payload = {
      name: name.trim(),
      summary: summary.trim(),
      type,
      tags: tagsArray,
      content_json: buildContentJson(),
    };

    try {
      setSaving(true);
      await teacherApi.createActivity(payload);
      onSuccess();
    } catch (e: any) {
      setError(e?.message || "Failed to create activity.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Activity" size="xl">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Activity Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Fun Learning Video"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ActivityType)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            >
              <option value="video">📺 Video</option>
              <option value="worksheet">📄 Worksheet</option>
              <option value="breathing-exercise">🫁 Breathing Exercise</option>
              <option value="article">📰 Article</option>
              <option value="in-class-task">✏️ In-Class Task</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Summary *
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="A fun animated video..."
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Tags (comma-separated)
          </label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="visual, fun, educational"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
          />
        </div>

        {/* Type-specific fields */}
        {type === "video" && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Video Details</h3>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (seconds)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
            <textarea
              value={videoNotes}
              onChange={(e) => setVideoNotes(e.target.value)}
              placeholder="Notes..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {(type === "worksheet" || type === "article") && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">File Details</h3>
            <input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://example.com/file.pdf"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {(type === "breathing-exercise" || type === "in-class-task") && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Instructions</h3>
            {scriptSteps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-gray-500 mt-2">{i + 1}.</span>
                <input
                  value={step}
                  onChange={(e) => {
                    const copy = [...scriptSteps];
                    copy[i] = e.target.value;
                    setScriptSteps(copy);
                  }}
                  placeholder="Step..."
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
                />
                {scriptSteps.length > 1 && (
                  <button
                    onClick={() =>
                      setScriptSteps(scriptSteps.filter((_, idx) => idx !== i))
                    }
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setScriptSteps([...scriptSteps, ""])}
              className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg"
            >
              + Add Step
            </button>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "💾 Create Activity"}
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

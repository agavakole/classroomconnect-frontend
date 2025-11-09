// src/components/CreateActivityModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { teacherApi } from "../services/api";

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

  // video
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(""); // seconds, optional
  const [videoNotes, setVideoNotes] = useState("");

  // files
  const [fileUrl, setFileUrl] = useState("");

  // script/steps types
  const [scriptSteps, setScriptSteps] = useState<string[]>([""]);
  const [materials, setMaterials] = useState<string[]>([""]);
  const [teacherNotes, setTeacherNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---- helpers -------------------------------------------------------------

  const toTagsArray = (s: string) =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  // Build a content_json that matches the backend:
  // - video:        { url, duration?, notes? }
  // - in-class-task / breathing-exercise: { steps, materials?, duration?, notes? }
  // - worksheet/article: { file_url, duration?, notes? }
  const buildContentJson = () => {
    const dur =
      duration && !Number.isNaN(Number(duration))
        ? Number(duration)
        : undefined;

    if (type === "video") {
      const cj: any = {
        url: videoUrl.trim(),
      };
      if (dur !== undefined) cj.duration = dur;
      if (videoNotes.trim()) cj.notes = videoNotes.trim();
      return cj;
    }

    if (type === "in-class-task" || type === "breathing-exercise") {
      const steps = scriptSteps.map((s) => s.trim()).filter(Boolean);
      const mats = materials.map((m) => m.trim()).filter(Boolean);
      const cj: any = { steps };
      if (mats.length) cj.materials = mats;
      if (dur !== undefined) cj.duration = dur;
      if (teacherNotes.trim()) cj.notes = teacherNotes.trim();
      return cj;
    }

    // worksheet/article
    const cj: any = { file_url: fileUrl.trim() };
    if (dur !== undefined) cj.duration = dur;
    if (teacherNotes.trim()) cj.notes = teacherNotes.trim();
    return cj;
  };

  const validate = (): string => {
    if (!name.trim()) return "Please enter an activity name.";
    if (!summary.trim()) return "Please enter a short summary.";

    if (type === "video") {
      if (!videoUrl.trim()) return "Please provide a video URL.";
      return "";
    }

    if (type === "in-class-task" || type === "breathing-exercise") {
      const nonEmptySteps = scriptSteps.map((s) => s.trim()).filter(Boolean);
      if (nonEmptySteps.length === 0)
        return "Please add at least one instruction step.";
      return "";
    }

    // worksheet / article
    if (!fileUrl.trim()) return "Please provide a file URL.";
    return "";
  };

  // ---- submit --------------------------------------------------------------

  const handleSave = async () => {
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const payload = {
      name: name.trim(),
      summary: summary.trim(),
      type, // already in correct backend form (e.g., "in-class-task")
      tags: toTagsArray(tags),
      content_json: buildContentJson(),
    };

    try {
      setSaving(true);
      await teacherApi.createActivity(payload);
      onSuccess();
    } catch (e: any) {
      // show real message instead of [object Object]
      setError(String(e?.message || "Failed to create activity."));
    } finally {
      setSaving(false);
    }
  };

  // ---- UI ------------------------------------------------------------------

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
              placeholder="Rhythm Repeat – Call & Response"
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
            placeholder="Teacher explains with voice prompts; students repeat key phrases or rhythms."
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
            placeholder="auditory, group, speaking"
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
              placeholder="Notes…"
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
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (seconds) — optional"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 outline-none"
            />
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Notes…"
              rows={2}
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
                  placeholder="Step…"
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
                />
                {scriptSteps.length > 1 && (
                  <button
                    type="button"
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

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScriptSteps([...scriptSteps, ""])}
                className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg"
              >
                + Add Step
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Materials (comma separated)
                </label>
                <input
                  value={materials.join(", ")}
                  onChange={(e) =>
                    setMaterials(
                      e.target.value
                        .split(",")
                        .map((m) => m.trim())
                        .filter(Boolean)
                    )
                  }
                  placeholder="cards, pencils, timer"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Duration (seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 300"
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Notes for teacher…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
            />
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

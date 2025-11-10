// src/components/CreateActivityModal.tsx
import { useState } from "react";
import { Modal } from "./Modal";
import { teacherApi } from "../services/api";

/**
 * Activity types supported by the backend
 * Each type has different content_json structure
 */
type ActivityType =
  | "video"        // YouTube/Vimeo links with duration
  | "worksheet"    // PDF/file downloads
  | "breathing-exercise"  // Step-by-step calming exercises
  | "article"      // Reading materials
  | "in-class-task"; // Hands-on activities with materials list

interface CreateActivityModalProps {
  onClose: () => void;
  onSuccess: () => void; // Triggers reload of activities in parent
}

export default function CreateActivityModal({
  onClose,
  onSuccess,
}: CreateActivityModalProps) {
  // Basic activity metadata
  const [name, setName] = useState(""); // Activity title shown to students
  const [summary, setSummary] = useState(""); // Brief description
  const [type, setType] = useState<ActivityType>("video"); // Determines content fields
  const [tags, setTags] = useState(""); // Comma-separated (e.g., "visual,group,speaking")

  // Video-specific fields
  const [videoUrl, setVideoUrl] = useState(""); // YouTube/Vimeo URL
  const [duration, setDuration] = useState(""); // Duration in seconds
  const [videoNotes, setVideoNotes] = useState(""); // Teacher notes about video

  // File-based activities (worksheet/article)
  const [fileUrl, setFileUrl] = useState(""); // Link to PDF/file

  // Script/steps activities (in-class-task, breathing-exercise)
  const [scriptSteps, setScriptSteps] = useState<string[]>([""]); // Array of instruction steps
  const [materials, setMaterials] = useState<string[]>([""]); // Required materials list
  const [teacherNotes, setTeacherNotes] = useState(""); // General notes for teacher

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /**
   * Converts comma-separated tags string to array
   * Trims whitespace and removes empty values
   */
  const toTagsArray = (s: string) =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  /**
   * Builds content_json object based on activity type
   * Backend schema varies by type:
   * 
   * - video: { url, duration?, notes? }
   * - in-class-task/breathing-exercise: { steps[], materials[]?, duration?, notes? }
   * - worksheet/article: { file_url, duration?, notes? }
   * 
   * Duration is always in seconds (e.g., 300 = 5 minutes)
   */
  const buildContentJson = () => {
    // Parse duration string to number if provided
    const dur =
      duration && !Number.isNaN(Number(duration))
        ? Number(duration)
        : undefined;

    // VIDEO: YouTube/Vimeo embed
    if (type === "video") {
      const cj: any = {
        url: videoUrl.trim(),
      };
      if (dur !== undefined) cj.duration = dur;
      if (videoNotes.trim()) cj.notes = videoNotes.trim();
      return cj;
    }

    // TASK/EXERCISE: Step-by-step instructions
    if (type === "in-class-task" || type === "breathing-exercise") {
      const steps = scriptSteps.map((s) => s.trim()).filter(Boolean);
      const mats = materials.map((m) => m.trim()).filter(Boolean);
      const cj: any = { steps };
      if (mats.length) cj.materials = mats;
      if (dur !== undefined) cj.duration = dur;
      if (teacherNotes.trim()) cj.notes = teacherNotes.trim();
      return cj;
    }

    // WORKSHEET/ARTICLE: File download
    const cj: any = { file_url: fileUrl.trim() };
    if (dur !== undefined) cj.duration = dur;
    if (teacherNotes.trim()) cj.notes = teacherNotes.trim();
    return cj;
  };

  /**
   * Validates activity data before submission
   * Ensures required fields are filled based on activity type
   */
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

  /**
   * Submits activity to backend
   * Backend: POST /api/activities/
   * 
   * Created activity can then be:
   * - Assigned to course recommendation mappings
   * - Shown to students based on learning_style + mood
   * - Viewed in teacher's activity library
   */
  const handleSave = async () => {
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // Build final payload for backend
    const payload = {
      name: name.trim(),
      summary: summary.trim(),
      type, // Backend recognizes: video, worksheet, breathing-exercise, article, in-class-task
      tags: toTagsArray(tags),
      content_json: buildContentJson(), // Type-specific content structure
    };

    try {
      setSaving(true);
      await teacherApi.createActivity(payload); // POST to backend
      onSuccess(); // Reload activities list in parent
    } catch (e: any) {
      // Convert error object to readable string
      setError(String(e?.message || "Failed to create activity."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Activity" size="xl">
      <div className="space-y-6">
        {/* Error display */}
        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic info: name and type */}
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
            {/* Activity type selector - changes which fields are shown */}
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

        {/* Summary - shown to students when activity is recommended */}
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

        {/* Tags - used for filtering/organizing activities */}
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

        {/* Type-specific fields - only show relevant inputs based on selected type */}

        {/* VIDEO TYPE: URL, duration, notes */}
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

        {/* WORKSHEET/ARTICLE TYPE: File URL, duration, notes */}
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

        {/* TASK/EXERCISE TYPE: Step-by-step instructions, materials, duration, notes */}
        {(type === "breathing-exercise" || type === "in-class-task") && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800">Instructions</h3>

            {/* Dynamic step inputs - can add/remove steps */}
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
                {/* Remove step button (only if more than one step) */}
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

            {/* Add more steps button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setScriptSteps([...scriptSteps, ""])}
                className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded-lg"
              >
                + Add Step
              </button>
            </div>

            {/* Materials and duration inputs */}
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

            {/* Teacher notes */}
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Notes for teacher…"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-green-500 outline-none"
            />
          </div>
        )}

        {/* Action buttons */}
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
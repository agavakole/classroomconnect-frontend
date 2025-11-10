// src/pages/TeacherActivityDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { teacherApi } from "../services/api";
import { Modal } from "../components/Modal";

/**
 * Type for activity data
 */
type Activity = {
  id: string;
  name: string;
  type: string;
  tags?: string[];
  summary?: string;
  content_json?: Record<string, any>;
  url?: string;
  link?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Activity detail modal - shows complete activity information
 * 
 * Features:
 * - Display activity metadata (name, type, tags, summary)
 * - Show type-specific content (video embed, steps, files)
 * - View raw content_json for debugging
 * 
 * Backend connection:
 * - GET /api/activities/{id} - Fetch activity details
 * 
 * Opened as modal from:
 * - TeacherDashboard (activities section)
 * - TeacherActivitiesPage (activity list)
 * 
 * Modal shows over background location (dashboard or activities page)
 */
export default function TeacherActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Where to return when closing modal
  // Defaults to dashboard if no return location specified
  const returnTo: string =
    (location.state && (location.state as any).returnTo) || "/teacher/dashboard";
  
  const closeToReturn = () => navigate(returnTo, { replace: true });

  const [item, setItem] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /**
   * On mount: fetch activity data from backend
   */
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      if (!id) return;
      try {
        setErr("");
        setLoading(true);
        // Backend: GET /api/activities/{id}
        const data = await teacherApi.getActivity(id);
        if (!cancelled) setItem(data);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (!cancelled) {
          if (e?.status === 401 || e?.status === 403) {
            setErr("You're not signed in as a teacher. Please log in again.");
          } else {
            setErr(msg || "Failed to load activity.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Extract content from content_json
  const cj = (item?.content_json ?? {}) as Record<string, any>;
  const type = (item?.type || "").toLowerCase();
  
  // Video URL - check various possible field names
  const videoUrl: string | undefined =
    cj.url || cj.video_url || cj.embed_url || item?.url || item?.link;

  /**
   * Converts YouTube URLs to embed format
   * watch?v=abc123 → embed/abc123
   * youtu.be/abc123 → youtube.com/embed/abc123
   */
  const toEmbed = (url?: string) =>
    (url || "").replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");

  /**
   * Mount animation state for smooth modal appearance
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  
  const anim = mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-2 scale-[0.98]";

  return (
    <Modal isOpen={true} onClose={closeToReturn} title="Activity" size="xl">
      <div className={`transition-all duration-300 ease-out ${anim}`}>
        {/* Error display */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : !item ? (
          <div className="text-gray-600">Not found.</div>
        ) : (
          <div className="space-y-5">
            {/* HEADER - title, summary, type badge */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">{item.name}</div>
                {item.summary && <p className="mt-2 text-gray-700">{item.summary}</p>}
              </div>
              {item.type && (
                <span className="shrink-0 px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  {item.type}
                </span>
              )}
            </div>

            {/* TAGS */}
            {item.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {/* TYPE-SPECIFIC CONTENT DISPLAY */}

            {/* IN-CLASS-TASK / BREATHING-EXERCISE: Steps, materials, notes */}
            {(type === "in-class-task" || type === "breathing-exercise") && (
              <section className="space-y-3">
                {/* Duration */}
                {cj.duration_sec ? (
                  <div className="text-sm text-gray-600">⏱ {cj.duration_sec} sec</div>
                ) : null}

                {/* Steps list */}
                {Array.isArray(cj.script_steps) && cj.script_steps.length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-800">Steps</h3>
                    <ol className="list-decimal pl-6 space-y-1 text-gray-800">
                      {cj.script_steps.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </>
                )}

                {/* Materials needed */}
                {Array.isArray(cj.materials_needed) && cj.materials_needed.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Materials: </span>
                    {cj.materials_needed.join(", ")}
                  </p>
                )}

                {/* Teacher notes */}
                {cj.notes_for_teacher && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Notes: </span>
                    {cj.notes_for_teacher}
                  </p>
                )}
              </section>
            )}

            {/* VIDEO: Embedded player */}
            {type === "video" && videoUrl && (
              <section className="space-y-2">
                {/* Duration */}
                {cj.duration_sec ? (
                  <div className="text-sm text-gray-600">⏱ {cj.duration_sec} sec</div>
                ) : null}
                
                {/* YouTube/Vimeo embed */}
                <div className="relative w-full rounded-xl overflow-hidden shadow" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={toEmbed(videoUrl)}
                    title={item.name}
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                
                {/* Video notes */}
                {cj.notes && <p className="text-sm text-gray-600">{cj.notes}</p>}
              </section>
            )}

            {/* WORKSHEET / ARTICLE: Download link */}
            {(type === "worksheet" || type === "article") && (cj.file_url || cj.url) && (
              <section>
                <a
                  href={cj.file_url || cj.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  📄 Open file
                </a>
              </section>
            )}

            {/* DEBUG: Raw content_json viewer (collapsible) */}
            {item.content_json && (
              <details className="pt-2">
                <summary className="cursor-pointer font-semibold">Content JSON</summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-xl overflow-auto text-sm">
                  {JSON.stringify(item.content_json, null, 2)}
                </pre>
              </details>
            )}

            {/* FOOTER - close button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={closeToReturn}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
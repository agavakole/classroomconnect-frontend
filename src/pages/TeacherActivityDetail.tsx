import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { teacherApi } from "../services/api";
import { Modal } from "../components/Modal";

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

export default function TeacherActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Where to go when the modal closes (defaults to dashboard)
  const returnTo: string =
    (location.state && (location.state as any).returnTo) || "/teacher/dashboard";
  const closeToReturn = () => navigate(returnTo, { replace: true });

  const [item, setItem] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      try {
        setErr("");
        setLoading(true);
        const data = await teacherApi.getActivity(id);
        if (!cancelled) setItem(data);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (!cancelled) {
          if (e?.status === 401 || e?.status === 403) {
            setErr("You’re not signed in as a teacher. Please log in again.");
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

  const cj = (item?.content_json ?? {}) as Record<string, any>;
  const type = (item?.type || "").toLowerCase();
  const videoUrl: string | undefined =
    cj.url || cj.video_url || cj.embed_url || item?.url || item?.link;

  const toEmbed = (url?: string) =>
    (url || "").replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/");

  // ✨ NEW: simple mount animation state
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

            {item.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {item.tags.map((t) => (
                  <span key={t} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                    {t}
                  </span>
                ))}
              </div>
            ) : null}

            {(type === "in-class-task" || type === "breathing-exercise") && (
              <section className="space-y-3">
                {cj.duration_sec ? (
                  <div className="text-sm text-gray-600">⏱ {cj.duration_sec} sec</div>
                ) : null}

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

                {Array.isArray(cj.materials_needed) && cj.materials_needed.length > 0 && (
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Materials: </span>
                    {cj.materials_needed.join(", ")}
                  </p>
                )}

                {cj.notes_for_teacher && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Notes: </span>
                    {cj.notes_for_teacher}
                  </p>
                )}
              </section>
            )}

            {type === "video" && videoUrl && (
              <section className="space-y-2">
                {cj.duration_sec ? (
                  <div className="text-sm text-gray-600">⏱ {cj.duration_sec} sec</div>
                ) : null}
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
                {cj.notes && <p className="text-sm text-gray-600">{cj.notes}</p>}
              </section>
            )}

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

            {item.content_json && (
              <details className="pt-2">
                <summary className="cursor-pointer font-semibold">Content JSON</summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded-xl overflow-auto text-sm">
                  {JSON.stringify(item.content_json, null, 2)}
                </pre>
              </details>
            )}

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

// src/pages/TeacherSurveyDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teacherApi } from "../services/api";
import { Modal } from "../components/Modal";

/**
 * Type definitions for backend survey structure
 */
type BackendOption = {
  option_id?: string | number;
  text: string;
  vis?: number;      // Visual score
  aud?: number;      // Auditory score
  kin?: number;      // Kinesthetic score
};

type BackendQuestion = {
  question_id?: string | number;
  text: string;
  options: BackendOption[];
};

type BackendSurvey = {
  survey_id?: string;
  id?: string;
  title: string;
  questions: BackendQuestion[];
  created_at?: string;
  updated_at?: string;
};

/**
 * Survey detail modal - shows survey questions and scoring
 * 
 * Features:
 * - Display all survey questions
 * - Show answer options with learning style scores
 * - Read-only view (no editing)
 * 
 * Backend connection:
 * - GET /api/surveys/{surveyId} - Fetch survey details
 * 
 * Opened as modal from TeacherDashboard when clicking survey card
 * Modal shows over dashboard background
 */
export default function TeacherSurveyDetail() {
  const navigate = useNavigate();
  // Accept either /:surveyId or /:id parameter format
  const { surveyId, id } = useParams<{ surveyId?: string; id?: string }>();
  const effectiveId = surveyId ?? id;

  const [survey, setSurvey] = useState<BackendSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  /**
   * On mount: fetch survey data from backend
   * Loads complete survey with questions, options, and scores
   */
  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      if (!effectiveId) {
        setErr("Missing survey id");
        setLoading(false);
        return;
      }
      
      try {
        setErr("");
        setLoading(true);
        // Backend: GET /api/surveys/{surveyId}
        const data = await teacherApi.getSurveyById(effectiveId);
        if (!cancelled) setSurvey(data);
      } catch (e: any) {
        const msg = String(e?.message || "");
        if (!cancelled) {
          if (e?.status === 401 || e?.status === 403) {
            setErr("You must be signed in as a teacher to view this survey.");
          } else {
            setErr(msg || "Failed to load survey.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    load();
    
    // Cleanup: prevent state updates if component unmounts
    return () => {
      cancelled = true;
    };
  }, [effectiveId]);

  /**
   * Mount animation state
   * Creates smooth fade-in effect when modal appears
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  
  // CSS classes for animation (opacity + transform)
  const anim = mounted
    ? "opacity-100 translate-y-0 scale-100"
    : "opacity-0 translate-y-2 scale-[0.98]";

  return (
    <Modal
      isOpen={true}
      onClose={() => navigate(-1)} // Go back to previous page
      title="Survey"
      size="xl"
    >
      {/* Animated container */}
      <div className={`transition-all duration-300 ease-out ${anim}`}>
        {/* Error display */}
        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
            {err}
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : !survey ? (
          <div className="text-gray-600">Not found.</div>
        ) : (
          <div className="space-y-6">
            {/* Survey header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{survey.title}</h2>
              {survey.created_at && (
                <p className="text-sm text-gray-500">
                  Created: {new Date(survey.created_at).toLocaleString()}
                </p>
              )}
            </div>

            {/* Questions list */}
            <div className="space-y-6">
              {survey.questions?.map((q, qi) => (
                <div key={q.question_id ?? qi} className="border rounded-xl p-4">
                  {/* Question text */}
                  <div className="font-semibold text-gray-800 mb-3">
                    Q{qi + 1}. {q.text}
                  </div>
                  
                  {/* Options grid - shows answer choices with scores */}
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {q.options?.map((op, oi) => (
                      <div key={op.option_id ?? oi} className="rounded-lg border bg-gray-50 p-3">
                        {/* Option text */}
                        <div className="font-medium text-gray-800">{op.text}</div>
                        
                        {/* Learning style scores
                            These determine how this answer affects learning style calculation
                            Backend sums all scores to determine dominant style */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                            Vis: {op.vis ?? 0}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            Aud: {op.aud ?? 0}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Kin: {op.kin ?? 0}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer - close button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => navigate(-1)}
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
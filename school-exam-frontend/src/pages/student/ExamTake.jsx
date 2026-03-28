import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";

const LETTERS = ["A", "B", "C", "D"];
const MAX_VIOLATIONS = 3;
const LOCK_PASSWORD = "CHEATED";

export default function ExamTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [secureModeStarted, setSecureModeStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [isFullscreenActive, setIsFullscreenActive] = useState(Boolean(document.fullscreenElement));
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const storageKey = useMemo(() => `secure-exam-${id}`, [id]);

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await API.get(`/student/exams/${id}/attempt`);
        setPayload(res.data);

        const savedState = JSON.parse(localStorage.getItem(storageKey) || "{}");
        if (typeof savedState.violations === "number") setViolations(savedState.violations);
        if (savedState.isLocked) {
          setIsLocked(true);
          setSecureModeStarted(true);
          setShowGuidelines(false);
        }
      } catch (e) {
        setError(e.response?.data?.message || "Cannot open this exam.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ violations, isLocked }));
  }, [violations, isLocked, storageKey]);

  useEffect(() => {
    if (!secureModeStarted) return undefined;

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreenActive(active);
      if (!active) registerViolation("Fullscreen mode was exited.");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) registerViolation("Tab change detected.");
    };

    const handleWindowBlur = () => {
      registerViolation("Window change detected.");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [secureModeStarted, isLocked, submitting]);

  const requestFullscreen = async () => {
    if (document.fullscreenElement) {
      setIsFullscreenActive(true);
      return true;
    }

    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreenActive(true);
      return true;
    } catch {
      setWarning("Fullscreen permission was denied. Please allow fullscreen to start the exam.");
      setIsFullscreenActive(false);
      return false;
    }
  };

  const registerViolation = (message) => {
    if (!secureModeStarted || isLocked || submitting) return;

    setViolations((current) => {
      const next = current + 1;
      if (next >= MAX_VIOLATIONS) {
        setIsLocked(true);
        setWarning("Exam locked after 3 violations. Admin or teacher password is required.");
      } else {
        setWarning(`${message} Warning ${next} of ${MAX_VIOLATIONS}.`);
      }
      return next;
    });
  };

  const handleStartExam = async () => {
    const started = await requestFullscreen();
    if (!started) return;

    setShowGuidelines(false);
    setSecureModeStarted(true);
    setWarning("");
  };

  const handleUnlock = async (e) => {
    e.preventDefault();
    if (unlockPassword !== LOCK_PASSWORD) {
      setWarning("Incorrect unlock password.");
      return;
    }

    const resumed = await requestFullscreen();
    if (!resumed) return;

    setUnlockPassword("");
    setViolations(0);
    setIsLocked(false);
    setSecureModeStarted(true);
    setShowGuidelines(false);
    setWarning("Exam unlocked successfully.");
  };

  const setAnswer = (questionId, letter) => {
    if (isLocked) return;
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      setError("This exam is locked. Ask your teacher or admin to unlock it.");
      return;
    }

    if (!isFullscreenActive) {
      setError("Please return to fullscreen mode before submitting.");
      return;
    }

    const qs = payload?.questions || [];
    const missing = qs.filter((q) => !answers[q.id]);
    if (missing.length) {
      setError(`Please answer all questions (${missing.length} remaining).`);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await API.post("/student/submit", {
        exam_id: Number(id),
        answers: qs.map((q) => ({
          question_id: q.id,
          answer: answers[q.id],
        })),
      });
      localStorage.removeItem(storageKey);
      navigate("/student/results", {
        replace: true,
        state: { justSubmitted: true, score: res.data.score },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading exam...</p>
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
          <p className="text-red-700">{error}</p>
          <Link to="/student/exams" className="text-blue-600 font-semibold hover:underline mt-4 inline-block">
            Back to exams
          </Link>
        </div>
      </div>
    );
  }

  const exam = payload.exam;
  const questions = payload.questions || [];
  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className="min-h-screen bg-[#f3f6fb] text-gray-900">
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Online Examination</p>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">{exam.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {exam.class_name} | {exam.subject_name} | Total marks: {exam.total_marks} | Duration: {exam.duration || "-"} min
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <TopInfoCard label="Answered" value={`${answeredCount}/${questions.length}`} />
            <TopInfoCard label="Warnings" value={`${violations}/${MAX_VIOLATIONS}`} />
            <TopInfoCard label="Fullscreen" value={isFullscreenActive ? "ON" : "OFF"} />
          </div>
        </div>
      </div>

      {(warning || error) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          {warning && <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{warning}</div>}
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {showGuidelines && (
          <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-blue-50">
                <h2 className="text-2xl font-bold text-gray-900">Exam Guidelines</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Please read these instructions carefully before starting the exam.
                </p>
              </div>

              <div className="p-6 space-y-4 text-sm text-gray-700">
                <div className="border border-gray-200 rounded-2xl p-4">1. Once you click start, the exam will open in fullscreen mode immediately.</div>
                <div className="border border-gray-200 rounded-2xl p-4">2. Do not change the tab, window, or fullscreen mode during the exam.</div>
                <div className="border border-gray-200 rounded-2xl p-4">3. Each tab switch or fullscreen exit gives one warning.</div>
                <div className="border border-gray-200 rounded-2xl p-4">4. After 3 warnings, the exam will be locked.</div>
                <div className="border border-gray-200 rounded-2xl p-4">5. Only teacher or admin can unlock the exam using the secret password.</div>
              </div>

              <div className="px-6 py-5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <Link to="/student/exams" className="text-sm font-semibold text-gray-500 hover:text-gray-700">
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleStartExam}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Start exam
                </button>
              </div>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="mb-6 bg-white border border-red-200 rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-red-700">Exam Locked</h2>
            <p className="text-sm text-gray-600 mt-2">
              This exam has been locked after 3 violations. Teacher or admin must enter the unlock password.
            </p>

            <form onSubmit={handleUnlock} className="mt-5 flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                placeholder="Enter unlock password"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Unlock exam
              </button>
            </form>
          </div>
        )}

        {!showGuidelines && (
          <form onSubmit={handleSubmit}>
            <div className="grid xl:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
              <div className="space-y-5">
                {activeQuestion ? (
                  <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm relative min-h-[520px]">
                    <div className="absolute right-5 top-5 h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg font-bold">
                      {activeQuestionIndex + 1}
                    </div>

                    <div className="pr-16">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                          Question {activeQuestionIndex + 1}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">{activeQuestion.marks} marks</span>
                      </div>

                      <p className="text-lg font-semibold text-gray-900 leading-8 mb-6">{activeQuestion.question_text}</p>

                      <div className="space-y-3">
                        {LETTERS.map((L) => {
                          const text = activeQuestion[`option_${L.toLowerCase()}`];
                          const checked = answers[activeQuestion.id] === L;

                          return (
                            <label
                              key={L}
                              className={`flex items-start gap-4 border rounded-2xl px-4 py-4 cursor-pointer ${
                                checked
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white hover:bg-gray-50"
                              } ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              <div
                                className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  checked ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {L}
                              </div>
                              <input
                                type="radio"
                                name={`q-${activeQuestion.id}`}
                                checked={checked}
                                disabled={isLocked}
                                onChange={() => setAnswer(activeQuestion.id, L)}
                                className="mt-1"
                              />
                              <span className="text-base text-gray-800">{text}</span>
                            </label>
                          );
                        })}
                      </div>

                      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          disabled={activeQuestionIndex === 0}
                          onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <div className="text-sm text-gray-500">
                          {activeQuestionIndex + 1} of {questions.length}
                        </div>
                        <button
                          type="button"
                          disabled={activeQuestionIndex === questions.length - 1}
                          onClick={() => setActiveQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </section>
                ) : null}
              </div>

              <aside className="xl:sticky xl:top-6 bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">Question palette</h2>
                <p className="text-sm text-gray-500 mt-1">Click a number to move to that question.</p>

                <div className="grid grid-cols-5 gap-2 mt-5">
                  {questions.map((q, idx) => {
                    const answered = Boolean(answers[q.id]);
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setActiveQuestionIndex(idx)}
                        className={`h-11 rounded-xl border text-sm font-bold ${
                          activeQuestionIndex === idx
                            ? "bg-blue-600 border-blue-600 text-white"
                            : answered
                              ? "bg-green-600 border-green-600 text-white"
                              : "bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-2 text-sm text-gray-600">
                  <p>Blue: Current question</p>
                  <p>Green: Answered</p>
                  <p>White: Not answered</p>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting || isLocked}
                    className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit exam"}
                  </button>
                </div>
              </aside>
            </div>

            <div className="sticky bottom-4 mt-6">
              <div className="bg-white border border-gray-200 rounded-3xl px-5 py-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Examination in progress</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Answered {answeredCount} of {questions.length}. Stay in fullscreen mode until submission.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={submitting || isLocked}
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit exam"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function TopInfoCard({ label, value }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 min-w-[110px]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-blue-700 font-semibold">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

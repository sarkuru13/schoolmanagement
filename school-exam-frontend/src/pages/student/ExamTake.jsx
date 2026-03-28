import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../api/axios";

const LETTERS = ["A", "B", "C", "D"];

export default function ExamTake() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const res = await API.get(`/student/exams/${id}/attempt`);
        setPayload(res.data);
      } catch (e) {
        setError(e.response?.data?.message || "Cannot open this exam.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const setAnswer = (questionId, letter) => {
    setAnswers((prev) => ({ ...prev, [questionId]: letter }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qs = payload?.questions || [];
    const missing = qs.filter((q) => !answers[q.id]);
    if (missing.length) {
      setError(`Please answer all questions (${missing.length} remaining).`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const body = {
        exam_id: Number(id),
        answers: qs.map((q) => ({
          question_id: q.id,
          answer: answers[q.id],
        })),
      };
      const res = await API.post("/student/submit", body);
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
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading exam…</p>
      </div>
    );
  }

  if (error && !payload) {
    return (
      <div className="p-6 sm:p-10 max-w-lg">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>
        <Link to="/student/exams" className="text-indigo-600 font-semibold hover:underline">
          ← Back to exams
        </Link>
      </div>
    );
  }

  const exam = payload.exam;
  const questions = payload.questions || [];

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto pb-24">
      <Link to="/student/exams" className="text-sm text-indigo-600 hover:underline mb-4 inline-block">
        ← Back
      </Link>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {exam.class_name} · {exam.subject_name} · Total marks: {exam.total_marks}
          {exam.duration ? ` · Duration: ${exam.duration} min` : ""}
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="font-medium text-gray-900 mb-3">
              {idx + 1}. {q.question_text}{" "}
              <span className="text-gray-400 font-normal">({q.marks} marks)</span>
            </p>
            <div className="space-y-2">
              {LETTERS.map((L) => {
                const optKey = `option_${L.toLowerCase()}`;
                const text = q[optKey];
                return (
                  <label
                    key={L}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer text-sm ${
                      answers[q.id] === L ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === L}
                      onChange={() => setAnswer(q.id, L)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-semibold text-gray-700">{L}.</span> {text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {questions.length === 0 ? (
          <p className="text-gray-500">This exam has no questions yet.</p>
        ) : (
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 shadow-sm"
          >
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        )}
      </form>
    </div>
  );
}

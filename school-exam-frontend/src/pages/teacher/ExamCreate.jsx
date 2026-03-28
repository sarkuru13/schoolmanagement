import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

export default function ExamCreate() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [assignmentKey, setAssignmentKey] = useState("");
  const [exam_date, setExamDate] = useState("");
  const [start_time, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(60);
  const [total_marks, setTotalMarks] = useState(100);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/teacher/assignments");
        setAssignments(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load assignments.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selected = assignments.find(
    (a) => `${a.class_id}-${a.subject_id}` === assignmentKey
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Choose a class and subject.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await API.post("/teacher/exam", {
        title,
        class_id: selected.class_id,
        subject_id: selected.subject_id,
        exam_date: exam_date || null,
        start_time,
        duration: Number(duration),
        total_marks: Number(total_marks),
      });
      const id = res.data.exam_id;
      navigate(id ? `/teacher/exams/${id}` : "/teacher/exams");
    } catch (err) {
      setError(err.response?.data?.message || "Could not create exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create exam</h1>
      <p className="text-sm text-gray-500 mb-6">Choose one of your assigned class/subject pairs, then set schedule and marks.</p>

      {assignments.length === 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 rounded-lg">
          You have no class assignments. An admin must assign you to classes and subjects first.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam title</label>
          <input
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mid-term Mathematics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Class &amp; subject</label>
          <select
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
            value={assignmentKey}
            onChange={(e) => setAssignmentKey(e.target.value)}
          >
            <option value="">Select…</option>
            {assignments.map((a) => (
              <option key={a.id} value={`${a.class_id}-${a.subject_id}`}>
                {a.class_name} — {a.subject_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            value={exam_date}
            onChange={(e) => setExamDate(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              value={start_time}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
            <input
              type="number"
              min={1}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total marks</label>
          <input
            type="number"
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            value={total_marks}
            onChange={(e) => setTotalMarks(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || assignments.length === 0}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create and add questions"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/teacher/exams")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

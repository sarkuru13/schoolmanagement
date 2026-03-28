import { useEffect, useState } from "react";
import API from "../../api/axios";

export default function Results() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeExamId, setActiveExamId] = useState(null);

  const loadRows = async () => {
    const res = await API.get("/admin/results-release-list");
    setRows(res.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadRows();
      } catch (e) {
        setError(e.response?.data?.message || "Could not load exam results.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRelease = async (examId) => {
    setActiveExamId(examId);
    setError("");
    try {
      await API.post("/admin/release", { exam_id: examId });
      await loadRows();
    } catch (e) {
      setError(e.response?.data?.message || "Could not release this result.");
    } finally {
      setActiveExamId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading result release dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Result Release Dashboard</h1>
        <p className="text-sm text-gray-500 mt-2">
          Review submitted exams and release results to students when you are ready.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No exams found yet.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Exam</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Teacher</th>
                <th className="text-left px-4 py-3 font-semibold">Assigned</th>
                <th className="text-left px-4 py-3 font-semibold">Submitted</th>
                <th className="text-left px-4 py-3 font-semibold">Released</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const allReleased = Number(row.submitted_count) > 0 && Number(row.submitted_count) === Number(row.released_count);
                const canRelease = Number(row.submitted_count) > 0 && !allReleased;

                return (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{row.title}</p>
                        <p className="text-xs text-gray-500">
                          {row.subject_name} · {row.exam_date ? String(row.exam_date).slice(0, 10) : "No date"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{row.class_name}</td>
                    <td className="px-4 py-4 text-gray-700">{row.teacher_name || "Unassigned"}</td>
                    <td className="px-4 py-4 text-gray-700">{row.assigned_count}</td>
                    <td className="px-4 py-4 text-gray-900 font-semibold">{row.submitted_count}</td>
                    <td className="px-4 py-4 text-gray-700">{row.released_count}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          allReleased
                            ? "bg-green-100 text-green-700"
                            : Number(row.submitted_count) > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {allReleased ? "Released" : Number(row.submitted_count) > 0 ? "Ready to release" : "Waiting for submissions"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        disabled={!canRelease || activeExamId === row.id}
                        onClick={() => handleRelease(row.id)}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                      >
                        {activeExamId === row.id ? "Releasing..." : allReleased ? "Released" : "Release"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

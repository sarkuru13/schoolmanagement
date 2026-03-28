import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function TeacherExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const loadExams = async () => {
    const res = await API.get("/teacher/exams");
    setExams(res.data || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadExams();
      } catch (e) {
        setError(e.response?.data?.message || "Failed to load exams.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (examId, title) => {
    if (!window.confirm(`Delete exam "${title}"? This removes all questions and assignments.`)) return;
    setDeletingId(examId);
    setError("");
    try {
      await API.delete(`/teacher/exams/${examId}`);
      await loadExams();
    } catch (e) {
      setError(e.response?.data?.message || "Could not delete exam.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading exams…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">Create papers, add MCQs, and assign them to classes.</p>
        </div>
        <Link
          to="/teacher/exams/new"
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 shadow-sm"
        >
          + New exam
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {exams.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 mb-4">You have not created any exams yet.</p>
          <Link to="/teacher/exams/new" className="text-purple-600 font-semibold hover:underline">
            Create your first exam
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Subject</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Marks</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => (
                <tr key={ex.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-900 font-medium">{ex.title}</td>
                  <td className="px-4 py-3 text-gray-700">{ex.class_name}</td>
                  <td className="px-4 py-3 text-gray-700">{ex.subject_name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {ex.exam_date ? String(ex.exam_date).slice(0, 10) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ex.total_marks}</td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <Link
                      to={`/teacher/exams/${ex.id}`}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      Manage
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === ex.id}
                      onClick={() => handleDelete(ex.id, ex.title)}
                      className="text-red-600 font-semibold hover:underline disabled:opacity-50"
                    >
                      {deletingId === ex.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

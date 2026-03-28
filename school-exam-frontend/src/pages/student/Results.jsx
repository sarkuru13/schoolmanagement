import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api/axios";

export default function StudentResults() {
  const location = useLocation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/results");
        setRows(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load results.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading results…</p>
      </div>
    );
  }

  const flash = location.state;

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Results</h1>
      <p className="text-sm text-gray-500 mb-6">Scores are shown only after your school releases them.</p>

      {flash?.justSubmitted && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg">
          Exam submitted. Your score (pending release): <strong>{flash.score}</strong>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">
          No released results yet. Check back after your administrator publishes scores.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Exam</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Score</th>
                <th className="text-left px-4 py-3 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                  <td className="px-4 py-3 text-gray-700">{r.class_name || "—"}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{r.score}</td>
                  <td className="px-4 py-3 text-gray-600">{r.total_marks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

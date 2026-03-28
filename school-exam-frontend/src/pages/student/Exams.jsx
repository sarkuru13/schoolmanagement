import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function StudentExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get("/student/exams");
        setExams(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not load exams.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading exams…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My exams</h1>
      <p className="text-sm text-gray-500 mb-6">Exams your teachers have assigned to your class or to you.</p>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {exams.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">No exams assigned.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold">Class</th>
                <th className="text-left px-4 py-3 font-semibold">Subject</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-right px-4 py-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((e) => (
                <tr key={e.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.title}</td>
                  <td className="px-4 py-3 text-gray-700">{e.class_name}</td>
                  <td className="px-4 py-3 text-gray-700">{e.subject_name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.exam_date ? String(e.exam_date).slice(0, 10) : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/student/exams/${e.id}/take`}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Start
                    </Link>
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

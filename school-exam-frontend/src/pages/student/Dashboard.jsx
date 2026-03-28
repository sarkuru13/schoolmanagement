import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function StudentDashboardHome() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ex, res] = await Promise.all([API.get("/student/exams"), API.get("/student/results")]);
        setExams(ex.data || []);
        setResults(res.data || []);
      } catch {
        setExams([]);
        setResults([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome</h1>
      <p className="text-sm text-gray-500 mb-8">View assigned exams, take tests, and check published results.</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Assigned exams</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{exams.length}</p>
          <Link to="/student/exams" className="text-sm text-indigo-600 font-semibold mt-3 inline-block hover:underline">
            View all →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Released results</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{results.length}</p>
          <Link to="/student/results" className="text-sm text-indigo-600 font-semibold mt-3 inline-block hover:underline">
            View results →
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming &amp; open exams</h2>
        {exams.length === 0 ? (
          <p className="text-gray-500 text-sm">No exams assigned yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {exams.slice(0, 5).map((e) => (
              <li key={e.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {e.class_name} · {e.subject_name}
                  </p>
                </div>
                <Link
                  to={`/student/exams/${e.id}/take`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Take exam
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

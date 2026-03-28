import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function StudentDashboardHome() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentName = localStorage.getItem("userName") || "Student";

  useEffect(() => {
    (async () => {
      try {
        const [ex, res, sub] = await Promise.all([
          API.get("/student/exams"),
          API.get("/student/results"),
          API.get("/student/subjects"),
        ]);
        setExams(ex.data || []);
        setResults(res.data || []);
        setSubjects(sub.data || []);
      } catch {
        setExams([]);
        setResults([]);
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const averageScore = useMemo(() => {
    if (!results.length) return "-";
    const total = results.reduce((sum, row) => sum + Number(row.score || 0), 0);
    return (total / results.length).toFixed(1);
  }, [results]);

  if (loading) {
    return (
      <div className="p-6 sm:p-10">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Welcome</p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">{studentName}</h1>
        <p className="text-sm text-gray-500 mt-3 max-w-2xl">
          This is your exam dashboard. Open assigned exams, read the instructions carefully, and take the exam in fullscreen mode.
        </p>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link
            to="/student/exams"
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Go to my exams
          </Link>
          <Link
            to="/student/results"
            className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
          >
            View results
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
        <SimpleStat title="Assigned exams" value={exams.length} />
        <SimpleStat title="My subjects" value={subjects.length} />
        <SimpleStat title="Released results" value={results.length} />
        <SimpleStat title="Average score" value={averageScore} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">Assigned exams</h2>
            <Link to="/student/exams" className="text-sm font-semibold text-blue-600 hover:underline">
              Open all
            </Link>
          </div>

          {exams.length === 0 ? (
            <p className="text-sm text-gray-500">No exams assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {exams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="border border-gray-200 rounded-2xl p-4">
                  <p className="font-semibold text-gray-900">{exam.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {exam.class_name} · {exam.subject_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Date: {exam.exam_date ? String(exam.exam_date).slice(0, 10) : "Not scheduled"} · Duration:{" "}
                    {exam.duration || "-"} min
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Exam instructions</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="border border-gray-200 rounded-2xl p-4">
              Read all instructions before starting the exam.
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              Once you start, the exam moves into fullscreen mode.
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              Do not change tabs or leave fullscreen during the exam.
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              After 3 violations, the exam will be locked until unlocked by admin or teacher.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SimpleStat({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}

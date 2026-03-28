import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../api/axios";

export default function TeacherDashboardHome() {
  const [displayName] = useState(() => localStorage.getItem("userName") || "");
  const [stats, setStats] = useState({
    classes: 0,
    subjects: 0,
    students: 0,
    exams: 0,
    assignments: 0,
  });
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      try {
        const [statsRes, assignRes] = await Promise.all([
          API.get("/teacher/stats"),
          API.get("/teacher/assignments"),
        ]);
        if (cancelled) return;
        setStats({
          classes: statsRes.data.classes,
          subjects: statsRes.data.subjects,
          students: statsRes.data.students,
          exams: statsRes.data.exams,
          assignments: statsRes.data.assignments,
        });
        setAssignments(assignRes.data || []);
      } catch (e) {
        if (!cancelled) setError(e.response?.data?.message || "Could not load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-10 max-w-6xl mx-auto">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome back{displayName ? `, ${displayName}` : ", Teacher"}!
        </h1>
        <p className="text-sm text-gray-500 mt-2">Overview of your assignments and exams.</p>
      </div>

      {error && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Classes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.classes}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Subjects</p>
            <p className="text-2xl font-bold text-gray-900">{stats.subjects}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Students (in your classes)</p>
            <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center">
          <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mr-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Exams created</p>
            <p className="text-2xl font-bold text-gray-900">{stats.exams}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your class &amp; subject assignments</h2>
          <Link
            to="/teacher/exams/new"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
          >
            Create exam
          </Link>
        </div>
        {assignments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No assignments yet. Ask an administrator to assign you to classes and subjects.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 pr-4">Class</th>
                  <th className="pb-2 pr-4">Subject</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 text-gray-900">{a.class_name}</td>
                    <td className="py-2 text-gray-900">{a.subject_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
